"use strict";

/** Routes for company invoice database */

const express = require("express");
//const { application_name } = require("pg/lib/defaults");
const db = require("./db");
const { NotFoundError } = require("./expressError");

const router = new express.Router();

/** Return info on invoices */
router.get("/", async function (req, res) {
  const result = await db.query(`SELECT comp_code,
                                        amt,paid,add_date,paid_date
                                FROM invoices`);
  const invoices = result.rows;
  return res.json({ invoices });
});

/** Return obj on given invoice return 404 if not found */
router.get("/:id", async function (req, res) {
  const id = req.params.id;

  const invoiceResults = await db.query(
    // can use a JOIN statement
    `SELECT id,amt,paid,add_date,paid_date, comp_code as company FROM invoices WHERE id = $1`,
    [id]
  );
  const invoice = invoiceResults.rows[0];

  if (!invoice) {
    throw new NotFoundError();
  }

  const companyResults = await db.query(
    `SELECT code,name,description FROM companies WHERE code = $1`,
    [invoice.company]
  );

  const company = companyResults.rows[0];

  invoice.company = company;

  return res.json(invoice);
});

/** Adds an invoice */
router.post("/", async function (req, res) {
  const { comp_code, amt } = req.body;

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
           VALUES ($1, $2)
           RETURNING comp_code, amt`,
    [comp_code, amt]
  );

  const invoice = result.rows[0];
  return res.status(201).json({ invoice });
});

/** Updates an invoice */
router.put("/:id", async function (req, res) {
  const { amt } = req.body;

  const result = await db.query(
    `UPDATE invoices
          SET amt = $1
           WHERE id = $2
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, req.params.id]
  );

  const invoice = result.rows[0];
  if (!invoice) {
    throw new NotFoundError(`Invoice ${req.params.id} not found!`);
  }
  return res.json({ invoice });
});

/** Deletes company object based on code parameter */
router.delete("/:id", async function (req, res) {
  const result = await db.query(
    "DELETE FROM invoices WHERE id = $1 RETURNING id",
    [req.params.id]
  );

  if (!result.rows[0]) {
    throw new NotFoundError(`Invoice ${req.params.id} not found!`);
  }

  return res.json({ status: "deleted" });
});

module.exports = router;
