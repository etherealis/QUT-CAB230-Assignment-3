const { validationResult, body, param } = require('express-validator');

const input_validate = validations => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    } 
    res.status(400).json({ 
        error: true, 
        message: "Request body has invalid parameters or is incomplete."
    });
    
  };
};

const put_profile_body_validate = async (req, res, next) => {

    // InvalidEmailParam error
    const isEmail_req_copy = {...req}
    await param('email').isEmail().run(isEmail_req_copy)
    const email_error = validationResult(isEmail_req_copy).array();

    if(email_error.length > 0) return res.status(400).json({
        error: true, 
        message: "Request body has invalid parameters or is incomplete."
    })

    // InvalidProfileBodyFormat error
    const isEmpty_req_copy = {...req}
    await body(['firstName', 'lastName', 'dob', 'address']).notEmpty().run(isEmpty_req_copy)
    const empty_error = validationResult(isEmpty_req_copy).array();

    if(empty_error.length > 0) return res.status(400).json({
        error: true, 
        message: "Request body incomplete: firstName, lastName, dob and address are required."
    })

    // InvalidFirstNameLastNameAddressFormat error
    const isString_req_copy = {...req}
    await body(['firstName', 'lastName', 'address']).isString().run(isString_req_copy)
    const string_error = validationResult(isString_req_copy).array();

    if(string_error.length > 0) return res.status(400).json({
        error: true, 
        message: "Request body invalid: firstName, lastName and address must be strings only."
    }) 

    // InvalidProfileDateFormat error
    const isDate_req_copy = {...req}
    await body('dob').isDate({format: "yyyy-mm-dd", delimiters: ['-']}).run(isDate_req_copy)
    const date_error = validationResult(isDate_req_copy).array();

    if(date_error.length > 0) return res.status(400).json({
        error: true, 
        message: "Invalid input: dob must be a real date in format YYYY-MM-DD."
    }) 

    // InvalidProfileDate error
    const isBefore_req_copy = {...req}
    await body('dob').isBefore().run(isBefore_req_copy)
    const before_error = validationResult(isBefore_req_copy).array();

    if(before_error.length > 0) return res.status(400).json({
        error: true, 
        message: "Invalid input: dob must be a date in the past."
    })

    next()
}

const post_volcano_body_validate = async (req, res, next) => {
  const values = req.body
  const string_values = []
  const num_values = []

  // String inputs
  if(values.name != undefined) string_values.push('name')
  if(values.country != undefined) string_values.push('country')
  if(values.region != undefined) string_values.push('region')
  if(values.subregion != undefined) string_values.push('subregion')
  if(values.last_eruption != undefined) string_values.push('last_eruption')
  if(values.latitude != undefined) string_values.push('latitude')
  if(values.longitude != undefined) string_values.push('longitude')

  // Numeric inputs
  if(values.summit != undefined) num_values.push("summit")
  if(values.elevation != undefined) num_values.push("elevation")
  if(values.population_5km != undefined) num_values.push("population_5km")
  if(values.population_10km != undefined) num_values.push("population_10km")
  if(values.population_30km != undefined) num_values.push("population_30km")
  if(values.population_100km != undefined) num_values.push("population_100km")

  // InvalidStringParams error
  const isString_req_copy = {...req}
  await body(string_values).isString().run(isString_req_copy)
  const string_error = validationResult(isString_req_copy).array();

  if(string_error.length > 0) return res.status(400).json({
      error: true, 
      message: "Invalid string parameter values provided in body"
  })

  // InvalidNumericParams error
  const isInt_req_copy = {...req}
  await body(num_values).isInt().run(isInt_req_copy)
  const numeric_error = validationResult(isInt_req_copy).array();

  if(numeric_error.length > 0) return res.status(400).json({
      error: true, 
      message: "Invalid numeric parameter values provided in body"
  })

  next()
}

module.exports = { 
  input_validate, 
  put_profile_body_validate,
  post_volcano_body_validate
};