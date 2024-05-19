var express = require('express');
var router = express.Router();

const { body, param } = require('express-validator');

const { auth, required_auth } = require('../middleware/auth')
const { input_validate, put_profile_body_validate } = require('../middleware/validation')
const { post_login, post_register, get_profile, put_profile } = require('../middleware/db')

router.get("/all", (req, res, next) => {
  req.db  
    .from('users')
    .select("*")
    .then(result => res.status(200).json(result))
})

router.get("/admin", (req, res, next) => {
  res.status(200).json({ admin_secret: process.env.ADMIN_SECRET })
})

router.post('/login',
  input_validate([
    body('email').notEmpty(),
    body('email').isEmail(),
    body('password').notEmpty()
  ]),
  post_login,
  (req, res, next) => {
    res.status(200).json({ 
      token: req.token,
      token_type: req.token_type, 
      expires_in: 86400
    });
});

router.post('/register',  
  input_validate([
    body('email').notEmpty(),
    body('email').isEmail({
      require_tld: false, 
      ignore_max_length: true, 
    }),
    body('password').notEmpty()
  ]),
  post_register,
  (req, res, next) => {
    res.status(201).json({message: "Created"})
});

router.get('/:email/profile',  
  input_validate([
    param('email').notEmpty(),
    param('email').isEmail(),
  ]),
  auth,
  get_profile,
  (req, res, next) => {
    res.status(200).json(req.data)
});

router.put('/:email/profile',
  put_profile_body_validate,
  required_auth,  
  put_profile,
  (req, res, next) => {
    res.status(200).send(req.body)
  }
)

module.exports = router;
