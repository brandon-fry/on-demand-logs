const Event = require('./Event');
const fs = require('fs/promises');

/** 
 * Design Assumptions:
 *   1. Log files with a timestamp format matching [20/May/2015:21:05:01 +0000] will be sorted.
 *   2. Log files without a timestamp or a different format will use the event ordering of the file
 *        and assume that the last event in the file is the newest.
 *   3. Each line in the log represents a single "event".
 *   4. Files will be UTF-8 encoded.
 * 
 * Limitations:
 *   1. Since the entire file is read into memory. The size of the log file that can be read is limited
 *        by the system's memory.
 */

/**
 * Reads the provided file and extracts events.
 * @param {string} filePath The full path of the log file to read.
 * @param {integer} count The maximum number of events to return.
 * @param {string} filter Keyword to match and return events for.
 * @throws {Error}
 * @returns {Event[]} List of events extracted from file.
 */
async function parseLog(
    filePath,
    count,
    filter
) {
    const fileContents = await fs.readFile(filePath, "utf8");
    const lines = fileContents.split(/[\r\n]/);

    if (count == null) {
        // count was not set (undefined or null), return all events
        count = lines.length;
    }

    // Extract timestamps and data from the file contents.
    let events = [];
    let validTimestamps = true;
    for (let i = 0; i < lines.length; ++i) {
        const event = new Event(lines[i]);
        if (Number.isNaN(event.msSinceEpoch)) {
            validTimestamps = false;
        }

        events.push(event);
    }

    // Sort the events chronologically if timestamp data can be used. Otherwise,
    // leave in the order obtained from the file.
    if (validTimestamps) {
        events.sort((first, second) => first.msSinceEpoch - second.msSinceEpoch);
    }

    // Start from the tail/end of the sorted events list and build return list, 
    // respecting the count and filter props.
    let returnEvents = [];
    let i = lines.length - 1;
    const regex = new RegExp(filter);
    while (returnEvents.length < count && i >= 0) {
        if (filter) {
            regex.test(events[i].raw) && returnEvents.push(events[i]);
        } else {
            returnEvents.push(events[i]);
        }

        --i;
    }

    return returnEvents;
}

module.exports = { parseLog };