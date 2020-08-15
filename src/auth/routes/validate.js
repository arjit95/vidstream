const router = require('express').Router();
const passport = require('passport');

router.get('/local', passport.authenticate('jwt', {session: false}), function(req, res) {
    res.status(200).json({user: req.user});
});

module.exports = router;