const router = require('express').Router();
const jwt = require('jsonwebtoken');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');

const db = require('../../common/node/db');
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET || 'JWT_TOKEN_SECRET';

const localAuth = async (username, password) => {
    const instance = await db.init();
    const user = await instance.Users.findOne({ username }).exec();
    const match = user && await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error('Invalid username/password');
    }

    const token = jwt.sign({user: {username: user.username, id: user._id}}, JWT_TOKEN_SECRET);
    return token;
};

router.post('/local', [
    body('username').isLength({min: 5}),
    body('password').isLength({min: 5})
] , async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ error: errors.array() });
        }

        const {username, password} = req.body;
        const token = await localAuth(username, password);
        res.status(200).json({token});
    } catch(err) {
        res.status(401).json({error: err.message});
    }
});

module.exports = router;