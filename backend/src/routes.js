const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const ADMINPASSWORD = process.env.ADMINPASSWORD;
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMINPASSWORD) {
        const token = jwt.sign(
            { role: 'admin' }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        return res.json({
            success: true,
            token: token
        });
    }

    return res.status(401).json({
        success: false,
        message: 'Неверный пароль'
    });
});

module.exports = router;