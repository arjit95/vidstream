const express = require('express');
const app = express();

app.use(express.json());
app.use('/api/metadata/user', require('./user'));
app.use('/api/metadata/video', require('./video'));
app.get('/_healthz', function(req, res) {
    res.send('ok');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', function() {
    console.log(`Server running on port ${port}`);
});