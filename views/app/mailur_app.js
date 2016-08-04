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

    $scope.connection_status = socket.get_status();

    socket.on('connect', function() {
        $scope.connection_status = "Connected";
    });

    socket.on('disconnect', function() {
        $scope.connection_status = "Not Connected";
    });

    $scope.send_message = function(message_body) {
        socket.emit('message', message_body, function() {

        });
    }

})

.factory('socket', function($rootScope) {

    var socket = io();

    return {
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
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
            if (socket.connected == true) {
                return "Connected";
            } else {
                return "Not connected";
            }
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
