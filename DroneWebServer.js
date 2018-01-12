/*
This is the backend express application
-listens on port 3000 when started
-serves a single file back to "index.html" that exists in the same directory the application is loaded from
	-i.e. navigating to http://localhost:3000 should return you to index.html file
-this file has two functions:
	1. takes a get request that passes in takeoff
	2. takes a get request that passes in land 
	
-this needs to serve static files from a specified directory
-add in extra actions we need to support to control our Drone 
*/

var express = require('express');
var arDrone = require('ar-drone'); //get necessary library
var fs = require('fs');


//var client = arDrone.createClient(); //declare drone object
var client = arDrone.createClient({ip:'192.168.1.2'}); //declare drone object based on ip of drone
var app = express(); //define express application object that will be referenced
app.use(express.static('public')); //tells express that it can serve up files in a static directory called public

var path = require('path'); //use path library to use relative paths

// This router is sending a command to the drone 
// to take off
app.get('/takeoff', function(req, res) {
 client.takeoff();
 console.log("Drone Taking Off");
 });

// This router is sending a command to the drone
// to land
app.get('/land', function(req, res) {
 client.stop(0);
 client.land();
 console.log("Drone Landing");
});

// This router is sending a command to the drone to calibrate. Causes the drone to fully rotate and balance
app.get('/calibrate', function(req, res) {
 client.calibrate(0);
 console.log("Drone Calibrating");
 });

// This router is sending a command to the drone to cancel all existing commands. 
//Important if turning clockwise and you want to stop for example
app.get('/hover', function(req, res) {
 client.stop(0);
 console.log("Hover");
 });

// kill file to stop taking pictures
app.get('/photos', function(req, res) {
   console.log("Drone Taking Pictures");    
   var pngStream = client.getPngStream(); //initializing the object that will grab the image from the video stream of the drone camera
   var period = 2000; // Save a frame every 2000 ms.
   var lastFrameTime = 0; //used to count and see if period has elapsed
   
   pngStream //testing the pngStream object
     .on('error', console.log) //write out error to console in node.js window the app was started from
     .on('data', function(pngBuffer) { //if there is data
        var now = (new Date()).getTime(); //set a variable 'now' to check if it is more than the elapsed period btw images
        if (now - lastFrameTime > period) { //if period has elapsed, set lastFrameTime to be 'now'
           lastFrameTime = now;
           fs.writeFile(__dirname + '/public/DroneImage.png', pngBuffer, function(err) {//write a file into the directory where the DroneWebServer.js is started from
           if (err) {//check if successful
             console.log("Error saving PNG: " + err);
           } else {
             console.log("Saved Frame");  
          }
      });
     }
  });
 });

// This router is sending a command to the drone to turn clockwise
app.get('/clockwise', function(req, res) {
 client.clockwise(0.5);
 console.log("Drone Turning Clockwise");
});

app.listen(3000, function () {
});