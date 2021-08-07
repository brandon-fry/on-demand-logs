const supertest = require('supertest');
const app = require('../src/server');
const { existsSync } = require('fs');

const testFileName = 'OnDemandLogsApp_test.log';
const testFilePath = `/var/log/${testFileName}`;

describe('GET /logs/{filename}', () => {
    beforeAll(() => {
        // Ensure the test log file exists.
        if (!existsSync(testFilePath)) {
            throw new Error(`${testFilePath} does not exist!`)
        }
    });

    test('filename does not exist', () => {
        return supertest(app)
            .get(`/logs/.log`)
            .expect(404)
            .then((response) => {
                expect(response.body.code).toBe('ENOENT');
                expect(response.body.message);
            })
    });

    test('filename exists', () => {
        return supertest(app)
            .get(`/logs/${testFileName}`)
            .expect(200)
            .then((response) => {
                expect(response.body.events)
            })
    });

    test('return n events', async () => {
        // Test valid values
        await supertest(app)
            .get(`/logs/${testFileName}?count=0`)
            .expect(200)
            .then((response) => {
                expect(response.body.events);
                expect(response.body.events.length).toBe(0);
            })
        await supertest(app)
            .get(`/logs/${testFileName}?count=10`)
            .expect(200)
            .then((response) => {
                expect(response.body.events);
                expect(response.body.events.length).toBe(10);
            })
        await supertest(app)
            .get(`/logs/${testFileName}?count=1000`)
            .expect(200)
            .then((response) => {
                expect(response.body.events);
                expect(response.body.events.length).toBe(1000);
            })

        // Test invalid values
        await supertest(app)
            .get(`/logs/${testFileName}?count=-1`)
            .expect(400)
            .then((response) => {
                expect(response.body.code);
                expect(response.body.message);
            })
        await supertest(app)
            .get(`/logs/${testFileName}?count=test`)
            .expect(400)
            .then((response) => {
                expect(response.body.code).toBe('EINVAL');
                expect(response.body.message);
            })
    });

    test('return filtered events', async () => {
        // Test valid values
        await supertest(app)
            .get(`/logs/${testFileName}?filter=GET`)
            .expect(200)
            .then((response) => {
                expect(response.body.events);
                response.body.events.forEach((event) => {
                    expect(event.raw).toMatch('GET')
                })
            })

        // Test unexpected values
        await supertest(app)
            .get(`/logs/${testFileName}?filter=`)
            .expect(200)
            .then((response) => {
                expect(response.body.events);
                response.body.events.forEach((event) => {
                    expect(event.raw).toMatch('')
                })
            })

        // Test invalid values
        await supertest(app)
            .get(`/logs/${testFileName}?filter=*`)
            .expect(400)
            .then((response) => {
                expect(response.body.code).toBe('EINVAL');
                expect(response.body.message);
            })
    });

    test('return n filtered events', async () => {
        // Test valid values
        await supertest(app)
            .get(`/logs/${testFileName}?count=1&filter=GET`)
            .expect(200)
            .then((response) => {
                expect(response.body.events);
                expect(response.body.events.length).toBe(1);
                expect(response.body.events[0].raw).toMatch('GET');
            })

        // Test unexpected values
        await supertest(app)
            .get(`/logs/${testFileName}?count=5&filter=`)
            .expect(200)
            .then((response) => {
                expect(response.body.events);
                expect(response.body.events.length).toBe(5);
                expect(response.body.events[0].raw).toMatch('');
            })

        await supertest(app)
            .get(`/logs/${testFileName}?count=0filter=`)
            .expect(200)
            .then((response) => {
                expect(response.body.events);
                expect(response.body.events.length).toBe(0);
            })
    });

    test('reverse chronological order', async () => {
        await supertest(app)
            .get(`/logs/${testFileName}?count=10000`)
            .expect(200)
            .then((response) => {
                expect(response.body.events);
                // These tests are fully dependent on the test log data.
                expect(response.body.events.length).toBe(10000);
                expect(response.body.events[0].raw).toMatch('[20/May/2015:21:05:59 +0000]');
                expect(response.body.events[9999].raw).toMatch('[17/May/2015:10:05:00 +0000]');
            })
    });
});