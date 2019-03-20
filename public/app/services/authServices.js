angular.module('authServices', [])

    .factory('Auth', function ($http, $q, $cookies, AuthToken) {
        var authFactory = {};

        //User.create(regData)
        authFactory.login = function (loginData) {
            return $http.post('/api/login', loginData);
        };
       

        authFactory.isLoggedIn = function () {
            if (AuthToken.getToken()) {
                return true;
            } else {
                return false;
            }
        };

        authFactory.getUser = function () {
            if (AuthToken.getToken()) {
                return $http.get('/api/me');
            } else {
                $q.reject({
                    success: false,
                    message: 'User is not logged in'
                });
            }
        };
        

        authFactory.getUser = function () {
            if (AuthToken.getToken()) {
                return $http.post('/api/me');
            } else {
                return ({
                    success: false,
                    message: 'User is not logged in'
                });
            }
        };
        authFactory.logout = function () {
            AuthToken.setToken();
        };



        return authFactory;
    })
    .factory('AuthToken', function ($window) {
        var authTokenFactory = {};

        //AuthToken.setToken(token);
        authTokenFactory.setToken = function (token) {
            if (token) {
                $window.localStorage.setItem('token', token);
            } else {
                $window.localStorage.removeItem('token');
            }
        };

        authTokenFactory.getToken = function () {
            return $window.localStorage.getItem('token');
        };

        return authTokenFactory;
    })
    .factory('User', function ($http) {
        userFactory = {};

        //User.create(regData)
        userFactory.create = function (regData) {
            return $http.post('api/register', regData);
        };
       

        return userFactory;
    })
    .factory('Court', function($http){
        courtFactory={};

        courtFactory.book= function(bookingData){
            console.log(bookingData);
            return $http.post('api/court/book',bookingData);
        };
        courtFactory.cancel= function(reschedulingData){
            console.log(reschedulingData);
            return $http.post('api/court/cancel',reschedulingData);
        };
        
        return courtFactory;
    })
    .factory('AuthInterceptors', function (AuthToken) {
        var authInterceptorsFactory = {};
        authInterceptorsFactory.request = function (config) {
            var token = AuthToken.getToken();
            if (token) {
                config.headers['x-access-token'] = token;
            }
            return config;
        };

        return authInterceptorsFactory;
    });