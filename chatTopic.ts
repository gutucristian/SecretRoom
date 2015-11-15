class ChatTopic {
    private config = new Config();
    private topic: string = '';
    private clientSockets: any = [];
    private clientUISockets: any = [];
    private amtOfClients: any = 0;
    private clientData: Array<number> = [];
    private schedule: Array<number> = [];
    private orderedClientSockets: any = [];
    private xorMsgLists: any = [];
    private utils = new Utils();
    private turnCounter: number = 0;
    private amtOfClientReadyForNextRound = 0;
    private ongoingChat = false;    
    private needNewMetadata = false;
    public activeSockets = [];

    constructor(topic: string) {
        this.topic = topic;
    }

    public subscribeSocketToTopic = (clientSocket, isBot: boolean) => {
        this.addClientSocket(clientSocket, isBot);
    }        

    public sendChatMetadata = () => {        
        var bCList = [];
        do {
            this.schedule = [];
            bCList = [];
            this.clientData.forEach((publicKey) => {                
                var privateNumber = Math.floor((Math.random() * this.config.privateNumMax) + this.config.privateNumMin);
                this.schedule.push(Math.pow(publicKey, privateNumber) % this.config.dhPrimeModulo);
                var bC = Math.pow(this.config.dhGenerator, privateNumber) % this.config.dhPrimeModulo;
                bCList.push(bC);
                //console.log('shedule: ' + this.schedule);

                if (!this.utils.arrayIsUnique(this.schedule)) {
                    console.log('schedule: ' + this.schedule + ' is not unique so rebuild it');
                }
            });
        } while (!this.utils.arrayIsUnique(this.schedule));
        //console.log('schedule: ' + this.schedule + ' is unique so continue');

        var counter = 0;
        this.orderedClientSockets.forEach((clientSocket) => {
            clientSocket.emit('dhAndScheduleData', { dhData: this.clientData, schedule: this.schedule, bC: bCList[counter] });            
            counter++;
        });

        //console.log('schedule: ' + this.schedule);
    }
    
    public addClientData = (clientSocket, data: number) => {        
        this.orderedClientSockets.push(clientSocket);
        this.clientData.push(data);        
    };   

    public addClientXORmsg = (xorMsgList) => {
        this.xorMsgLists.push(xorMsgList);
    }    

    public deriveMsg = () => {
        var message = '';
        var currentCharXOR;

        this.parseXORmsgLists();
        var msgList = this.getMsgList();        

        if (!(msgList.length <= 1)) {
            // remove msgList from xorMsgLists
            for (var i = 0; i < this.xorMsgLists.length; i++) {
                if (this.utils.arrayEquals(this.xorMsgLists[i], msgList)) {
                    this.xorMsgLists.splice(i, 1);
                    break;
                }
            }

            for (var j = 0; j < msgList.length; j++) {
                currentCharXOR = msgList[j];                
                for (var k = 0; k < this.xorMsgLists.length; k++) {
                    var temp = currentCharXOR;
                    currentCharXOR = currentCharXOR ^ this.xorMsgLists[k][0];                    
                }                
                message += String.fromCharCode(currentCharXOR);
            }
        } else {
            message += '';
        }    

        return message;
    }      
    
    private addClientSocket = (socket, isBot: boolean) => {
        var clientExists = false;

        this.clientSockets.forEach((clientSocket) => {
            if (clientSocket.id === socket.id) {
                clientExists = true;
            }
        });

        if (!clientExists) {
            this.amtOfClients++;
            this.clientSockets.push(socket);
            if (!isBot) {
                this.clientUISockets.push(socket);
            }            
        }
    }

    public removeClientSocket = (socket) => {
        this.clientUISockets.forEach((clientSocket) => {
            //console.log('looping through socket: ' + clientSocket.id);
            if (clientSocket.id === socket.id) {
                var index = this.clientSockets.indexOf(clientSocket);
                this.clientSockets.splice(index, 1);
                this.amtOfClients--;
            }
        });        
    }

    public startChat = () => {        
        this.ongoingChat = true;
        this.turnCounter++;        
        this.clientSockets.forEach((clientSocket) => {            
            clientSocket.emit('startChat')
        });
    }

    public requestNewMetadata = () => {
        this.clientData = [];
        this.orderedClientSockets = [];
        this.clientSockets.forEach((clientSocket) => {
            clientSocket.emit('buildClientMetadata');
        });
        this.ongoingChat = false;
    }

    private parseXORmsgLists = () => {
        for (var i = 0; i < this.xorMsgLists.length; i++) {
            var currentList = this.xorMsgLists[i];
            var zeroIndex = currentList.indexOf(0);
            currentList.splice(zeroIndex);
        }
    }

    private getMsgList = () => {
        var messageList = [];
        var biggestLength = 0;
        for (var i = 0; i < this.xorMsgLists.length; i++) {
            if (this.xorMsgLists[i].length > biggestLength) {
                biggestLength = this.xorMsgLists[i].length;
                messageList = this.xorMsgLists[i];
            }
        }
        return messageList;
    }    

    public clearRoundData = () => {
        this.amtOfClientReadyForNextRound = 0;
        this.xorMsgLists = [];
    }

    public clearDataForNewMetadata = () => {        
        this.amtOfClientReadyForNextRound = 0;
        this.xorMsgLists = [];
        this.setNeedNewMetadata(false);
        this.schedule = [];
        this.turnCounter = 0;
    }

    public incrementAmtOfClientReadyForNextRound = () => {
        this.amtOfClientReadyForNextRound++;
    }
    
    public getTopic = () => {
        return this.topic;
    }

    public getClientSockets = () => {
        return this.clientSockets;
    }

    public getTurnCounter = () => {
        return this.turnCounter;
    }

    public getAmtOfClientReadyForNextRound = () => {
        return this.amtOfClientReadyForNextRound;
    }

    public getAmtOfClients = () => {
        return this.amtOfClients;
    }

    public getXORmsgListsLength = () => {        
        return this.xorMsgLists.length;
    }

    public getClientDataLength = () => {
        return this.clientData.length;
    }    

    public getOngoingChat = () => {
        return this.ongoingChat;
    }

    public getNeedNewMetadata = () => {
        return this.needNewMetadata;
    }

    public setOngoingChat = (val) => {
        this.ongoingChat = val;
    }    

    public getScheduleLength = () => {
        return this.schedule.length;
    }

    public getActiveSockets = () => {
        return this.activeSockets;
    }

    public setNeedNewMetadata = (val) => {
        this.needNewMetadata = val;
    }    
}