const path = require('path');
const fs = require('fs');

const ASSETS_DIR = process.env.ASSETS_DIR || './assets';
const profileDirectory = path.resolve(ASSETS_DIR, 'profiles');
const channelDirectory = path.resolve(ASSETS_DIR, 'channels');
const channelBanner = path.resolve(ASSETS_DIR, 'channelBanners'); 

[profileDirectory, channelDirectory, channelBanner].forEach(dir => {
    if (fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
});

/** @namespace */
const ns = {};

/**
 * @returns {import('./upload.d').MethodResponse}
 */
ns.profile = function() {
    const response = {};
    let generatedName;

    /** @param {import('./upload.d').Context} context */
    response.onStream = (context) => {
        generatedName = context.fields.id + '.png';
        return fs.createWriteStream(path.resolve(profileDirectory, generatedName));
    };

    response.onError = () => {
        if (generatedName && fs.existsSync(generatedName)) {
            fs.unlinkSync(generatedName);
        }
    };

    return response;
};

/**
 * @returns {import('./upload.d').MethodResponse}
 */
ns.channel = function() {
    const response = {};
    let generatedName;

    /** @param {import('./upload.d').Context} context */
    response.onStream = (context) => {
        generatedName = context.fields.id + '.png';
        return fs.createWriteStream(path.resolve(channelDirectory, generatedName))
    };

    response.onError = () => {
        if (generatedName && fs.existsSync(generatedName)) {
            fs.unlinkSync(generatedName);
        }
    };

    return response;
}

/**
 * @returns {import('./upload.d').MethodResponse}
 */
ns.channelBanner = function() {
    const response = {};
    let generatedName;

    /** @param {import('./upload.d').Context} context */
    response.onStream = (context) => {
        generatedName = context.fields.id + '.png';
        return fs.createWriteStream(path.resolve(channelBanner, generatedName))
    };

    response.onError = () => {
        if (generatedName && fs.existsSync(generatedName)) {
            fs.unlinkSync(generatedName);
        }
    };

    return response;
}

module.exports = ns;