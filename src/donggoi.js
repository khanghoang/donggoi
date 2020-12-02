const { readFileSync } = require('fs');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { resolve } = require('path');
const { transform } = require('@babel/core');

const modules = [];
let id = 0;
const entryFile = '../test/main.js';

const parseCode = file => {
    const codeStr = readFileSync(file, 'utf8');
    const astTree = parse(codeStr, { sourceType: 'module' });

    traverse(astTree, {
        ImportDeclaration: path => {
            const relativePath = path.node.source.value;
            const absolutePath = `${resolve(file, '..', relativePath)}.js`;

            const module = {
                relativePath,
                absolutePath,
                id: id++,
                code: transform(codeStr, {
                    presets: ['@babel/preset-env']
                }).code
            };

            modules.push(module);
            parseCode(absolutePath);
        }
    });
};

parseCode(entryFile);
console.log({ modules });
debugger;
