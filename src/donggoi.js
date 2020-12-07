const { readFileSync, writeFileSync } = require('fs');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const path = require('path');
const { transform } = require('@babel/core');

exports.donggoi = async ({
    entryFile,
    srcDir,
    destDir
} = {
    entryFile: './main.js',
    srcDir: path.resolve(__dirname, '../test'),
    destDir: path.resolve(__dirname, '../dist')
}) => {
    const modules = {};
    let id = 0;
    let entryFileCode = ``;

    const parseCode = (file, parentPath = '.') => {
        const relativePath = file;
        const absolutePath = `${path.resolve(
            path.dirname(path.resolve(srcDir, file)),
            relativePath
        )}`;

        const codeStr = readFileSync(absolutePath, 'utf8');

        const module = {
            relativePath,
            absolutePath,
            id: id++,
            code: `return (module, exports, require) => {
            ${
                transform(codeStr, {
                    presets: ['@babel/preset-env']
                }).code
            }
        }`
        };
        modules[module.relativePath] = module;

        // this code sucks
        if (!entryFileCode) {
            entryFileCode = module.code;
        }

        const astTree = parse(codeStr, { sourceType: 'module' });
        traverse(astTree, {
            ImportDeclaration: path => {
                const relativePath = `${path.node.source.value}`;
                parseCode(relativePath, file);
            }
        });
    };

    const makeRelativeImport = () => {
        return `
        var modules = ${JSON.stringify(modules)};
        Object.keys(modules).forEach(k => {
          modules[k]["code"] = (new Function(modules[k]["code"]))();
        });

        var relativeRequire = path => {
            var realModule = modules[path]["code"];
            var module = {};
            module.exports = {};

            realModule(module, module.exports, relativeRequire);
            return module.exports;
        }
    `;
    };

    parseCode(entryFile);

    const browserCode = `
    ${makeRelativeImport()}

    (function() {
        new Function(\`${entryFileCode.toString()}\`)()({}, {}, relativeRequire);
    })();
`;

    writeFileSync(path.resolve(destDir, entryFile), browserCode);
};
