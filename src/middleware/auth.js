const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async(req, res, next) => {
    //validate token
    try {
        //get raw token
        const rawToken = req.header('Authorization').replace('Bearer ', '')

        //validate it
        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET)

        //get user
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': rawToken })

        if (!user) {
            throw new Error('')
        }
        req.user = user
        req.token = rawToken

        next()
    } catch (error) {
        res.status(401).send({ error: "Not Authorized", details: error })
    }
}

module.exports = auth