const supertest = require('supertest');
const app = require('../server');
const { existsSync } = require('fs');

const testFileName = 'OnDemandLogsApp_test.log';
const testFilePath = `/var/log/${testFileName}`;

describe('GET /logs', () => {
    beforeAll(() => {
        // Ensure the filename exists.
        if (!existsSync(testFilePath)) {
            throw new Error(`${testFilePath} does not exsist!`)
        }
    });

    test('filename does not exist', async () => {
        return supertest(app)
            .get(`/logs/.log`)
            .expect(404)
    });

    test('filename exists', async () => {
        return supertest(app)
            .get(`/logs/${testFileName}`)
            .expect(200)
    });
});