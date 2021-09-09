Object.defineProperty(Array.prototype, 'flat', {
    value: function (depth = 1) {
        return this.reduce(function (flat, toFlatten) {
            return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten);
        }, []);
    }
});

const p2s = require('postman-to-swagger')
const yaml = require('js-yaml')
const fs = require('fs')
const postmanJson = require('./test.json')
const direct = require('./directToSwaagerPosEx.json')
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
    'swaggerTest.yaml',
    output,
    'utf8'
)