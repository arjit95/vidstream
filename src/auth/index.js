const express = require('express');
const passport = require('passport');

const tokenStrategy = require('./strategies/token');

const app = express();

app.use(express.json());
app.use(passport.initialize());
passport.use(tokenStrategy.initialize());

app.use('/api/auth', require('./routes'));
app.get('/_healthz', (_, res) => {
    res.send('ok');
})

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0');
