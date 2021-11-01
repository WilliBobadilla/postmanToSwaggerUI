var express = require('express');
var app = express();

var indexRouter = require("./routes/index");
// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;


app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use("/", indexRouter);
// set the home page route
app.get('/', function (req, res) {
    // ejs render automatically looks in the views folder
    res.render('index');
});

app.listen(port, function () {
    console.log('Our app is running on http://localhost:' + port);
});