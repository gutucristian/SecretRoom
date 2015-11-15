declare var require;

class Server {
    private io: any;
    private chatTopicList: Array<ChatTopic> = [];
    private utils = new Utils();
    private config = new Config();    

    constructor(http) {        
        this.io = require('socket.io')(http);
        this.config.topics.forEach((topic) => {
            this.chatTopicList.push(new ChatTopic(topic));
        });        
    }

    public run = () => {
        this.io.on('connection', (socket) => {
            console.log('client connected (id: ' + socket.id + ')');            

            socket.on('ping', function () {
                socket.emit('pong');
            });

            socket.on('subscribeClientToTopic', (topic: string, isBot: boolean) => {
                var chatTopic = this.getChatTopic(topic);                
                socket.chatTopic = topic;                

                this.removeClientSocket(socket, false);
                chatTopic.subscribeSocketToTopic(socket, isBot);                            
                socket.emit('subscribedToTopic');

                //this.printClients();
            });

            socket.on('disconnect', () => {
                //console.log('client disconnected (id: ' + socket.id + ')');             
                this.removeClientSocket(socket, true);
            });

            socket.on('clientMetadata', (metadata) => {
                var chatTopic = this.getChatTopic(metadata.topic);

                this.addClientDataToTopic(socket, metadata.topic, metadata.a);
                
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

            socket.on('xorMsg', (xorMsg) => {
                this.addClientXORmsgToTopic(xorMsg.topic, xorMsg.xorMessageList);
            });

            socket.on('readyForNextRound', (topic: string) => {
                var chatTopic = this.getChatTopic(topic);

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
    }    

    private broadcastMsgToTopic = (clientMsg) => {
        var chatTopic = this.getChatTopic(clientMsg.topic);        

        chatTopic.getClientSockets().forEach((clientSocket) => {
            clientSocket.emit('plainTextMsg', { msg: clientMsg.msg, turnCounter: chatTopic.getTurnCounter() });
        });                            
    }

    private addClientXORmsgToTopic = (topic, xorMsgList) => {
        var chatTopic = this.getChatTopic(topic);

        chatTopic.addClientXORmsg(xorMsgList);

        if (chatTopic.getXORmsgListsLength() == chatTopic.getAmtOfClients()) {
            var msg = chatTopic.deriveMsg();
            this.broadcastMsgToTopic({ topic: topic, msg: msg });
        }
    }

    private addClientDataToTopic = (socket, topic: string, data: number) => {
        var chatTopic = this.getChatTopic(topic);
        
        chatTopic.addClientData(socket, data);

        if (!chatTopic.getOngoingChat()) {
            if (chatTopic.getAmtOfClients() >= 3 && chatTopic.getClientDataLength() == chatTopic.getAmtOfClients()) {
                chatTopic.sendChatMetadata();
            }
        }
    }

    private removeClientSocket = (clientSocket, requireNewMetadata) => {        
        var chatTopic = this.getChatTopic(clientSocket.chatTopic);
        if (chatTopic != undefined) {                        
            if (requireNewMetadata) {
                chatTopic.setNeedNewMetadata(true);
            }
            chatTopic.removeClientSocket(clientSocket);
        }             
    }    

    private getChatTopic = (topic) => {
        for (var i = 0; i < this.chatTopicList.length; i++) {
            if (this.chatTopicList[i].getTopic() == topic) {
                return this.chatTopicList[i];
            }
        }
    };

    private printClients = () => {
        console.log('\n');
        this.chatTopicList.forEach((chatTopic) => {
            console.log('--> clients in topic: ' + chatTopic.getTopic());
            chatTopic.getClientSockets().forEach((socket) => {
                console.log(' > id: ' + socket.id);
            });
        });
    }    
}