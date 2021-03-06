const { ipcRenderer } = require('electron');

var EventEmitter =  require('events').EventEmitter,
    inherits     =  require('util').inherits,
    co           =  require('co'),
    request      =  require('co-request');

module.exports = GameClient;

function GameClient(config) {
    EventEmitter.call(this);

    this.config = config;

    this.socket = require('socket.io-client')(config.GAMESERVER);
    this.socket.on('error', this.onError.bind(this));
    this.socket.on('err', this.onErr.bind(this));
    this.socket.on('connect', this.onConnect.bind(this));
    this.socket.on('disconnect', this.onDisconnect.bind(this));
    this.socket.on('game_crash', this.onGameCrash.bind(this));
    //this.socket.on('join', this.onJoin.bind(this));

    //add game_starting, cashed_out
    this.socket.on('game_starting', this.onGameStarting.bind(this));
    this.socket.on('cashed_out', this.onCashedOut.bind(this));
}

inherits(GameClient, EventEmitter);

GameClient.prototype.onError = function(err) {
    ipcRenderer.send('bot-log', err);
    console.error('onError: ', err);
};

GameClient.prototype.onErr = function(err) {
    ipcRenderer.send('bot-log', err);
    console.error('onErr: ', err);
};

GameClient.prototype.onConnect = function(data) {
    ipcRenderer.send('bot-log', "Connected to GameServer");
    console.log("Connected to GameServer");

    var self = this;
    var cookie = request.cookie('id=' + self.config.SESSION),
        url    = self.config.WEBSERVER + '/ott',
        jar    = request.jar();

    jar.setCookie(cookie, url);

    var res = request.post({uri:url, jar:jar}, function(error, response, body){

        var ott = body;
        var info = ott ? { ott: "" + ott } : {};
        //console.log("ott:" + JSON.stringify(ott));
        self.socket.emit('join', info, function(err, data) {
        if (err){
            ipcRenderer.send('bot-log','[ERROR] onConnect:'+ err);
            console.error('[ERROR] onConnect:', err);
        }

        else
            self.onJoin(data);
        });
    });
        
//moves to getOTT method
/*
    var info = ott ? { ott: "" + ott } : {};
    console.log("ott:" + JSON.stringify(ott));
    self.socket.emit('join', info, function(err, data) {
        if (err)
            console.error('[ERROR] onConnect:', err);
        else
            self.onJoin(data);
    });
    */
};

GameClient.prototype.onDisconnect = function(data) {
    ipcRenderer.send('bot-log','Disconnected from Game server |'+ data + '|', typeof data);
    console.log('Disconnected from Game server |', data, '|', typeof data);
    this.emit('disconnect');
};

GameClient.prototype.onJoin = function(data) {
  this.emit('join', data);
};

GameClient.prototype.onGameCrash = function(data) {
    this.emit('game_crash', data);
};

GameClient.prototype.onGameStarting = function(data) {
  /* Example:
       { "game_id":1000020,
         "max_win":150000000,
         "time_till_start":5000
       }
  */
  this.emit('game_starting', data);
};

GameClient.prototype.onCashedOut = function(data) {
  /* Example:
       { "username":"Steve",
         "stopped_at":2097
       }
  */
  var self = this;

  if (self.config.USER === data.username) {
    this.emit('cashed_out', data);
    this.emit('user_cashed_out', data);
  } else {
    this.emit('cashed_out', data);
  }
};
