const { readFileSync } = require('fs');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const path = require('path');
const { transform } = require('@babel/core');

const modules = [];
let id = 0;
const entryFile = './main.js';
const rootFolder = path.resolve(__dirname, '../test');

const parseCode = (file, parentPath = '.') => {
    const relativePath = file;
    const absolutePath = `${path.resolve(
        path.dirname(path.resolve(rootFolder, file)),
        relativePath
    )}`;

    const codeStr = readFileSync(absolutePath, 'utf8');
    const astTree = parse(codeStr, { sourceType: 'module' });

    traverse(astTree, {
        ImportDeclaration: path => {
            const relativePath = `${path.node.source.value}.js`;
            parseCode(relativePath, file);
        }
    });

    const module = {
        relativePath,
        absolutePath,
        id: id++,
        code: transform(codeStr, {
            presets: ['@babel/preset-env']
        }).code
    };

    modules.push(module);
};

parseCode(entryFile);
console.log({ modules });
