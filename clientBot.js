var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ClientBot = (function (_super) {
    __extends(ClientBot, _super);
    function ClientBot(topic) {
        _super.call(this);
        var socket = require('socket.io-client')(this.config.socketToEndpoint, { forceNew: true });
        this.setSocket(socket);
        this.setupSocketListeners();
        this.subscribeToTopic(topic, true);
        this.sendClientMetadata();
    }
    return ClientBot;
})(ClientBase);
var bots = [];
try {
    var config = new Config();
    var timeout = 1000;
    config.topics.forEach(function (t) {
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
    });
}
catch (ex) {
    console.log('--> (ERROR): ' + ex);
}
;
//# sourceMappingURL=clientBot.js.map