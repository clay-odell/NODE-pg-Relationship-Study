const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async function (req, res, next) {
  //returns information on invoices
  try {
    const result = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, add_date, paid_date FROM invoices`
    );
    return res.status(200).json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  //gets an invoice by id or returns 404
  try {
    const { id } = req.params;
    const invoiceResult = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, comp_code, companies.name, companies.description FROM invoices
            JOIN companies ON invoices.comp_code = companies.code
            WHERE id = $1`,
      [id]
    );
    if (invoiceResult.rows.length === 0) {
      throw new ExpressError("Invoice Not Found", 404);
    }
    return res.status(200).json({ invoice: invoiceResult.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  //adds an invoice and returns id, comp_code, amt, paid, ...
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date `,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", async function (req, res, next) {
  //updates the amt of an invoice by id or returns 404
  try {
    const { id } = req.params;
    const { amt } = req.body;
    const invoiceResult = await db.query(
      `UPDATE invoices SET amt=$1
            WHERE id = $2
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, id]
    );
    if (invoiceResult.rows.length === 0) {
      throw new ExpressError(`'${id}' not found`, 404);
    }
    return res.status(200).json({ invoice: invoiceResult.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;
    const result = await db.query(
        `DELETE FROM invoices
        WHERE id = $1`,
        [id]
    );
    if (result.rowCount === 0) {
        throw new ExpressError (`Invoice for '${id}' not found`, 404);
    }
    return res.status(200).json({message: "deleted"});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
