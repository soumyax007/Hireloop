const { getDb } = require('./backend/src/db');
console.log(getDb().prepare('SELECT role FROM users LIMIT 1').get());
