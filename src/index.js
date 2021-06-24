const paths = require("./paths");
const process = require("process");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const glob = require("glob");

const createInput = require("./createInput");
const parseOutput = require("./parseOutput");

(async () => {
    const packageRoot = paths.findFirst("gen.config.json");
    if(packageRoot == null) {
        console.error("No project root found.");
        process.exit(-1);
    }

    let config = JSON.parse(fs.readFileSync(path.resolve(packageRoot, "gen.config.json"), 'utf-8'));

    const actions = [];
    let i = 2;
    while(i < process.argv.length) {
        if(process.argv[i].startsWith("--"))
            break;
        actions.push(process.argv[i]);
        i++;
    }

    const actionArgs = process.argv.slice(i);
    const parsedArgs = { };
    for(let i = 0; i < actionArgs.length; i += 2) {
        const key = actionArgs[i];
        const value = actionArgs[i + 1];
        if(key.startsWith("--") && value)
            parsedArgs[key.slice(2)] = value;
    }

    const actionPath = path.join(...actions);
    let files = null;
    let projectConfig = null;
    for(let templatePath in config) {
        const currentConfig = config[templatePath];
        if(!templatePath.startsWith("./"))
            templatePath = path.join("node_modules", templatePath);
        const absolutePath = path.join(packageRoot, templatePath, actionPath);
        if(!fs.existsSync(absolutePath))
            continue;
        
        projectConfig = currentConfig;

        files = (fs.readdirSync(absolutePath)
            .map(file => path.join(absolutePath, file))
            .filter(file => fs.statSync(file).isFile())
        );

        if(fs.existsSync(path.join(absolutePath, ".genfiles"))) {
            let globs = (fs.readFileSync(path.join(absolutePath, ".genfiles")).toString()
                .split("\n")
                .map(x => x.trim())
                .filter(x => x)
            );

            files = [];
            for(const genglob of globs) {
                const matches = await new Promise(resolve => {
                    glob(genglob, { cwd: absolutePath }, (err, matches) => resolve(matches));
                })
                for(const match of matches)
                    files.push(path.resolve(absolutePath, match));
            }
        }
        break;
    }
    if(!files) {
        console.error("ERROR: No such generator found");
        process.exit(1);
    }
    if(typeof projectConfig != "object")
        projectConfig = {};

    for(const actionFile of files) {
        if(process.env["GEN_DEBUG"]) {
            console.log(actionFile)
            console.log("----------------------");
        }

        const hooks = {
            afterCreate: []
        }
        let addHook = (name, handler) => {
            hooks[name].push(handler);
        }

        const input = await Promise.resolve(createInput({
            args: {...projectConfig, ...parsedArgs},
            projectRoot: packageRoot,
            addHook
        }, actionFile));
        let output;
        try {
            output = await ejs.renderFile(actionFile, input, {
                async: true,
                filename: actionFile
            });
            output = await output;
        }
        catch(e) {
            console.error("ERROR: Error during render");
            console.error(e);
            process.exit(1);
        }
        if(process.env["GEN_DEBUG"]) 
            console.log(output)
        else
            await Promise.resolve(parseOutput(output, packageRoot));

        try {
            for(const handler of hooks.afterCreate) 
                await Promise.resolve(handler());
        }
        catch(e) {
            console.error("ERROR: Error during render");
            console.error(e);
            process.exit(1);
        }
    }
})().catch(e => {
    console.error("ERROR: Error during render");
    console.error(e);
    process.exit(1);
});
