const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const verifyClient = (info, callback) => {
    const url = new URL(info.req.url, `http://${info.req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
        return callback(false, 401, 'Unauthorized: Token missing');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return callback(false, 401, 'Unauthorized: Invalid token');
        }
        info.req.user = decoded;
        callback(true);
    });
};

module.exports = { verifyClient };