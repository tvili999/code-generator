const process = require("process");
const path = require("path");

module.exports = async (args, templatePath) => {
    return {
        ...args,
        require: (name) => {
            if(name.startsWith("./") || name.startsWith("../")) {
                const moduleDir = path.dirname(templatePath);
                const relativePath = path.relative(__dirname, moduleDir);
                return require(path.join(relativePath, name));
            }
            else {
                return require(name);
            }
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