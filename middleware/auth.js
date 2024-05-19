const jwt = require('jsonwebtoken')

// ken token:

// newuser token: 

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization

    // Empty header
    if(!authHeader) {
        req.authorised = false
        return next()
    } else {

        // MalformedAuthHeader error
        if(authHeader.split(' ')[0] != 'Bearer' || !authHeader.includes('Bearer')) return res.status(401).json({
            error: true,
            message: "Authorization header is malformed"
        })

        const token = authHeader.split(' ')[1]
        const secret = process.env.ACCESS_TOKEN_SECRET 

        jwt.verify(token, secret,
            (err, data) => {
                if(err){ 
                    // TokenExpiredError
                    if(err.name === 'TokenExpiredError') return res.status(401).json({ 
                        error: true, 
                        message: "JWT token has expired" 
                    })
                    // InvalidJWT error
                    return res.status(401).json({
                        error: true,
                        message: "Invalid JWT token"
                    })
                } else {
                    req.authorised = true 
                    req.user = data
                    return next()
                }
            }
        )
    }
}

const required_auth = (req, res, next) => {
    const authHeader = req.headers.authorization

    // Empty header
    if(!authHeader) {
        // MissingAuthHeader error
        return res.status(401).json({
            error: true,
            message: "Authorization header ('Bearer token') not found"
        })
    } else {

        // MalformedAuthHeader error
        if(authHeader.split(' ')[0] != 'Bearer' || !authHeader.includes('Bearer')) return res.status(401).json({
            error: true,
            message: "Authorization header is malformed"
        })

        const token = authHeader.split(' ')[1]
        const secret = process.env.ACCESS_TOKEN_SECRET 

        jwt.verify(token, secret,
            (err, data) => {
                if(err){ 
                    // TokenExpiredError
                    if(e.name === 'TokenExpiredError') return res.status(401).json({ 
                        error: true, 
                        message: "JWT token has expired" 
                    });

                    // InvalidJWT error
                    return res.status(401).json({
                        error: true,
                        message: "Invalid JWT token"
                    })
                } else {
                    req.user = data
                    return next()
                }
            }
        )
    }
}

module.exports = {auth, required_auth};