var secret = "somesecret"; //should be set as an environment variable in the host machine not in the code
var jwt = require("jsonwebtoken");
var jsonwt = require("express-jwt");

var auth = jsonwt({
  secret: secret,
  userProperty: "payload"
});

var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "chirag@123",
  database: "CMS"
});
connection.connect(function(err) {
  if (!err) {
    console.log("Database is connected ... ");
  } else {
    console.log("Error connecting database ... ");
  }
});

module.exports = function(router) {
  //USER REGISTRATION
  router.post("/register", function(req, res) {
    console.log(req.body);
    var users = {
      Name: req.body.name,
      Phone: req.body.phone,
      Username: req.body.username,
      Password: req.body.password
    };
    connection.query(
      "SELECT * FROM User WHERE Username = ?",
      [users.Username],
      function(error, results, fields) {
        if (results.length > 0) {
          res.status(400).json({
            code: 201,
            success: false,
            message: "A user with the same username already exists."
          });
        } else if (error) {
          console.log("error ocurred", error);
          res.status(400).json({
            code: 400,
            success: false,
            message: "error ocurred"
          });
        } else {
          connection.query("INSERT INTO User SET ?", users, function(
            error,
            results,
            fields
          ) {
            if (error) {
              console.log("error ocurred", error);
              res.status(400).json({
                code: 400,
                success: false,
                message: "error ocurred"
              });
            } else {
              console.log("The solution is: ", results);
              res.status(200).json({
                code: 200,
                success: true,
                message: "user registered sucessfully"
              });
            }
          });
        }
      }
    );
  });

  router.post("/login", function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    connection.query(
      "SELECT * FROM User WHERE Username = ?",
      [username],
      function(error, results, fields) {
        if (error) {
          console.log("error ocurred", error);
          res.status(400).json({
            code: 400,
            success: false,
            message: "error ocurred"
          });
        } else {
          // console.log('The solution is: ', results);
          if (results.length > 0) {
            if (results[0].Password == password) {
              var token = jwt.sign(
                {
                  username: username
                },
                secret,
                {
                  expiresIn: "24h"
                }
              );
              res.status(200).json({
                code: 200,
                success: true,
                message: "login Successful",
                token: token
              });
            } else {
              res.status(403).json({
                code: 205,
                success: false,
                message: "Invalid username or password"
              });
            }
          } else {
            res.status(403).json({
              code: 206,
              success: false,
              message: "The specified user was not found."
            });
          }
        }
      }
    );
  });

  router.get("/courts", function(req, res) {
    connection.query(
      "select * from Court Natural JOIN CourtGames Natural Join  CourtFreeSlots",
      (error, rows) => {
        if (error) {
          console.log("error ocurred", error);
          res.status(400).json({
            code: 400,
            success: false,
            message: "error ocurred"
          });
        } else {
          res.status(200).json({
            code: 200,
            success: true,
            message: rows
          });
        }
      }
    );
  });

  //USER DISPLAY
  // function ensureAuthenticated(req, res, next) {
  //   var user = req.user;
  //   if (user) {
  //     return next();
  //   } else {
  //     return res.status(401).send({
  //       success: false,
  //       message: "User unauthenticated"
  //     });
  //   }
  // }

  router.use(function(req, res, next) {
    var token =
      req.body.token || req.body.query || req.headers["x-access-token"];

    if (token) {
      jwt.verify(token, secret, function(err, decoded) {
        if (err) {
          res.status(403).json({
            code: 400,
            success: false,
            message: "Token Invalid"
          });
        } else {
          req.decoded = decoded;
          next();
        }

        console.log(decoded); // bar
      });
    } else {
      res.status(403).json({
        code: 400,
        success: false,
        message: "Token not found"
      });
    }
  });

  router.post("/me", function(req, res) {
    res.send(req.decoded);
  });
  router.post("/bookings", function(req, res) {
    connection.query(
      "SELECT * FROM User WHERE Username = ?",
      [req.decoded.username],
      function(error, results, fields) {
        if (error) {
          console.log("error ocurred", error);
          res.status(400).json({
            code: 400,
            success: false,
            message: "error ocurred"
          });
        } else {
          // console.log('The solution is: ', results);
          if (results.length > 0) {
            var UserID = results[0].UserID;

            connection.query(
              "SELECT * FROM BookingDetails WHERE UserID = ?",
              [UserID],
              function(error, rows) {
                if (error) {
                  console.log("error ocurred", error);
                  res.status(400).json({
                    code: 400,
                    success: false,
                    message: "error ocurred"
                  });
                } else {
                  res.status(200).json({
                    code: 200,
                    success: true,
                    message: rows
                  });
                }
              }
            );
          } else {
            res.status(403).json({
              code: 206,
              success: false,
              message: "The specified user was not found."
            });
          }
        }
      }
    );
  });
  router.post("/court/book", function(req, res) {
    console.log(req.body);
    connection.query(
      "SELECT * FROM User WHERE Username = ?",
      [req.decoded.username],
      function(error, results, fields) {
        if (error) {
          console.log("error ocurred", error);
          res.status(400).json({
            code: 400,
            success: false,
            message: "error ocurred"
          });
        } else {
          // console.log('The solution is: ', results);
          if (results.length > 0) {
            var UserID = results[0].UserID;
            var booking = {
              UserID: UserID,
              CourtID: req.body.CourtID,
              BookingStartTime: req.body.StartTime,
              BookingEndTime: req.body.EndTime,
              Game: req.body.Game
            };
            connection.query(
              "INSERT INTO BookingDetails SET ?",
              [booking],
              function(error, rows) {
                if (error) {
                  console.log("error ocurred", error);
                  res.status(400).json({
                    code: 400,
                    success: false,
                    message: "error ocurred"
                  });
                } else {
                  var reservedSlot = {
                    CourtID: req.body.CourtID,
                    StartTime: req.body.StartTime,
                    EndTime: req.body.EndTime
                  };
                  connection.query(
                    "INSERT INTO CourtReservedSlots SET ?",
                    [reservedSlot],
                    function(error, rows) {
                      if (error) {
                        console.log("error ocurred", error);
                        res.status(400).json({
                          code: 400,
                          success: false,
                          message: "error ocurred"
                        });
                      } else {
                        connection.query(
                          "DELETE FROM CourtFreeSlots WHERE CourtID=" +
                            reservedSlot.CourtID +
                            " AND StartTime='" +
                            reservedSlot.StartTime +
                            "' AND EndTime='" +
                            reservedSlot.EndTime +
                            "'",
                          function(error, results) {
                            if (error) {
                              console.log("error ocurred", error);
                              res.status(400).json({
                                code: 400,
                                success: false,
                                message: "error ocurred"
                              });
                            } else {
                              console.log(results);
                              res.status(200).json({
                                code: 200,
                                success: true,
                                message: results
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          } else {
            res.status(403).json({
              code: 206,
              success: false,
              message: "The specified user was not found."
            });
          }
        }
      }
    );
  });

  router.post("/court/cancel", function(req, res) {
    console.log(req.body);
    var cancelData = {
      UserID: req.body.UserID,
      CourtID: req.body.CourtID,
      StartTime: req.body.BookingStartTime,
      EndTime: req.body.BookingEndTime
    };
    connection.query(
      "DELETE FROM BookingDetails WHERE CourtID=" +
        cancelData.CourtID +
        " AND UserID=" +
        cancelData.UserID +
        " AND BookingStartTime='" +
        cancelData.StartTime +
        "' AND BookingEndTime='" +
        cancelData.EndTime +
        "'",
      function(error, results) {
        if (error) {
          console.log("error ocurred", error);
          res.status(400).json({
            code: 400,
            success: false,
            message: "error ocurred:"+error
          });
        } else {
          console.log('The solution is: ', results);
          if (results.affectedRows > 0) {
            connection.query(
              "DELETE FROM CourtReservedSlots WHERE CourtID=" +
                cancelData.CourtID +
                " AND StartTime='" +
                cancelData.StartTime +
                "' AND EndTime='" +
                cancelData.EndTime +
                "'",
              function(error, results) {
                if (error) {
                  console.log("error ocurred", error);
                  res.status(400).json({
                    code: 400,
                    success: false,
                    message: "error ocurred"
                  });
                } else {
                  var freeSlot = {
                    CourtID: cancelData.CourtID,
                    StartTime: cancelData.StartTime,
                    EndTime: cancelData.EndTime
                  };
                  connection.query(
                    "INSERT INTO CourtFreeSlots SET ?",
                    [freeSlot],
                    function(error, results) {
                      if (error) {
                        console.log("error ocurred", error);
                        res.status(400).json({
                          code: 400,
                          success: false,
                          message: "error ocurred"
                        });
                      } else {
                        console.log(results);
                        res.status(200).json({
                          code: 200,
                          success: true,
                          message: results
                        });
                      }
                    }
                  );
                }
              }
            );
          } else {
            res.status(403).json({
              code: 206,
              success: false,
              message: "The specified user was not found."
            });
          }
        }
      }
    );
  });

  return router;
};
