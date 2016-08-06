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

// User store
var users = {};

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

    // Pushing new user to array
    users[socket.id] = {
        nick: "user" + parseInt(Object.keys(users).length + 1),
        id: socket.id
    }

    // Sending the new user list...
    io.sockets.emit('user_list', users);

    socket.on('disconnect', function() {
        delete users[socket.id];
        io.sockets.emit('user_list', users);
    });

    socket.on('message', function(message) {

        socket.emit('msg_ack');

        // Cleaning the message
        message.body = xss_filter.inHTMLData(message.body).trim();
        message.nick = users[socket.id].nick;
        message.time = Math.floor(Date.now() / 1000);

        // Sending the message to everyone
        io.sockets.emit('new_message', message);

    });

    socket.on('rotor_update', function(settings) {
        io.sockets.emit('rotor_update', settings);
    });

});

// Starting the app
server.listen(server_config.app.port, function() {
    console.log("Mailur server started on port: " + server_config.app.port);
});
