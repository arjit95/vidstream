const router = require('express').Router();
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('../../common/node/db');
const metrics = require('../../common/node/metrics');

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET || 'JWT_TOKEN_SECRET';
const saltRounds = 10;

/**
 * This method will create entries in search index and db
 * @function
 * @returns <Promise<void>>
 */
const createEntries = async function(username, password, email) {
    const hash = await bcrypt.hash(password, saltRounds);
    const metricsInstance = await metrics.init();
    const dbInstance = await db.init();

    const {metadata} = await metricsInstance.Users.create({name: username, username});
    const userID = metadata._id;
    return dbInstance.Users.create({
        name: username,
        username,
        password: hash,
        id: userID,
        email: email,
        source: 'local'
    }).exec();
}

router.post('/local', [
    body('username').isLength({min: 5}),
    body('password').isLength({min: 5}),
    body('email').isEmail(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const instance = await db.init();
        const exists = await instance.Users.findOne({ username: req.body.username }).exec();
        if (exists) {
            return res.status(409).send();
        }
    
        const user = await createEntries(req.body.username, req.body.password, req.body.email);
        const token = await jwt.sign({user: {usernmae: user.username, id: user.id}}, JWT_TOKEN_SECRET);
        return res.status(200).json({token});
    } catch (err) {
        console.error(`Error occurred while completing registration request: ${err.message}`);
        res.status(500).json({error: 'Cannot complete your request'});
    }
});

module.exports = router;