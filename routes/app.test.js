process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');

let testCompany;
beforeEach(async () => {
    const result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ('testcompany', 'Test Company', 'This is a test company')
        RETURNING code, name, description`
    );
    testCompany = result.rows[0];
});

afterAll(async () => {
    await db.end();
})