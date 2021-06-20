const process = require("process");
const path = require("path");

module.exports = async (args) => {
    return {
        ...args,
        require: (name) => {
            return require(name);
        },
        cwd: process.cwd(),
        path: (...parts) => {
            const fullPath = path.resolve(...parts);

            return {
                get basename() {
                    return path.basename(fullPath);
                },
                get dirname() {
                    return path.dirname(fullPath);
                },
                get fullpath() {
                    return fullPath;
                }
            }
        }
    }
}