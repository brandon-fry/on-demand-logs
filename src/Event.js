/**
 * Represents an individual log event
 */
class Event {
    constructor(eventString) {
        this.raw = eventString;
        this.msSinceEpoch = this.extractTimeStamp();
    }

    /**
     * Provides custom serialization so that the Event response structure can be controlled.
     * @returns {object} Object to serialize.
     */
    toJSON() {
        // Currently, only the "raw" property is returned in the APIs Event responses.
        return { raw: this.raw }
    }

    /**
     * Attempts to extract a timestamp from the provided string.
     * @returns {integer} ms since epoch if successful, NaN otherwise.
     */
    extractTimeStamp() {
        // Date.parse() will not work for the timestamp format of the expected log files.
        // Extract out the date and time groups and manually set them.
        const ts = this.raw.match(/\[(\d*\/.*\/\d{4}):(\d{2}:\d{2}:\d{2} .*)\]/);
        if (ts.length > 2) {
            // This will return 'NaN' if the date could not be parsed.
            return Date.parse(`${ts[1]} ${ts[2]}`);
        }

        // Failed to extract a time stamp
        return NaN;
    }
}

module.exports = Event;