# Code generator

This tool is highly influenced by `hygen`.
Note that the basic ideas are the same, but the two packages are not compatible at all.
This package provides solutions for my own problems in hygen.

## Installation

`yarn global add https://github.com/tvili999/code-generator`

## gen.config.json file

Project root is determined as the first folder upwards that has the config file in it.

This file contains a map with the keys of the paths to be searched for templates, and values of the corresponding configurations. IE.
The path search is like in import paths. If the path begins with `./` it is treated as a path in the project directory. If it doesn't, it is searched in the node_modules directory.

### Example

```json
{
    "react-templates": {
        "componentsDir": "src/components",
        "contextsDir": "src/components",
        "stylus": true,
        "typescript": true
    },
    "./.templates": {
        "webpackPort": 8080
    }
}
```

## gen command

Gen command generates the code based on the templates.
These template collections can be configured in the `gen.config.json`.

### Example

`gen react component --type functional --name MyComponent`

This parameter searches all the template collections for template `react component` defined in the `gen.config.json` file.

### Parameters

The parameters can be set in the `gen.config.json` or as command line parameters starting with `--`.

#### Example

These two are the same

Scenario 1:

```json
{
    "react-templates": {
        "type": "class"
    }
}
```

`gen react component --name MyComponent`

Scenario 2:

```json
{
    "react-templates": { }
}
```

`gen react component --type class --name MyComponent`

### Completion

THIS IS A PLANNED FEATURE. NOT YET IMPLEMENTED.
If the command can be completed for definitely one template, then it is enough to write it that way.

#### Example

These two are the same:

`gen react component create --type class --name MyComponent`

`gen re com c --type class --name MyComponent`

This is true only if there is no way for the second command to be completed except the first command.
The commands relate to each other. That means, if there are multiple template collections with templates beginning with react component, it matters if the last part is only present in one package.

## Template collections

Template collections are basically folders. These are the things that are defined in `gen.config.js` as keys.

When a template is referenced, it defines a directory in template collection root.

The templates can be found in this directory.

### Example

Take the following scenario:

```json
{
    "react-templates": { },
    "./my-react-templates": { }
}
```

`gen react component create`

This command will look for the templates in the following folders:

`node_modules/react-templates/react/component/create`

`./my-react-templates/react/component/create`

### .genfiles

You might not want to treat all files inside these directories as templates.
You can do that by creating a `.genfiles` file.
This is a list of globs that should be included.
If this is not present, all the files will be included.

### Packages

For template packages or repositories, it is fine to put the templates to the root of the project. The only thing that matters is to reference the right folder in the config file.

Of course you can put it in separate folders as well, and reference that folder as `<package name>/<subfolder>`.

This way you can have local and shared as well, and the shared templates are fetched by the yarn command.

## Templates

The templates are ejs files.

The template is rendered, and then parsed, so the syntax is required to be right only after rendering.
This is one of the big reasons this tool was created instead of using hygen.

### Header

Each template starts with a header. Everything before gets ignored.

The header must be between two --- lines. This section is in yaml format and specifies output parameters of the template.

#### Example

```text
---
to: src/example
overwrite: true
---
File contents
```

#### To parameter

This parameter specifies the output path of the template file.
If this begins with `./` then the path is relative to the cwd. Otherwise it is relative to the project root.

#### Overwrite parameter

If this parameter is `skip`, the template generation will not happen, but other templates may get created.
If this parameter is `true`, the template generation will overwrite the original file.
Otherwise, the template generation will fail, and other templates will not be rendered too.

### EJS context

The template generation is backed by EJS. This makes it possible to write javascript in templates.

#### require

You can require anything inside the templates as you would do in normal node js source files.

#### args

The command line arguments and the project config parameters are found in the args object. This is a map of the parameters and its values.
