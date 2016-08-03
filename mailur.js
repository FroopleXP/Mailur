// Requiring dependencies
var express = require("express"),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    xss_filter = require('xss-filters'),
    app = express();

// Including config files
var server_config = require("./config/app_config.js"),
    api = express.Router();

// Configuring the App
app.set('view engine', 'ejs');
app.use("/views", express.static(__dirname + '/views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', api);
app.use(cors());

// Site routes
app.get("/", function(req, res) {
    res.render('home', { title: "Mailur" });
});

// API routes
api.post("/register", function(req, res) {

    // Getting and cleaning the data from the form
    var username = xss_filter.inHTMLData(req.body.username),
        email = xss_filter.inHTMLData(req.body.email),
        password = xss_filter.inHTMLData(req.body.password),
        confirm_password = xss_filter.inHTMLData(req.body.confirm_password);

    // Validating the data
    console.log(username);



});

// Starting the app
app.listen(server_config.app.port, function() {
    console.log("Mailur server started on port: " + server_config.app.port);
});
