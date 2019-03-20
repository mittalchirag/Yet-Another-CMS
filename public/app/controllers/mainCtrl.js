angular
  .module("mainController", ["userControllers", "authServices"])

  .controller("mainCtrl", function(
    Auth,
    RawData,
    Court,
    $interval,
    User,
    $location,
    $window,
    $route,
    $timeout,
    $rootScope
  ) {
    var app = this;
    app.data = new Array();
    app.isLoggedIn=false;
    app.bookingData = {};
    app.getData = function() {
      RawData.getrawdata().then(function(data) {
        app.data = data.data.message;
      });
    };

    app.myBookingData = new Array();
    app.getMyBookingData = function() {
      RawData.getmybookings().then(function(data) {
        app.myBookingData = data.data.message;
      });
    };

    app.bookCourt = function(bookingData) {
      console.log(bookingData);
      app.bookingData = bookingData;
      Court.book(bookingData).then(function(data) {
        if (data.data.success) {
          var myEl = angular.element(document.querySelector(".modal"));
          myEl.addClass("is-active");
          app.successMsg = data.data.message;
          app.getMyBookingData();
        } else {
          app.errorMsg = data.data.message;
        }
      });
    };

    app.rescheduleBooking = function() {
      console.log(app.reschedulingData);
      Court.cancel(app.reschedulingData).then(function(data) {
        if (data.data.success) {
          app.successMsg = data.data.message;
          $location.path("/courts");
          $window.location.reload();
        } else {
          app.errorMsg = data.data.message;
        }
      });
    };
    app.cancelBooking = function() {
      console.log(app.cancelData);
      Court.cancel(app.cancelData).then(function(data) {
        if (data.data.success) {
          app.successMsg = data.data.message;
          $window.location.reload();
        } else {
          app.errorMsg = data.data.message;
        }
      });
    };

    app.showDisclaimer = function(reschedulingData) {
      app.reschedulingData = reschedulingData;
      var myEl = angular.element(document.querySelector("#rescheduling"));
      myEl.addClass("is-active");
    };
    app.cancelDisclaimer = function(cancelData) {
      app.cancelData = cancelData;
      var myEl = angular.element(document.querySelector("#cancelling"));
      myEl.addClass("is-active");
    };
    app.goBack = function() {
      $window.location.reload();
    };
    app.goToBookings = function() {
      $location.path("/mybookings");
    };

    if (Auth.isLoggedIn()) {
      app.getData();
      app.getMyBookingData();
      console.log("Success! user is logged in");
      app.isLoggedIn = true;
      Auth.getUser().then(function(data) {
        app.username = data.data.username;
        console.log(app.username);
      });
      app.loadme = true;
    } else {
      console.log("Failure! user is not logged in");
      app.username = "";
      app.isLoggedIn = false;
      app.loadme = true;
    }
  })

  .factory("RawData", function($http) {
    rawData = {};

    //RawData.getLanguages()
    rawData.getrawdata = function() {
      return $http.get("/api/courts");
    };

    rawData.getmybookings = function() {
      return $http.post("api/bookings");
    };

    return rawData;
  });
