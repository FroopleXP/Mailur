// Declaring the app
angular.module("mailur", ["ngRoute"])

// Configuring the Routes
.config(function($routeProvider) {

    $routeProvider
    .when("/", {
        templateUrl: "views/app_views/new_chatroom.htm",
        controller: 'chatroom_ctrl'
    })

})

.controller('chatroom_ctrl', function($scope, socket, enigma) {

    // Used to store message, rotor settings and users
    $scope.messages = [];
    $scope.users = [];

    $scope.rotor_settings = {
        "rotor_1": "C",
        "rotor_2": "B",
        "rotor_3": "A"
    };

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

    socket.on('user_list', function(users) {
        $scope.users = users;
        $scope.users.count = Object.keys(users).length;
    });

    // New message!
    socket.on('new_message', function(message) {
        enigma.decrypt(message.body, $scope.rotor_settings)
        .then(function(dec_message) {
            message.dec_text = dec_message;
        })
        .catch(function(err) {
            alert(err);
        })
        $scope.messages.push(message);
    });

    // Rotor update
    socket.on('rotor_update', function(rotor_settings) {
        $scope.rotor_settings = rotor_settings;
    });

    // Used to actually send the messages
    $scope.send_message = function(message_object) {
        // Trimming and checking the message
        message_object.body = message_object.body.trim();
        // Checking length
        if (message_object.body.length > 0) {
            enigma.encrypt(message_object.body, $scope.rotor_settings)
            .then(function(enc_message) {
                message_object.body = enc_message;
                socket.emit('message', message_object);
            })
            .catch(function(err) {
                alert(err);
            })
        }
    }

    // Used to send the Enigma Rotors
    $scope.update_rotors = function(rotor_settings) {
        socket.emit('rotor_update', rotor_settings);
    }

    // Used to delete all messages
    $scope.delete_messages = function() {
        $scope.messages = [];
    }

})

.factory('enigma', function($q) {

    var parse_settings = [],
        active_rotors = 3;

    // The rotors
    var  rot_comm = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
            rot_a = ['D', 'M', 'T', 'W', 'S', 'I', 'L' ,'R', 'U', 'Y', 'Q', 'N', 'K', 'F', 'E', 'J', 'C', 'A', 'Z', 'B', 'P', 'G', 'X', 'O', 'H', 'V'],
            rot_b = ['H', 'Q', 'Z', 'G', 'P', 'J', 'T', 'M', 'O', 'B', 'L', 'N', 'C', 'I', 'F', 'D', 'Y', 'A', 'W', 'V', 'E', 'U', 'S', 'R', 'K', 'X'],
            rot_c = ['U', 'Q', 'N', 'T', 'L', 'S', 'Z', 'F', 'M', 'R', 'E', 'H', 'D', 'P', 'X', 'K', 'I', 'B', 'V', 'Y', 'G', 'J', 'C', 'W', 'O', 'A'],
            rot_d = ['J', 'G', 'D', 'Q', 'O', 'X', 'U', 'S', 'C', 'A', 'M', 'I', 'F', 'R', 'V', 'T', 'P', 'N', 'E', 'W', 'K', 'B', 'L', 'Z', 'Y', 'H'];

    return {
        encrypt: function(message, rotor_settings) {

            // Creating the promise
            var q = $q.defer(),
                encrypted_text = "";

            // Parsing the settings
            this.parse_settings(rotor_settings)
            .then(function() {
                // Looping through each character and encrypting it
                for (var x = 0; x < message.length; x++) {
                    var curr_char = message[x].toUpperCase(),
                        enc_char = curr_char;
                    if (/^[a-z0-9]+$/i.test(enc_char)) {
                        for (var r = 1; r <= active_rotors; r++) {
                            // Getting the index of the character in standard alphabet
                            enc_char = parse_settings[r][rot_comm.indexOf(enc_char)];

                        }
                    }
                    encrypted_text += enc_char;
                }

                q.resolve(encrypted_text);

            })

            // Returning the promise
            return q.promise;

        },
        decrypt: function(message, rotor_settings) {

            // Creating the promise
            var q = $q.defer(),
                decrypted_text = "";

            // Parsing the settings
            this.parse_settings(rotor_settings)
            .then(function() {
                // Looping through each character and encrypting it
                for (var x = 0; x < message.length; x++) {
                    var curr_char = message[x].toUpperCase(),
                        dec_char = curr_char;
                    if (/^[a-z0-9]+$/i.test(dec_char)) {
                        for (var r = active_rotors; r >= 1; r--) {
                            // Getting the index of the character in standard alphabet
                            dec_char = rot_comm[parse_settings[r].indexOf(dec_char)];
                        }
                    }
                    decrypted_text += dec_char;
                }
                q.resolve(decrypted_text);
            })

            // Returning the promise
            return q.promise;

        },
        parse_settings: function(rotor_settings) {
            var q = $q.defer();
            // Parsing the settings
            for (var i = 1; i <= active_rotors; i++) {
                switch (rotor_settings['rotor_' + i]) {
                    case 'A':
                        parse_settings[i] = rot_a;
                        break;
                    case 'B':
                        parse_settings[i] = rot_b;
                        break;
                    case 'C':
                        parse_settings[i] = rot_c;
                        break;
                    case 'D':
                        parse_settings[i] = rot_d;
                        break;
                }
            }
            q.resolve();
            return q.promise;
        }
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
