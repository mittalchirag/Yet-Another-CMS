angular.module('userControllers', ['authServices'])

    .controller('regCtrl', function (Auth, $http, $location, $timeout, User) {

        var app = this;

        app.errorMsg=false;
        app.successMsg=false;

        app.regUser = function (regData) {
            app.errorMsg = false;
            User.create(app.regData).then(function (data) {

                if (data.data.success) {
                    app.successMsg = data.data.message;
                    $timeout(function () {
                        $location.path('/courts');
                    }, 2000);
                } else {

                    app.errorMsg = data.data.message;
                }
            });
        };

    })
    .controller('loginCtrl', function (Auth, $interval, AuthToken, User, $location, $cookies, $window, $timeout, $rootScope) {
        var app =this;

        app.loadme = false;


        app.checkSession = function () {
            if (Auth.isLoggedIn()) {
                app.checkingSession = true;
                var interval = $interval(function () {
                    var token = AuthToken.getToken();
                    if (token === null) {
                        $interval.cancel(interval);
                    }
                }, 2000);
            }
        };

        app.loginUser = function (loginData) {
            app.errorMsg = false;
            app.successMsg=false;

            Auth.login(app.loginData).then(function (data) {
                console.log(data);
                if (data.data.success) {
                    AuthToken.setToken(data.data.token);
                    app.successMsg = data.data.message;
                    $timeout(function () {
                        $location.path('/mybookings');
                        $window.location.reload();
                        app.loginData = '';
                        app.successMsg = false;
                        app.checkSession();
                    }, 2000);
                } else {
                    $q.reject({
                        message: "Invalid Credentials"
                    });
                    app.errorMsg = data.data.message;
                }
            });
        };



        app.logout = function () {
            Auth.logout(); 
            $timeout(function () {
                $window.location.reload();
                app.loginData = '';
                app.successMsg = false;
                app.checkSession();
            }, 2000);      
        };
    })
