// Declaring the app
angular.module("mailur", ["ngRoute"])

// Configuring the Routes
.config(function($routeProvider) {

    $routeProvider
    .when("/", {
        templateUrl: "views/app_views/home.htm",
        controller: 'home_ctrl'
    })
    .when("/dashboard", {
        templateUrl: "views/app_views/dashboard.htm",
        controller: 'dashboard_ctrl'
    })
    .when("/register", {
        templateUrl: "views/app_views/register.htm",
        controller: 'register_ctrl'
    })

})

// Controllers
.controller('home_ctrl', function($scope) {

})

.controller('dashboard_ctrl', function($scope) {

})

.controller('register_ctrl', function($scope, regsiter_serv) {

    // Function used to register the user
    $scope.register = function(register_details) {
        regsiter_serv.register(register_details)
        .then(function(success) {
            alert(success);
        })
        .catch(function(err) {
            alert(err);
        })
    }

})

// Factorys
.factory('regsiter_serv', function($q, $http) {
    return {
        register: function(register_details) {
            // Sending the details to the API, creating the promise
            var q = $q.defer();
            $http.post("http://localhost:1337/api/register", register_details)
            .then(function(response) { // We have a response with code 200
                q.resolve(response);
            })
            .catch(function(err) { // There was an error, something other than status 200
                q.reject(err);
            })
            return q.promise;
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
