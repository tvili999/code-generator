const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

module.exports = (output, packageRoot) => {
    const headerStartIndex = output.indexOf("---");
    if(headerStartIndex === -1)
        return;

    output = output.slice(headerStartIndex + 3).trimStart();

    const headerEndIndex = output.indexOf("\n---\n");
    if(headerEndIndex === -1)
        return;

    const headerText = output.slice(0, headerEndIndex);
    const contentText = output.slice(headerEndIndex + 5);

    const header = yaml.load(headerText);
    if(!header.to)
        return;

    let to;
    if(header.to.startsWith("./"))
        to = path.resolve(header.to);
    else
        to = path.resolve(packageRoot, header.to);
    const dirname = path.dirname(to);
    if(!dirname.startsWith(packageRoot))
        return;

    if(!fs.existsSync(dirname))
        fs.mkdirSync(dirname, { recursive: true });
    
    if(fs.existsSync(to)) {
        if(header.overwrite === "skip")
            return;
        if(header.overwrite !== true)
            throw `${to} already exists`;
    }
    fs.writeFileSync(to, contentText);
}
