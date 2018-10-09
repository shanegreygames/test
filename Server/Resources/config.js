var args = require('minimist')(process.argv.slice(2));
var extend = require('extend');


var common_conf = {
    name: "game server",
    version: "0.0.1",
    max_player: 100,
    data_paths: {
        items: __dirname + "\\Game Data\\" + "Items\\",
        maps: __dirname + "\\Game Data\\" + "Maps\\"
    },
    starting_zone: "rm_map_home"
};

var conf = {
    ip: "0.0.0.0",
    port: 8081,
    database: "mongodb://127.0.0.1/MMOSERVER"
};

extend(false, conf, common_conf);

module.exports = config = conf;