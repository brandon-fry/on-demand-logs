# On Demand Logs

## Usage

To get all log events for a specific file at /var/log:<br />
GET http://localhost:3000/logs/sample.log

To get all events matching a specific keyword:<br />
GET http://localhost:3000/logs/sample.log?filter=keyword

To get a set number of events:<br />
GET http://localhost:3000/logs/sample.log?count=100

## Demo UI

Start the demo server

```bash
npm run start
```

Go to http://localhost:3000/ in a browser.

Required: Fill in "filename" input field with a filename to search /var/log for.<br />
Optional: Fill in "count" input field.<br />
Optional: Fill in "filter" input field.<br />
Press "Submit" button and view results in the page.<br />

## Testing

#### Setup

Before running tests, copy tests/OnDemandLogsApp_test.log to /var/log/OnDemandLogsApp_test.log

#### Running Locally

```bash
npm run start
```

#### Run Tests

```bash
npm run test
```
