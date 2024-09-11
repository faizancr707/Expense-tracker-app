
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const config = dotenv.config();

exports.authToken = async (req, res, next) => {
    const secretKey = process.env.SECRET_KEY;
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    const decode = jwt.verify(token, secretKey);
    req.body.userId = decode.email;
    req.body.email = decode.email;
    console.log("Authorized User")
    next();
};