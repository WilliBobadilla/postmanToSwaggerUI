
const p2s = require('.././src/index')//require('postman-to-swagger')//
const yaml = require('js-yaml')
const fs = require('fs')
Object.defineProperty(Array.prototype, 'flat', {
    value: function (depth = 1) {
        return this.reduce(function (flat, toFlatten) {
            return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten);
        }, []);
    }
});

async function parse(req, res, next) {
    try {//logic here
        let inputForJsonConvert = JSON.parse(req.body.jsonField)
        const swaggerJson = p2s(inputForJsonConvert, {
            target_spec: "swagger2.0",
            info: {
                version: 'v1'
            }
        })
        let output = yaml.dump(swaggerJson)
        res.render('parse', { resultOuput: output, input: JSON.stringify(inputForJsonConvert) });
    } catch (error) {
        res.render('parse', { resultOuput: "Error", input: "Error" });
    }
}


module.exports = { parse };
