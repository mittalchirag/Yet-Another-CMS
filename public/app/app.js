angular.module('userApp', ['appRoutes', 'ngAnimate', 'mainController', 'authServices','ngCookies'])

.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptors');
})