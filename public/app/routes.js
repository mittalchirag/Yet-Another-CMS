var app = angular.module("appRoutes", ["ngRoute", "ui.router"]);

app.config(function(
  $routeProvider,
  $locationProvider,
  $stateProvider,
  $urlRouterProvider
) {
  $stateProvider
    .state("home", {
      url: "/",
      templateUrl: "app/views/pages/home.html"
    })
    .state("about", {
      url: "/about",
      templateUrl: "app/views/pages/about.html"
    })
    .state("student", {
      url: "/student",
      templateUrl: "app/views/pages/student.html"
    })
    .state("mybookings", {
        url: "/mybookings",
        templateUrl: "app/views/pages/mybookings.html",
        authenticated:true
      })
    .state("courts", {
      url: "/courts",
      templateUrl: "app/views/pages/courts.html",
      authenticated: true
    })
    .state("login", {
      url: "/login",
      templateUrl: "app/views/pages/login.html",
      authenticated: false
    })
    .state("register", {
      url: "/register",
      templateUrl: "app/views/pages/register.html",
      authenticated: false
    });

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
});
app.run([
  "$rootScope",
  "$state",
  "Auth",
  "$location",
  function($rootScope, $state, Auth, $location) {
    $rootScope.$on("$stateChangeStart", function(
      event,
      toState,
      toParams,
      fromState,
      fromParams
    ) {
      if (toState.authenticated == true) {
        if (!Auth.isLoggedIn()) {
          console.log("Authentication is required");
          event.preventDefault();
          $state.transitionTo("login");
        }
      } else if (toState.authenticated == false) {
        if (Auth.isLoggedIn()) {
          event.preventDefault();
          $state.transitionTo("courts");
        }
      }
    });
  }
]);
