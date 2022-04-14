"use strict";

/** Routes for company database */

const express = require("express");
const db = require("./db");
const { NotFoundError } = require("./expressError");

const router = new express.Router();

/** Return a list of companies */
router.get("/", async function (req, res) {
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;
  return res.json({ companies });
});

/** Gets a company object based on its code and returns it*/
router.get("/:code", async function (req, res) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description FROM companies WHERE code = $1`,
    [code]
  );
  const company = results.rows[0];

  if (company === undefined) {
    throw new NotFoundError();
  }
  return res.json({ company });
});

/** Adds a new company and returns it */
router.post("/", async function (req, res) {
  const { code, name, description } = req.body;

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
           VALUES ($1, $2, $3)
           RETURNING code, name, description`,
    [code, name, description]
  );

  const company = result.rows[0];
  return res.status(201).json({ company });
});

/** Updates an existing company object and returns the updated company object */
router.put("/:code", async function (req, res) {
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
          SET name = $1,
              description = $2
           WHERE code = $3
           RETURNING code, name, description`,
    [name, description, req.params.code]
  );

  const company = result.rows[0];
  if (!company) {
    throw new NotFoundError(`Company ${req.params.code} not found!`);
  }
  return res.json({ company });
});

/** Deletes company object based on code parameter */
router.delete("/:code", async function (req, res) {
  const result = await db.query(
    "DELETE FROM companies WHERE code = $1 RETURNING code",
    [req.params.code]
  );

  // const query = await db.query("SELECT code FROM companies WHERE code = $1 ", [
  //   req.params.code,
  // ]);

  if (!result.rows[0]) {
    throw new NotFoundError(`Company ${req.params.code} not found!`);
  }

  return res.json({ status: "deleted" });
});

module.exports = router;
