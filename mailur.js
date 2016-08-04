// Requiring dependencies
var express = require("express"),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    xss_filter = require('xss-filters'),
    validator = require('validator'),
    app = express();

// Setting up SocketIO
var server = require('http').createServer(app),
    io = require('socket.io').listen(server);

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

// Listening for SocketIO connections
io.on('connection', function(socket) {
    console.log("New connection from: " + socket.id);
    socket.on('disconnect', function() {
        console.log("Lost connection to: " + socket.id);
    });
});

// Starting the app
server.listen(server_config.app.port, function() {
    console.log("Mailur server started on port: " + server_config.app.port);
});
