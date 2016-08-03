// Requiring dependencies
var express = require("express"),
    app = express();

// Including config files
var server_config = require("config/app_config.js");

// Setting rendering engine
app.set('view engine', 'ejs');

// Routes
app.get("/", function(req, res) {
    res.render('home', { title: "Mailur - Home" });
});

// Starting the app
app.listen(server_config, funciton() {
    console.log("Mailur server started on port: " + server_config.app.port);
});
