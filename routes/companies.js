const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async function (req, res, next){
    //returns a list of the companies from the DB
    try {
        const result = await db.query(
            `SELECT code, name FROM companies`
        );
        return res.json({companies: result.rows});
    } catch (err){
        return next(err);
    }
});
router.get('/:code', async function (req, res, next) {
    //returns company code, name, and description if it exists, and a 404 if not
    try {
        const { code } = req.params;
        const result = await db.query(
            `SELECT * FROM companies WHERE code = $1`, [code]
        );
        if (result.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code ${code}`, 404);
        }
        return res.json({company: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.post('/', async function (req, res, next) {
    //Posts code, name, and description and returns 201 and JSON for the post
    try{
        const {code, name, description} = req.body;
        const result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]
        );
        return res.status(201).json(result.rows[0]);

    } catch (err) {
        return next (err);
    }
});

router.put('/:code', async function (req, res, next) {
    try {
        const {name, description } = req.body;
        const result = await db.query(
            `UPDATE companies SET name=$1, description=$2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, req.params.code]
        );
        if (result.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code ${code}`, 404);
        }
        return res.status(201).json(result.rows[0])
    } catch (err) {
        return next(err);
    }
})

module.exports = router;