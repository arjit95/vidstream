const fs = require('fs');

class FileUtils {
    getReadStream() {
        throw FileUtils.Errors.METHOD_NOT_IMPLEMENTED;
    }

    getWriteStream() {
        throw FileUtils.Errors.METHOD_NOT_IMPLEMENTED;
    }
}

FileUtils.Errors = {
    METHOD_NOT_IMPLEMENTED: 'Method not implemented'
}

class FSUtils extends FileUtils {
    getReadStream(filePath) {
        return fs.createReadStream(filePath);        
    }

    async assertDirectory(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
    }

    getWriteStream(filePath) {
        return fs.createWriteStream(filePath);
    }

    static async newBuilder() {
        return new FSUtils();
    }
}


module.exports = FSUtils;