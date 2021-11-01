// general index endpoints for API

var express = require("express");
const indexController = require("../controllers/index");
var router = express.Router();

router.get("/", function (req, res, next) {
    res.render("index");
});

router.post("/v1/parse", indexController.parse);//middleware is , auth.verifyUser,

module.exports = router;
