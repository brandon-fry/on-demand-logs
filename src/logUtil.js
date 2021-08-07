const Event = require('./Event');
const fsPromises = require('fs/promises');
const fs = require('fs');

/** 
 * Design Assumptions:
 *   1. Log files with a timestamp format matching [20/May/2015:21:05:01 +0000] will be sorted.
 *   2. Log files without a timestamp or a different format will use the event ordering of the file
 *        and assume that the last event in the file is the newest.
 *   3. Each line in the log represents a single "event".
 *   4. Files will be UTF-8 encoded.
 */

/**
 * Reads the provided file and extracts events.
 * @param {string} filePath Required. The full path of the log file to read.
 * @param {integer} count Required. The maximum number of events to return.
 * @param {string} filter Optional. Keyword to match and return events for.
 * @throws {Error}
 * @returns {Promise<Event[]>} Resolves to a list of events extracted from file.
 *   Rejects with an Error object.
 */
async function parseLog(
    filePath,
    count,
    filter
) {
    if (count == null || count === 0) {
        // count must be greater than 0
        return [];
    }

    const lines = await readLastLines(filePath, count, filter);

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

    // Sort the events reverse chronologically if timestamp data can be used. Otherwise,
    // leave in the order obtained from the file.
    if (validTimestamps) {
        events.sort((first, second) => second.msSinceEpoch - first.msSinceEpoch);
    }

    return events;
}

/**
 * Gets lines from the provided file starting at the end.
 * @param {string} filePath Required. The full path of the log file to read.
 * @param {integer} count Required. The maximum number of lines to return.
 * @param {string} filter Optional. Keyword to match and return lines for.
 * @returns {Promise<string[]>} Resolves to a list of lines sorted with last file line
 *   at the beginnig of list. Rejects with an Error object.
 */
async function readLastLines(
    filePath,
    count,
    filter
) {
    if (count == null) {
        return Promise.reject(new Error("Count parameter is required"))
    } else if (count === 0) {
        return Promise.resolve([]);
    }

    let stats; // fs.Stats
    try {
        stats = await fsPromises.stat(filePath);
    } catch (err) {
        return Promise.reject(err);
    }

    return new Promise((resolve, reject) => {
        let tailPosition = stats.size;
        let returnLines = [];
        let leftOver = '';
        const regex = new RegExp(filter);
        const opts = {
            highWaterMark: 64 * 1024, // Buffer size
            fs: {
                open: (...args) => { fs.open(...args) },
                close: (...args) => { fs.close(...args) },
                read: (fd, buffer, offset, length, position, callback) => {
                    // Ensure we don't read past the previous starting position when we reach the beginning
                    // of the file. E.g. previous position was 100, but length (buffer size) is 64 * 1024.
                    length = Math.min(length, tailPosition);

                    // Override createReadStream's normal position parameter to work backwards from the file tail
                    tailPosition = Math.max(0, tailPosition - length);

                    fs.read(fd, buffer, offset, length, tailPosition, callback);
                }
            }
        }

        // Use createReadStream's implementation, except override the file read behavior so that
        // the file can be read backwards in chunks.
        const readable = fs.createReadStream(filePath, opts);
        readable.on('error', reject);
        readable.on('data', (chunk) => {
            chunk = chunk + leftOver;
            let lines = chunk.split(/[\r\n]/)
            lines = lines.filter((line) => {
                // Filter out blank lines and lines that do not match filter
                return line.length > 0 && regex.test(line)
            });

            if (tailPosition === 0) {
                // Reached beginning of file
                returnLines.unshift(...lines);
                readable.close();
            } else {
                // Store off the first string from the data as it may not be complete
                leftOver = lines.shift();

                // Add lines to front of list since we're stepping backwards in chunks
                returnLines.unshift(...lines);

                if (returnLines.length >= count) {
                    // Reached line count
                    readable.close();
                }

            }
        });
        readable.on('close', () => {
            // Ensure count is correct
            returnLines = returnLines.slice(-count);

            // Reverse the list so that the last line from the file is first in the list
            returnLines = returnLines.reverse();

            resolve(returnLines);
        });
    });
}

module.exports = { parseLog };