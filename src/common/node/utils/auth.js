const bent = require('bent');
const ns = {};

/**
 * @param {string} token User token supplied during login 
 * @returns {Promise<{username: string, id: string}>} response
 */
ns.getUserFromToken = async function(token) {
    const get = bent(process.env.AUTH_SERVICE_ADDR, 'GET', 'json');
    return get(`/api/auth/validate/local?token=${token}`);
};

module.exports = ns;