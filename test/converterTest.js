Object.defineProperty(Array.prototype, 'flat', {
    value: function (depth = 1) {
        return this.reduce(function (flat, toFlatten) {
            return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten);
        }, []);
    }
});

const p2s = require('.././src/index')//require('postman-to-swagger')//
const yaml = require('js-yaml')
const fs = require('fs')
const postmanJson = require('./data/testPostoman2.json')
const swaggerJson = p2s(postmanJson, {
    target_spec: "swagger2.0",
    info: {
        version: 'v1'
    }
})

//let output = JSON.stringify(swaggerJson, null, 2)
let output = yaml.dump(swaggerJson)
//console.log(JSON.stringify(swaggerJson));
// Save to file
fs.writeFileSync(
    'swaggerTestOutput.yaml',
    output,
    'utf8'
)