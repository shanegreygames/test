/* Created by Dev */

//Import required libraries
require(__dirname + '/Resources/config.js');
var fs = require('fs');
var net = require('net');
require('./packet.js')


console.log(config.database);


//load init
var init_files = fs.readdirSync(__dirname + "/Init");
init_files.forEach(function(initFile){
    console.log('Loading Initializer ' + initFile);
    require(__dirname + "/Init/" + initFile);
});

//load models
var model_files = fs.readdirSync(__dirname + "/Models");
model_files.forEach(function(modelFile){
    console.log('Loading Model ' + modelFile);
    require(__dirname + "/Models/" + modelFile);
});

//load maps
maps = {};
var map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(function(mapFile){
    console.log('Loading Map ' + mapFile);
    var map = require(config.data_paths.maps + mapFile);
    maps[map.room] = map
});

net.createServer(function(socket){

    console.log("socket connected!");
    var c_inst = new require("./client.js");
    var thisClient = new c_inst();

    thisClient.socket = socket;
    thisClient.initiate();


    socket.on('error', thisClient.error);

    socket.on('end', thisClient.end);

    socket.on('data', thisClient.data);

}).listen(config.port);

console.log("Initialization complete, server running on port: " + config.port)
