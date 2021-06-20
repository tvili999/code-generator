const process = require("process");
const path = require("path");
const fs = require("fs");

const api = {
    bubbleUp: (predicate) => {
        let current = process.cwd();
        let previous = null;
        do {
            if(predicate(current))
                return current;
            previous = current;
            current = path.resolve(current, "..");
        } while(current !== previous);

        return null;
    },
    findFirst: (name) => api.bubbleUp((_name) => fs.existsSync(path.join(_name, name)))
}

module.exports = api;