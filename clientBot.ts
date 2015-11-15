declare var require;

class ClientBot extends ClientBase {    
    constructor(topic) {
        super();
        var socket = require('socket.io-client')(this.config.socketToEndpoint, { forceNew: true });        
        this.setSocket(socket);
        this.setupSocketListeners();
        this.subscribeToTopic(topic, true);
        this.sendClientMetadata();
    }
}

var bots: Array<ClientBot> = [];

try {
    var config = new Config();
    var timeout = 1000;
    config.topics.forEach((t) => {
        console.log('making bots for: ' + t);      
        //bots.push(new ClientBot(t));
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
        //timeout = timeout + 1000
        //setTimeout(() => { bots.push(new ClientBot(t)); }, timeout);
    })
}
catch (ex) {
    console.log('--> (ERROR): ' + ex);
}; 