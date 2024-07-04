const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async function (req, res, next) {
  //returns a list of the companies from the DB
  try {
    const result = await db.query(
      `SELECT code, name, description FROM companies`
    );
    return res.json({ companies: result.rows });
  } catch (err) {
    return next(err);
  }
});
router.get("/:code", async function (req, res, next) {
  try {
    const { code } = req.params;
    const companyResult = await db.query(
      `SELECT code, name, description FROM companies
            WHERE code = $1`,
      [code]
    );
    if (companyResult.rows.length === 0) {
      throw new ExpressError(`Company with code '${code}' not found`, 404);
    }
    const invoiceResult = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices
            WHERE comp_code = $1`,
      [code]
    );
    const company = companyResult.rows[0];
    company.invoices = invoiceResult.rows;

    return res.status(200).json({ company: company });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  //Posts code, name, and description and returns 201 and JSON for the post
  try {
    const { code, name, description } = req.body;
    const result = await db.query(
      `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
      [code, name, description]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
        throw new ExpressError(`Company with '${code}' already exists`, 400);
    } else {
    return next(err);
    }
  }
});

router.put("/:code", async function (req, res, next) {
  //updates an existing company in the database and returns JSON or else 404
  try {
    const { name, description } = req.body;
    const result = await db.query(
      `UPDATE companies SET name=$1, description=$2
            WHERE code = $3
            RETURNING code, name, description`,
      [name, description, req.params.code]
    );
    if (result.rows.length === 0) {
      throw new ExpressError(
        `Cannot find company with code ${req.params.code}`,
        404
      );
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete("/:code", async function (req, res, next) {
  //deletes company from database if it exists otherwise, 404
  try {
    const result = await db.query(
      `DELETE FROM companies
            WHERE code = $1`,
      [req.params.code]
    );
    if (result.rowCount === 0) {
      throw new ExpressError(
        `Cannot delete company with code '${req.params.code}' because no such code exists`,
        404
      );
    }
    return res.status(200).json({ message: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
