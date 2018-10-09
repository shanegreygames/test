
var now = require('performance-now');
var _ = require('underscore');

module.exports = function(){

    var client = this;
    var hitPoints = 20;

    //Added at runtime
    //this.socket = {}
    //this.user = {}

    //init
    this.initiate = function(){

        //send connection  handshake packet to client
        client.socket.write(packet.build(["HELLO", now().toString()]))

    }

    //client methods
    this.enterroom = function(selected_room){
        maps[selected_room].clients.forEach(function(otherClient){
            otherClient.socket.write(packet.build(["ENTER", client.user.username, client.user.pos_x, client.user.pos_y, client.user.rank]))
        })

        //self put into room
        maps[selected_room].clients.push(client);

    };
    
    //client methods
        this.exitroom = function(selected_room){
            maps[selected_room].clients.forEach(function(otherClient){
                otherClient.socket.write(packet.build(["EXIT", client.user.username]))
            })

            maps[selected_room].clients.forEach(function(client){
                client.socket.write(packet.build(["EXIT", client.user.username]))
            })
    
    
            //self take out of room
            maps[selected_room].clients.pop(client);
            //maps[newroom].clients.push(client);
    
        };


    this.broadcastroom = function(packetData){
        maps[client.user.current_room].clients.forEach(function(otherClient){
            
            if(otherClient.user.username != client.user.username){
                otherClient.socket.write(packetData);
            };
        })
    };

    this.broadcastmessage = function(packetData){
        maps[client.user.current_room].clients.forEach(function(client){
                client.socket.write(packetData);
        })
    };

    this.death = function(dier){
        if(hitPoints > 0)
        {
            hitPoints -= 1;
        }else if(hitPoints <= 0)
        {
        maps[client.user.current_room].clients.forEach(function(client){
            client.socket.write(packet.build(["DEATH", dier]))
        })
        hitPoints = 20;
        }
    };


    //Socket stuff
    this.data = function(data){
        packet.parse(client, data);
        //console.log("client data " + data.toString());
    }

    this.error = function(err){
        console.log("client error " + err.toString());
    }

    this.end = function(){
        client.user.save();

        maps[selected_room].clients.forEach(function(otherClient){
            otherClient.socket.write(packet.build(["EXIT", client.user.username]))
        })
        
        console.log("client closed");
    }


}