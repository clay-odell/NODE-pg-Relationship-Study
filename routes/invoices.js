const express = require('express');
const ExpressError = require('../expressError')
const router = express.Router();
const db = require('../db');

router.get('/', async function (req, res, next) {
    //returns information on invoices
    try {
        const result = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, add_date, paid_date FROM invoices`
        );
        return res.status(200).json({invoices: result.rows});
    } catch (err) {
        return next(err);
    }
});





module.exports = router;
