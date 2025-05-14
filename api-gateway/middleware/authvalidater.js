const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    const authheader = req.headers['authorization'];
    // console.log(authheader);
    const token = authheader && authheader.split(' ')[1];
    // console.log(token)

    if (!token) {
        logger.warn(`Access attempted without token`);
        return res.status(401).json({
            success: false,
            message: 'Authentication required! Please login to continue'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            logger.warn(`Invalid token: ${err.message}`); // Log detailed error message
            return res.status(403).json({
                success: false,
                message: 'Invalid token',
                error: err.message // Include error details in the response for debugging
            });
        }
        req.user = user;
        next();
    });
}

module.exports = { validateToken };