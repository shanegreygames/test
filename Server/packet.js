var zeroBuffer = new Buffer('00', 'hex');

module.exports = packet = {

    //params: an aray of JS objs t be turned into
    build: function(params){

        var packetParts = [];
        packetSize = 0;

        params.forEach(function(param){
            var buffer;

            if(typeof param === 'string'){
                buffer = new Buffer(param, 'utf8');
                buffer = Buffer.concat([buffer, zeroBuffer], buffer.length + 1)
            }
            else if(typeof param === 'number')
            {
                buffer = new Buffer(2);
                buffer.writeUInt16LE(param, 0);
            }
            else
            {
                console.log("WARNING: Unknown data type in packet builder!");
            }

            packetSize += buffer.length;
            packetParts.push(buffer);
        })

        var dataBuffer = Buffer.concat(packetParts, packetSize);

        var size = new Buffer(1);
        size.writeUInt8(dataBuffer.length + 1, 0);

        var finalPacket = Buffer.concat([size, dataBuffer], size.length + dataBuffer.length);

        return finalPacket;

    },

    //Parse a packet to be handled for a client
    parse: function(c, data){

        var idx = 0; //index in buffer

        while(idx < data.length){

            var packetSize = data.readUInt8(idx);
            var extractedPacket = new Buffer(packetSize);
            data.copy(extractedPacket, 0, idx, idx + packetSize)

            this.interpret(c, extractedPacket);

            idx += packetSize;


        }

    },

    interpret: function(c, datapacket){
        
        var header = PacketModels.header.parse(datapacket);
        console.log("Interpret: " + header.command);

        switch (header.command.toUpperCase()){

            case "LOGIN":
                var data = PacketModels.login.parse(datapacket);
                User.login(data.username, data.password, function(result, user){
                    console.log('Login Result: ' + result);
                    if(result){
                        c.user = user;
                        c.enterroom(c.user.current_room);
                        c.socket.write(packet.build(["LOGIN", "TRUE", c.user.current_room, c.user.pos_x, c.user.pos_y, c.user.username, c.user.rank]))
                    }else{
                        c.socket.write(packet.build(["LOGIN", "FALSE"]))
                    }
                })
                break;

            case "REGISTER":
                var data = PacketModels.register.parse(datapacket);
                User.register(data.username, data.password, function(result){
                    if(result){
                        c.socket.write(packet.build(["REGISTER", "TRUE"]))
                    }else{
                        c.socket.write(packet.build(["REGISTER", "FALSE"]))
                    }
                })
                break;

            case "POS":
                var data = PacketModels.pos.parse(datapacket);
                c.user.pos_x = data.target_x;
                c.user.pos_y = data.target_y;
                //c.user.save();
                c.broadcastroom(packet.build(["POS", c.user.username, data.target_x, data.target_y, c.user.current_room, c.user.rank]));
                //console.log(data);
                break;
            
            case "EXITROOM":
                var data = PacketModels.exitroom.parse(datapacket)
                        c.exitroom(c.user.current_room);
                        c.broadcastroom(packet.build(["EXIT", c.user.username]));
                        c.user.current_room = data.newroom;
                        c.enterroom(data.newroom);

                break;

            case "HIT":
                var data = PacketModels.hit.parse(datapacket)
                c.death(c.user.username);
                break;

            case "MESSAGE":
                var data = PacketModels.message.parse(datapacket)
                c.broadcastmessage(packet.build(["MESSAGE", c.user.username, data.message, c.user.rank]));
                break;

        }

    }

}