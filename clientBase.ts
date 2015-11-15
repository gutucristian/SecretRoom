class ClientBase {
    protected config = new Config();
    protected socket: any;
    protected topic: string = '';
    protected schedule: Array<number> = [];
    protected privateNum: number = 0;
    protected a: number = 0;
    protected sharedSecretKeys: Array<number> = [];
    protected turnKey: number = 0;
    protected turnCounter: number = 0;
    protected msgQueue: Array<string> = [];      
    protected latencyData: Array<number> = [];
    protected startTime: number;

    constructor() {        
    }

    protected setSocket = (socket: any) => {
        this.socket = socket;   
         
        setInterval(() => {
            this.startTime = Date.now();
            this.socket.emit('ping');
        }, 3000);    
    }

    protected subscribeToTopic = (topic: string, isBot: boolean) => {
        this.topic = topic;
        this.socket.emit('subscribeClientToTopic', this.topic, isBot);
    }

    protected sendMsg = (msg: string) => {
        this.socket.emit('clientMsg', { topic: this.topic, msg: msg });
    }

    protected showMsg = (msg: string) => {
        if (msg.length > 1) { 
            //console.log('message: ' + msg); 
        }
    }

    protected buildClientMetadata = () => {
        this.privateNum = Math.floor((Math.random() * this.config.privateNumMax) + this.config.privateNumMin);
        this.a = Math.pow(this.config.dhGenerator, this.privateNum) % this.config.dhPrimeModulo;        
    }

    protected sendClientMetadata = () => {
        //console.log('  > build & send client metadata');
        this.buildClientMetadata();        
        this.socket.emit('clientMetadata', { topic: this.topic, a: this.a });
    }    

    private buildTurnKey = (bC: number) => {   
        this.turnKey = Math.pow(bC, this.privateNum) % this.config.dhPrimeModulo;        
    }

    private buildSharedSecretKeys = (publicKeys: Array<number>) => {                
        publicKeys.splice(publicKeys.indexOf(this.a), 1);                
        publicKeys.forEach((publicKey) => {
            this.sharedSecretKeys.push(Math.pow(publicKey, this.privateNum) % this.config.dhPrimeModulo);            
        });        
    }

    protected myTurn = () => {
        return this.schedule[this.turnCounter % this.schedule.length] == this.turnKey;
    }

    public buildXORMessages = () => {
        var xorMsg: Array<number> = [];
        var totalXOR: number = 0;
        var asciiMsg: Array<number> = [];

        this.sharedSecretKeys.forEach((key) => {
            totalXOR ^= key;                        
        });
        //console.log('totalXOR: ' + totalXOR);        

        if (this.myTurn()) {
            //console.log('my turn: ' + this.myTurn());
            var message = this.msgQueue.join();
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

            this.msgQueue = [];
        } else {
            xorMsg.push(totalXOR);
        }

        while (xorMsg.length < this.config.maxMsgLength) {
            xorMsg.push(0);
        }        

        //console.log('xorMsg: ' + xorMsg);
        setTimeout(() => { this.socket.emit('xorMsg', { topic: this.topic, xorMessageList: xorMsg }); }, 50);        
    }

    protected setupSocketListeners = () => {
        this.socket.on('plainTextMsg', (message) => {            
            this.showMsg(message.msg);
            this.turnCounter = message.turnCounter;
            this.socket.emit('readyForNextRound', this.topic);
        });

        this.socket.on('dhAndScheduleData', (metadata) => {
            //console.log('--> received dh, schedule, bC');
            //console.log('  > build turn key and shared secret keys...');            

            this.resetData();
            this.schedule = metadata.schedule;            
            this.buildTurnKey(metadata.bC);            
            this.buildSharedSecretKeys(metadata.dhData);

            console.log('    > schedule: ' + this.schedule);
            //console.log('    > turn key: ' + this.turnKey);
            //console.log('    > shared secret keys: ' + this.sharedSecretKeys);
        });

        this.socket.on('buildClientMetadata', () => {
            console.log('\n--> received task to build metadata');           
            this.sendClientMetadata();            
        });

        this.socket.on('subscribedToTopic', () => {            
            //console.log('\n--> server accepted topic subscription request');
            this.sendClientMetadata();            
        });        

        this.socket.on('startChat', () => {
            //console.log('[start chat]');
            this.buildXORMessages();
        });     
        
        this.socket.on('latencyData', (latencyList) => {
            this.latencyData = latencyList;            
        });           
        
        this.socket.on('pong', () => {
            var latency = Date.now() - this.startTime;
            this.latencyData.push(latency);
        });     
    }    

    public resetData = () => {
        this.schedule = [];
        this.sharedSecretKeys = [];
        this.turnKey = 0;        
    }
}