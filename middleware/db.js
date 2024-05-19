const jwt = require('jsonwebtoken')
const crypto = require('crypto')

/** ==============================
 * Users router request validation
 */

const post_login = (req, res, next) => {

    // InvalidParametersProfile error
    if(Object.keys(req.query).length !== 0) return res.status(400).json({ 
        error: true, 
        message: "Invalid query parameters. Query parameters are not permitted." 
    });

    const email = req.body.email
    const password = req.body.password

    req.db 
    .from("users")
    .select("email", "password")
    .where({
        email: email,
        password: password
    })
    .then(result => {

        if(result.length == 0) return res.status(401).json({
            error: true, 
            message: "Incorrect email or password."
        })

        // 24h
        const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24);
        const token = jwt.sign(
            { email: email, exp: exp }, 
            process.env.ACCESS_TOKEN_SECRET
        )

        req.token = token
        req.token_type = "Bearer"

        return next() 
    })
}

const post_register = (req, res, next) => {
    
    // InvalidParametersProfile error
    if(Object.keys(req.query).length !== 0) return res.status(400).json({ 
        error: true, 
        message: "Invalid query parameters. Query parameters are not permitted." 
    });

    req.db 
    .from("users")
    .select("email")
    .where({email: req.body.email })
    .then(result => {
        if(result.length == 0){
            req.db.from('users').insert(req.body)
            .then(result => { return next()})
            .catch(e => res.status(400).json({error: true, message: e}))
        } else {
            return res.status(409).json({error: true, message: "User already exists"})
        }
    })
}

const get_profile = (req, res, next) => {

    // InvalidParametersProfile error
    if(Object.keys(req.query).length !== 0) return res.status(400).json({ 
        error: true, 
        message: "Invalid query parameters. Query parameters are not permitted." 
    });

    const authorised = req.authorised
    const param_email = req.params.email

    if(!authorised) {
        req.db
        .from('users')
        .select('email', 'firstName', 'lastName')
        .where('email', param_email)
        .then(result => {
            if(result.length == 0) return res.status(404).json({
                error: true,
                message: "User not found"
            })
            req.data = result[0]
            return next()
        })
    } else {
        const auth_email = req.user != null ? req.user.email : null

        // check if the authorised user is the same user
        // as the account specified in the get req
        if(auth_email != param_email) { 
            req.db
            .from('users')
            .select('email', 'firstName', 'lastName')
            .where('email', param_email)
            .then(result => {
                if(result.length == 0) return res.status(404).json({
                    error: true,
                    message: "User not found"
                })
                req.data = result[0]
                return next()
            })
        } else {
            req.db
            .from('users')
            .select('*')
            .where('email', param_email)
            .then(result => {
                if(result.length == 0) return res.status(404).json({
                    error: true,
                    message: "User not found"
                })
                req.data = result[0]
                return next()
            })
        }
    }
}

const put_profile = (req, res, next) => {

    // InvalidParametersProfile error
    if(Object.keys(req.query).length !== 0) return res.status(400).json({ 
        error: true, 
        message: "Invalid query parameters. Query parameters are not permitted." 
    });

    const param_email = req.params.email
    const auth_email = req.user.email

    // check if the authorised user is the same user
    // as the account specified in the get req
    if(auth_email != param_email) { 
        res.status(403).json({
            error: true,
            message: "Forbidden"
        })
    } else {
        req.db
        .from('users')
        .select('*')
        .where('email', auth_email)
        .update(req.body)
        .then(result => {
            if(result != 1){
                return res.status(400).json({ error: true, message: "Database error" });            
            }
            // successful update
            req.body.email = auth_email
            return next()
        })
    }
    
}

/** ==============================
 * Volcanoes router request validation
 */

const get_countries = (req, res, next) => {

    // InvalidParametersProfile error
    if(Object.keys(req.query).length !== 0) return res.status(400).json({ 
        error: true, 
        message: "Invalid query parameters. Query parameters are not permitted." 
    });

    req.db
    .distinct("country")
    .from("data")
    .orderBy('country', 'asc')
    .then(rows => {
        let countries_arr = []

        rows.forEach(r => countries_arr.push(r.country));
        req.data = countries_arr
    
        return next()
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({ error: true, message: "Database error" });
    });
}

const get_volcanoes = (req, res, next) => {

    // MissingCountryParameterVolcanoes error
    if(req.query.country == undefined) return res.status(400).json({
        error: true,
        message: "Country is a required query parameter."
    })

    // InvalidParametersVolcanoes error
    let err = false
    Object.keys(req.query).forEach(param => {
        if(param != "country" && param != "populatedWithin") err = true
    })

    if(err) return res.status(400).json({
        error: true,
        message: "Invalid query parameters. Only country and populatedWithin are permitted."
    })

    // InvalidPopulatedWithinParameterVolcanoes error
    if(!['5km', '10km', '30km', '100km'].includes(req.query.populatedWithin) 
        && req.query.populatedWithin != undefined) return res.status(400).json({
        error: true,
        message: "Invalid value for populatedWithin. Only: 5km, 10km, 30km, 100km are permitted."
    })

    const country = req.query.country
    const populatedWithin = req.query.populatedWithin

    if(!populatedWithin){
        req.db
        .from("data")
        .select("id", "name", "country", "region", "subregion")
        .where("country", country)
        .then(result => {
            req.data = result
            return next()
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: true, message: "Database error" });            
        });
    } else {
        req.db
        .from('data')
        .select("id", "name", "country", "region", "subregion")        
        .where('country', country)
        .andWhere('population_'+populatedWithin, '>', 0)
        .then(result => {
            req.data = result
            return next()
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: true, message: "Database error" });        
        });
    }
}

const get_volcano_details = (req, res, next) => {

    // InvalidParametersProfile error
    if(Object.keys(req.query).length !== 0) return res.status(400).json({ 
        error: true, 
        message: "Invalid query parameters. Query parameters are not permitted." 
    });

    const volcano_id = req.params.id
    const authorised = req.authorised

    if(!authorised){
        req.db
        .from("data")
        .where("id", volcano_id)
        .select("id", "name", "country", "region", "subregion",
            "last_eruption", "summit", "elevation", "latitude", "longitude")
        .then(result => {
            if(result.length == 0) return res.status(404).json({
                error: true,
                message: "Volcano with ID: " + volcano_id + " not found."
            })

            req.data = result
            return next()
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ error: true, message: "Database error" });          
        });
    } else {
        req.db
        .from("data")
        .where("id", volcano_id)
        .select("id", "name", "country", "region", "subregion",
          "last_eruption", "summit", "elevation", "latitude", "longitude",
          "population_5km", "population_10km", "population_30km", "population_100km")
        .then(result => {
            if(result.length == 0) return res.status(404).json({
                error: true,
                message: "Volcano with ID: " + volcano_id + " not found."
            })

            req.data = result
            return next()
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ error: true, message: "Database error" });          
        });
    }
}

const get_country_tallest_vol = (req, res, next) => {

    // InvalidParametersProfile error
    if(Object.keys(req.query).length !== 0) return res.status(400).json({ 
        error: true, 
        message: "Invalid query parameters. Query parameters are not permitted." 
    });

    const country = req.params.country
    const authorised = req.authorised

    if(!authorised){
        req.db
        .from("data")
        .where("country", country)
        .select("id", "name", "country", "region", "subregion",
            "last_eruption", "summit", "elevation", "latitude", "longitude")
        .then(result => {
            if(result.length == 0) return res.status(404).json({
                error: true,
                message: "There are no volcanoes from country: " + country + "."
            })

            let tallest = { summit: 0 }
            result.forEach(r => r.summit > tallest.summit? tallest = r : null )
            req.data = tallest
            return next()
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ error: true, message: "Database error" });          
        });
    } else {
        req.db
        .from("data")
        .where("country", country)
        .select("id", "name", "country", "region", "subregion",
          "last_eruption", "summit", "elevation", "latitude", "longitude",
          "population_5km", "population_10km", "population_30km", "population_100km")
        .then(result => {
            if(result.length == 0) return res.status(404).json({
                error: true,
                message: "There are no volcanoes from country: " + country + "."            
            })

            let tallest = { summit: 0 }
            result.forEach(r => r.summit > tallest.summit? tallest = r : null )
            req.data = tallest

            return next()
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ error: true, message: "Database error" });          
        });
    }
}

const post_volcano_details = (req, res, next) => {

    // InvalidParametersProfile error
    if(Object.keys(req.query).length !== 0) return res.status(400).json({ 
        error: true, 
        message: "Invalid query parameters. Query parameters are not permitted." 
    });

    const volcano_id = req.params.id

    req.db
    .from('data')
    .select('*')
    .where('id', volcano_id)
    .update(req.body)
    .then(result => {
        if(result != 1){
            return res.status(400).json({ error: true, message: "Database error" });            
        }
        // successful update
        return next()
    })
    .catch((err) => {
        console.log(err);
        return res.status(404).json({
            error: true,
            message: "Volcano with ID: " + volcano_id + " not found."
        })
    });

}

module.exports = {
    post_login, 
    post_register, 
    get_profile,
    put_profile,
    get_countries, 
    get_volcanoes,
    get_volcano_details,
    post_volcano_details,
    get_country_tallest_vol
}