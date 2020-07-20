class Helpers {
    static mergeCommandObj(obj) {
        return Object.keys(obj).reduce((acc, com) => {
            return `${acc} -${com} ${obj[com]}`;
        }, '');
    }
}

module.exports = Helpers;