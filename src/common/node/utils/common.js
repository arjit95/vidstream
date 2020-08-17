const shortid = require('shortid');

const ns = {};
ns.generateUniqueId = shortid.generate;

module.exports = ns;