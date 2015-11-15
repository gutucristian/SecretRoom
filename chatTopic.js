var ChatTopic = (function () {
    function ChatTopic(topic) {
        var _this = this;
        this.config = new Config();
        this.topic = '';
        this.clientSockets = [];
        this.clientUISockets = [];
        this.amtOfClients = 0;
        this.clientData = [];
        this.schedule = [];
        this.orderedClientSockets = [];
        this.xorMsgLists = [];
        this.utils = new Utils();
        this.turnCounter = 0;
        this.amtOfClientReadyForNextRound = 0;
        this.ongoingChat = false;
        this.needNewMetadata = false;
        this.activeSockets = [];
        this.subscribeSocketToTopic = function (clientSocket, isBot) {
            _this.addClientSocket(clientSocket, isBot);
        };
        this.sendChatMetadata = function () {
            var bCList = [];
            do {
                _this.schedule = [];
                bCList = [];
                _this.clientData.forEach(function (publicKey) {
                    var privateNumber = Math.floor((Math.random() * _this.config.privateNumMax) + _this.config.privateNumMin);
                    _this.schedule.push(Math.pow(publicKey, privateNumber) % _this.config.dhPrimeModulo);
                    var bC = Math.pow(_this.config.dhGenerator, privateNumber) % _this.config.dhPrimeModulo;
                    bCList.push(bC);
                    //console.log('shedule: ' + this.schedule);
                    if (!_this.utils.arrayIsUnique(_this.schedule)) {
                        console.log('schedule: ' + _this.schedule + ' is not unique so rebuild it');
                    }
                });
            } while (!_this.utils.arrayIsUnique(_this.schedule));
            //console.log('schedule: ' + this.schedule + ' is unique so continue');
            var counter = 0;
            _this.orderedClientSockets.forEach(function (clientSocket) {
                clientSocket.emit('dhAndScheduleData', { dhData: _this.clientData, schedule: _this.schedule, bC: bCList[counter] });
                counter++;
            });
            //console.log('schedule: ' + this.schedule);
        };
        this.addClientData = function (clientSocket, data) {
            _this.orderedClientSockets.push(clientSocket);
            _this.clientData.push(data);
        };
        this.addClientXORmsg = function (xorMsgList) {
            _this.xorMsgLists.push(xorMsgList);
        };
        this.deriveMsg = function () {
            var message = '';
            var currentCharXOR;
            _this.parseXORmsgLists();
            var msgList = _this.getMsgList();
            if (!(msgList.length <= 1)) {
                // remove msgList from xorMsgLists
                for (var i = 0; i < _this.xorMsgLists.length; i++) {
                    if (_this.utils.arrayEquals(_this.xorMsgLists[i], msgList)) {
                        _this.xorMsgLists.splice(i, 1);
                        break;
                    }
                }
                for (var j = 0; j < msgList.length; j++) {
                    currentCharXOR = msgList[j];
                    for (var k = 0; k < _this.xorMsgLists.length; k++) {
                        var temp = currentCharXOR;
                        currentCharXOR = currentCharXOR ^ _this.xorMsgLists[k][0];
                    }
                    message += String.fromCharCode(currentCharXOR);
                }
            }
            else {
                message += '';
            }
            return message;
        };
        this.addClientSocket = function (socket, isBot) {
            var clientExists = false;
            _this.clientSockets.forEach(function (clientSocket) {
                if (clientSocket.id === socket.id) {
                    clientExists = true;
                }
            });
            if (!clientExists) {
                _this.amtOfClients++;
                _this.clientSockets.push(socket);
                if (!isBot) {
                    _this.clientUISockets.push(socket);
                }
            }
        };
        this.removeClientSocket = function (socket) {
            _this.clientUISockets.forEach(function (clientSocket) {
                //console.log('looping through socket: ' + clientSocket.id);
                if (clientSocket.id === socket.id) {
                    var index = _this.clientSockets.indexOf(clientSocket);
                    _this.clientSockets.splice(index, 1);
                    _this.amtOfClients--;
                }
            });
        };
        this.startChat = function () {
            _this.ongoingChat = true;
            _this.turnCounter++;
            _this.clientSockets.forEach(function (clientSocket) {
                clientSocket.emit('startChat');
            });
        };
        this.requestNewMetadata = function () {
            _this.clientData = [];
            _this.orderedClientSockets = [];
            _this.clientSockets.forEach(function (clientSocket) {
                clientSocket.emit('buildClientMetadata');
            });
            _this.ongoingChat = false;
        };
        this.parseXORmsgLists = function () {
            for (var i = 0; i < _this.xorMsgLists.length; i++) {
                var currentList = _this.xorMsgLists[i];
                var zeroIndex = currentList.indexOf(0);
                currentList.splice(zeroIndex);
            }
        };
        this.getMsgList = function () {
            var messageList = [];
            var biggestLength = 0;
            for (var i = 0; i < _this.xorMsgLists.length; i++) {
                if (_this.xorMsgLists[i].length > biggestLength) {
                    biggestLength = _this.xorMsgLists[i].length;
                    messageList = _this.xorMsgLists[i];
                }
            }
            return messageList;
        };
        this.clearRoundData = function () {
            _this.amtOfClientReadyForNextRound = 0;
            _this.xorMsgLists = [];
        };
        this.clearDataForNewMetadata = function () {
            _this.amtOfClientReadyForNextRound = 0;
            _this.xorMsgLists = [];
            _this.setNeedNewMetadata(false);
            _this.schedule = [];
            _this.turnCounter = 0;
        };
        this.incrementAmtOfClientReadyForNextRound = function () {
            _this.amtOfClientReadyForNextRound++;
        };
        this.getTopic = function () {
            return _this.topic;
        };
        this.getClientSockets = function () {
            return _this.clientSockets;
        };
        this.getTurnCounter = function () {
            return _this.turnCounter;
        };
        this.getAmtOfClientReadyForNextRound = function () {
            return _this.amtOfClientReadyForNextRound;
        };
        this.getAmtOfClients = function () {
            return _this.amtOfClients;
        };
        this.getXORmsgListsLength = function () {
            return _this.xorMsgLists.length;
        };
        this.getClientDataLength = function () {
            return _this.clientData.length;
        };
        this.getOngoingChat = function () {
            return _this.ongoingChat;
        };
        this.getNeedNewMetadata = function () {
            return _this.needNewMetadata;
        };
        this.setOngoingChat = function (val) {
            _this.ongoingChat = val;
        };
        this.getScheduleLength = function () {
            return _this.schedule.length;
        };
        this.getActiveSockets = function () {
            return _this.activeSockets;
        };
        this.setNeedNewMetadata = function (val) {
            _this.needNewMetadata = val;
        };
        this.topic = topic;
    }
    return ChatTopic;
})();
//# sourceMappingURL=chatTopic.js.map