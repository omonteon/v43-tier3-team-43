"use strict";

//Loading dependencies & initializing express
const os = require("os"); //for operating system-related utility methods and properties
const express = require("express");
const app = express();
const http = require("http"); //for creating http server

//For signalling in WebRTC
const socketIO = require("socket.io");

//Define the folder which contains the CSS and JS for the fontend
app.use(express.static("public"));

//Define a route
app.get("/", function (req, res) {
  //Render a view (located in the directory views/) on this route
  res.render("index.ejs");
});

//Initialize http server and associate it with express
const server = http.createServer(app);

//Ports on which server should listen - 8000 or the one provided by the environment
server.listen(process.env.PORT || 8000);

//Initialize socket.io
const io = socketIO(server);
