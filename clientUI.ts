declare var $;
declare var io;

class ClientUI extends ClientBase {

    constructor() {
        super();

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {            
            console.log('mobile browser');
            $('#myModal').modal({
                backdrop: 'static',
                keyboard: false
            })
            $('#myModal').modal('show');
        } else {             
            this.setSocket(io.connect(this.config.socketToEndpoint))
            this.setupSocketListeners();
            this.buildUI();
        }
    }

    protected showMsg = (msg: string) => {
        if (msg.length > 1) {
            var chatMsg = $('#chatMsgs');

            chatMsg.append('\n[' + this.getTime() + ']: ' + msg);

            chatMsg.animate({
                scrollTop: chatMsg[0].scrollHeight - chatMsg.height(),
            }, 1000);
        }        
    }

    private getTime = () => {
        var time = new Date();
        return time.toLocaleTimeString(); 
    }

    private connectToTopic = (topic: string) => {
        this.subscribeToTopic(topic, false);        
                
        $("msgBox").prop('disabled', false);
        $("#sendBtn").prop('disabled', false);
        $("#chatMsgs").text('');
        $("#navbar-brand").text("SecretRoom | " + this.topic);
    }

    private buildUI = () => {
        $(document).ready(() => {
            var topicMenu = '';

            this.config.topics.forEach((topic) => {
                topicMenu += "<li><a href='#' onclick=\"clientUI.connectToTopic('" + topic + "')\">" + topic + "</a></li>";
            });                        

            $("#chatTopics").append(topicMenu);

            $("#sendBtn").click(() => {
                if ($("#msgBox").val().length > 1){
                    this.msgQueue.push($("#msgBox").val());
                }                
                //console.log('--> msgQueue: ' + this.msgQueue);
                $("#msgBox").val('');
            });

            $("#stats").click(() => {
                console.log(this.latencyData.join(","));
            });
            
            $("msgBox").prop('disabled', true);
            $("#sendBtn").prop('disabled', true);                           

            $('#msgBox').keypress((e) => {
                if (e.which == 13) {
                    $("#sendBtn").click();
                    return false;    
                }
            });
        });
    }
}

var clientUI = new ClientUI();