const Event = require('./Event');
const fs = require('fs/promises');

/**
 * Design Assumptions:
 *   1. Any requested log file will already be sorted with the newest log at the end of the file and oldest at beginning.
 *      - This prevents the need to extract a valid timestamp from queried logs
 *   2. Each line in the log represents a single "event".
 */

/**
 * Reads the the provided file and extracts events.
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
    let events = [];

    const fileContents = await fs.readFile(filePath, "utf8");
    const lines = fileContents.split(/[\r\n]/);

    if (count == null) {
        // count was not set (undefined or null), return all events
        count = lines.length;
    }

    // Start from the tail/end of the file to order events from newest to oldest
    let i = lines.length - 1;
    while (events.length < count && i >= 0) {
        if (filter) {
            lines[i].match(filter) && events.push(new Event(lines[i]));
        } else {
            events.push(new Event(lines[i]));
        }

        --i;
    }

    return events;
}

module.exports = { parseLog };