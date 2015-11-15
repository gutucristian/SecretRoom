var Server = (function () {
    function Server(http) {
        var _this = this;
        this.chatTopicList = [];
        this.utils = new Utils();
        this.config = new Config();
        this.run = function () {
            _this.io.on('connection', function (socket) {
                console.log('client connected (id: ' + socket.id + ')');
                socket.on('ping', function () {
                    socket.emit('pong');
                });
                socket.on('subscribeClientToTopic', function (topic, isBot) {
                    var chatTopic = _this.getChatTopic(topic);
                    socket.chatTopic = topic;
                    _this.removeClientSocket(socket, false);
                    chatTopic.subscribeSocketToTopic(socket, isBot);
                    socket.emit('subscribedToTopic');
                    //this.printClients();
                });
                socket.on('disconnect', function () {
                    //console.log('client disconnected (id: ' + socket.id + ')');             
                    _this.removeClientSocket(socket, true);
                });
                socket.on('clientMetadata', function (metadata) {
                    var chatTopic = _this.getChatTopic(metadata.topic);
                    _this.addClientDataToTopic(socket, metadata.topic, metadata.a);
                    if (chatTopic.getOngoingChat()) {
                        //console.log('--> (WARNING) added client during ongoing chat');                    
                        chatTopic.setNeedNewMetadata(true);
                    }
                    //console.log();
                    //console.log('|Topic: ' + socket.chatTopic + '|');
                    //console.log('chatTopic.getAmtOfClients(): ' + chatTopic.getAmtOfClients());
                    //console.log('chatTopic.getClientDataLength(): ' + chatTopic.getClientDataLength());
                    if (chatTopic.getAmtOfClients() >= 3 && chatTopic.getClientDataLength() == chatTopic.getAmtOfClients()) {
                        chatTopic.startChat();
                    }
                });
                socket.on('xorMsg', function (xorMsg) {
                    _this.addClientXORmsgToTopic(xorMsg.topic, xorMsg.xorMessageList);
                });
                socket.on('readyForNextRound', function (topic) {
                    var chatTopic = _this.getChatTopic(topic);
                    chatTopic.incrementAmtOfClientReadyForNextRound();
                    if (chatTopic.getNeedNewMetadata()) {
                        //console.log('--> (WARNING) new metadata being built');                   
                        chatTopic.clearDataForNewMetadata();
                        chatTopic.requestNewMetadata();
                    }
                    if (chatTopic.getAmtOfClients() == chatTopic.getAmtOfClientReadyForNextRound()) {
                        chatTopic.clearRoundData();
                        chatTopic.startChat();
                    }
                });
            });
        };
        this.broadcastMsgToTopic = function (clientMsg) {
            var chatTopic = _this.getChatTopic(clientMsg.topic);
            chatTopic.getClientSockets().forEach(function (clientSocket) {
                clientSocket.emit('plainTextMsg', { msg: clientMsg.msg, turnCounter: chatTopic.getTurnCounter() });
            });
        };
        this.addClientXORmsgToTopic = function (topic, xorMsgList) {
            var chatTopic = _this.getChatTopic(topic);
            chatTopic.addClientXORmsg(xorMsgList);
            if (chatTopic.getXORmsgListsLength() == chatTopic.getAmtOfClients()) {
                var msg = chatTopic.deriveMsg();
                _this.broadcastMsgToTopic({ topic: topic, msg: msg });
            }
        };
        this.addClientDataToTopic = function (socket, topic, data) {
            var chatTopic = _this.getChatTopic(topic);
            chatTopic.addClientData(socket, data);
            if (!chatTopic.getOngoingChat()) {
                if (chatTopic.getAmtOfClients() >= 3 && chatTopic.getClientDataLength() == chatTopic.getAmtOfClients()) {
                    chatTopic.sendChatMetadata();
                }
            }
        };
        this.removeClientSocket = function (clientSocket, requireNewMetadata) {
            var chatTopic = _this.getChatTopic(clientSocket.chatTopic);
            if (chatTopic != undefined) {
                if (requireNewMetadata) {
                    chatTopic.setNeedNewMetadata(true);
                }
                chatTopic.removeClientSocket(clientSocket);
            }
        };
        this.getChatTopic = function (topic) {
            for (var i = 0; i < _this.chatTopicList.length; i++) {
                if (_this.chatTopicList[i].getTopic() == topic) {
                    return _this.chatTopicList[i];
                }
            }
        };
        this.printClients = function () {
            console.log('\n');
            _this.chatTopicList.forEach(function (chatTopic) {
                console.log('--> clients in topic: ' + chatTopic.getTopic());
                chatTopic.getClientSockets().forEach(function (socket) {
                    console.log(' > id: ' + socket.id);
                });
            });
        };
        this.io = require('socket.io')(http);
        this.config.topics.forEach(function (topic) {
            _this.chatTopicList.push(new ChatTopic(topic));
        });
    }
    return Server;
})();
//# sourceMappingURL=server.js.map