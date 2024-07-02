const { Client } = require('pg');
let DB_URI;
if (process.env.NODE_ENV === 'test') {
    DB_URI = 'postgresql://postgres:01302@localhost/biztime_test';
} else {
    DB_URI = 'postgresql://postgres:01302@localhost/biztime';
}

let db = new Client({
    connectionString: DB_URI
});

db.connect();
module.exports = db;
