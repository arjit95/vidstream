const router = require('express').Router();
router.use('/login', require('./login'));
router.use('/register', require('./register'));
router.use('/validate', require('./validate'));

module.exports = router;