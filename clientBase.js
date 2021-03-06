var ClientBase = (function () {
    function ClientBase() {
        var _this = this;
        this.config = new Config();
        this.topic = '';
        this.schedule = [];
        this.privateNum = 0;
        this.a = 0;
        this.sharedSecretKeys = [];
        this.turnKey = 0;
        this.turnCounter = 0;
        this.msgQueue = [];
        this.latencyData = [];
        this.setSocket = function (socket) {
            _this.socket = socket;
            setInterval(function () {
                _this.startTime = Date.now();
                _this.socket.emit('ping');
            }, 3000);
        };
        this.subscribeToTopic = function (topic, isBot) {
            _this.topic = topic;
            _this.socket.emit('subscribeClientToTopic', _this.topic, isBot);
        };
        this.sendMsg = function (msg) {
            _this.socket.emit('clientMsg', { topic: _this.topic, msg: msg });
        };
        this.showMsg = function (msg) {
            if (msg.length > 1) {
            }
        };
        this.buildClientMetadata = function () {
            _this.privateNum = Math.floor((Math.random() * _this.config.privateNumMax) + _this.config.privateNumMin);
            _this.a = Math.pow(_this.config.dhGenerator, _this.privateNum) % _this.config.dhPrimeModulo;
        };
        this.sendClientMetadata = function () {
            //console.log('  > build & send client metadata');
            _this.buildClientMetadata();
            _this.socket.emit('clientMetadata', { topic: _this.topic, a: _this.a });
        };
        this.buildTurnKey = function (bC) {
            _this.turnKey = Math.pow(bC, _this.privateNum) % _this.config.dhPrimeModulo;
        };
        this.buildSharedSecretKeys = function (publicKeys) {
            publicKeys.splice(publicKeys.indexOf(_this.a), 1);
            publicKeys.forEach(function (publicKey) {
                _this.sharedSecretKeys.push(Math.pow(publicKey, _this.privateNum) % _this.config.dhPrimeModulo);
            });
        };
        this.myTurn = function () {
            return _this.schedule[_this.turnCounter % _this.schedule.length] == _this.turnKey;
        };
        this.buildXORMessages = function () {
            var xorMsg = [];
            var totalXOR = 0;
            var asciiMsg = [];
            _this.sharedSecretKeys.forEach(function (key) {
                totalXOR ^= key;
            });
            //console.log('totalXOR: ' + totalXOR);        
            if (_this.myTurn()) {
                //console.log('my turn: ' + this.myTurn());
                var message = _this.msgQueue.join();
                //console.log('msg from msgQueue: ' + message);
                var messageLength = message.length;
                for (var i = 0; i < messageLength; i++) {
                    asciiMsg.push(message.charCodeAt(i));
                }
                //console.log('asciiMsg: ' + asciiMsg);
                var asciiMsgLength = asciiMsg.length;
                for (var j = 0; j < asciiMsgLength; j++) {
                    xorMsg.push(asciiMsg[j] ^ totalXOR);
                }
                _this.msgQueue = [];
            }
            else {
                xorMsg.push(totalXOR);
            }
            while (xorMsg.length < _this.config.maxMsgLength) {
                xorMsg.push(0);
            }
            //console.log('xorMsg: ' + xorMsg);
            setTimeout(function () { _this.socket.emit('xorMsg', { topic: _this.topic, xorMessageList: xorMsg }); }, 50);
        };
        this.setupSocketListeners = function () {
            _this.socket.on('plainTextMsg', function (message) {
                _this.showMsg(message.msg);
                _this.turnCounter = message.turnCounter;
                _this.socket.emit('readyForNextRound', _this.topic);
            });
            _this.socket.on('dhAndScheduleData', function (metadata) {
                //console.log('--> received dh, schedule, bC');
                //console.log('  > build turn key and shared secret keys...');            
                _this.resetData();
                _this.schedule = metadata.schedule;
                _this.buildTurnKey(metadata.bC);
                _this.buildSharedSecretKeys(metadata.dhData);
                console.log('    > schedule: ' + _this.schedule);
                //console.log('    > turn key: ' + this.turnKey);
                //console.log('    > shared secret keys: ' + this.sharedSecretKeys);
            });
            _this.socket.on('buildClientMetadata', function () {
                console.log('\n--> received task to build metadata');
                _this.sendClientMetadata();
            });
            _this.socket.on('subscribedToTopic', function () {
                //console.log('\n--> server accepted topic subscription request');
                _this.sendClientMetadata();
            });
            _this.socket.on('startChat', function () {
                //console.log('[start chat]');
                _this.buildXORMessages();
            });
            _this.socket.on('latencyData', function (latencyList) {
                _this.latencyData = latencyList;
            });
            _this.socket.on('pong', function () {
                var latency = Date.now() - _this.startTime;
                _this.latencyData.push(latency);
            });
        };
        this.resetData = function () {
            _this.schedule = [];
            _this.sharedSecretKeys = [];
            _this.turnKey = 0;
        };
    }
    return ClientBase;
})();
//# sourceMappingURL=clientBase.js.map