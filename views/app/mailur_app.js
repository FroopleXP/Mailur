// Declaring the app
angular.module("mailur", ["ngRoute"])

// Configuring the Routes
.config(function($routeProvider) {

    $routeProvider
    .when("/", {
        templateUrl: "views/app_views/home.htm",
        controller: 'home_ctrl'
    })
    .when("/chatroom", {
        templateUrl: "views/app_views/chatroom.htm",
        controller: 'chatroom_ctrl'
    })

})

// Controllers
.controller('home_ctrl', function($scope) {

})

.controller('chatroom_ctrl', function($scope, socket) {

    // Used to store message
    $scope.messages = [];

    // Used to check the connection status to the server
    $scope.connection_status = socket.get_status();

    socket.on('connect', function() {
        $scope.connection_status = true;
    });

    socket.on('disconnect', function() {
        $scope.connection_status = false;
    });

    socket.on('msg_ack', function() {
        $scope.message.body = "";
    });

    // New message!
    socket.on('new_message', function(message) {
        $scope.messages.push(message);
    });

    // Used to actually send the messages
    $scope.send_message = function(message_object) {
        // Trimming and checking the message
        message_object.body = message_object.body.trim();
        // Checking length
        if (message_object.body.length > 0) {
            socket.emit('message', message_object);
        }
    }

    // Used to delete all messages
    $scope.delete_messages = function() {
        $scope.messages = [];
    }

})

.factory('socket', function($rootScope) {

    var socket = io();

    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        },
        get_status: function() {
            // Checking conneciton status
            return socket.connected;
        }
    }

})

.factory('redirect', function($state) {
    return {
        go: function(where_to) {
            $state.go(where_to);
        }
    }
})
