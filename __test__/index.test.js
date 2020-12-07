const { readFileSync } = require('fs');
const path = require('path');
const { donggoi } = require('../src/donggoi');

describe('Basic bundler', () => {
    it('should work', async () => {
        await donggoi();
        const code = readFileSync(path.resolve(__dirname, '../dist/main.js'), 'utf8');
        expect(eval(code)).toEqual('hello');
    });
});
