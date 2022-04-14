"use strict";

/** Database setup for BizTime. */

const { Client } = require("pg");

const DB_URI =
  process.env.NODE_ENV === "test"
    ? "postgresql:///biztime_test"
    : "postgresql:///biztime";

let db = new Client({
  connectionString: DB_URI,
});

// const db = new Client({
//   host: 'localhost',
//   port: 5432,
//   user: 'lynecha',
//   password: '',
//   database : 'biztime'
// })


db.connect();

module.exports = db;
