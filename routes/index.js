var express = require('express');
var router = express.Router();

const { auth, required_auth } = require('../middleware/auth')
const { get_countries, get_volcanoes,
  get_volcano_details , get_country_tallest_vol,
  post_volcano_details } = require('../middleware/db')

const { param } = require('express-validator');
const { input_validate, post_volcano_body_validate } = require('../middleware/validation')

router.get("/countries", 
  get_countries,
  (req, res, next) => {
    res.status(200).send(req.data)
});

router.get("/volcanoes", 
  get_volcanoes,
  (req, res, next) => {
    res.status(200).json(req.data)
});

router.get("/volcanoes/:id", 
  input_validate([
    param('id').notEmpty(),
    param('id').isInt()
  ]),
  auth, 
  get_volcano_details,
  (req, res, next) => {
    res.status(200).json(req.data)
});

router.post("/volcanoes/:id", 
  input_validate([
    param('id').notEmpty(),
    param('id').isInt()
  ]),
  required_auth, 
  post_volcano_body_validate,
  post_volcano_details,
  (req, res, next) => {
    res.status(200).json({ message: "Successfully updated volcano details" })
});

router.get("/volcanoes/tallest/:country", 
  input_validate([
    param('country').notEmpty(),
    param('country').isString()
  ]),
  auth,
  get_country_tallest_vol,
  (req, res, next) => {
    res.status(200).json(req.data)
  }
)

module.exports = router;
