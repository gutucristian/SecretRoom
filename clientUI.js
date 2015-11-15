var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ClientUI = (function (_super) {
    __extends(ClientUI, _super);
    function ClientUI() {
        var _this = this;
        _super.call(this);
        this.showMsg = function (msg) {
            if (msg.length > 1) {
                var chatMsg = $('#chatMsgs');
                chatMsg.append('\n[' + _this.getTime() + ']: ' + msg);
                chatMsg.animate({
                    scrollTop: chatMsg[0].scrollHeight - chatMsg.height(),
                }, 1000);
            }
        };
        this.getTime = function () {
            var time = new Date();
            return time.toLocaleTimeString();
        };
        this.connectToTopic = function (topic) {
            _this.subscribeToTopic(topic, false);
            $("msgBox").prop('disabled', false);
            $("#sendBtn").prop('disabled', false);
            $("#chatMsgs").text('');
            $("#navbar-brand").text("SecretRoom | " + _this.topic);
        };
        this.buildUI = function () {
            $(document).ready(function () {
                var topicMenu = '';
                _this.config.topics.forEach(function (topic) {
                    topicMenu += "<li><a href='#' onclick=\"clientUI.connectToTopic('" + topic + "')\">" + topic + "</a></li>";
                });
                $("#chatTopics").append(topicMenu);
                $("#sendBtn").click(function () {
                    if ($("#msgBox").val().length > 1) {
                        _this.msgQueue.push($("#msgBox").val());
                    }
                    //console.log('--> msgQueue: ' + this.msgQueue);
                    $("#msgBox").val('');
                });
                $("#stats").click(function () {
                    console.log(_this.latencyData.join(","));
                });
                $("msgBox").prop('disabled', true);
                $("#sendBtn").prop('disabled', true);
                $('#msgBox').keypress(function (e) {
                    if (e.which == 13) {
                        $("#sendBtn").click();
                        return false;
                    }
                });
            });
        };
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            console.log('mobile browser');
            $('#myModal').modal({
                backdrop: 'static',
                keyboard: false
            });
            $('#myModal').modal('show');
        }
        else {
            this.setSocket(io.connect(this.config.socketToEndpoint));
            this.setupSocketListeners();
            this.buildUI();
        }
    }
    return ClientUI;
})(ClientBase);
var clientUI = new ClientUI();
//# sourceMappingURL=clientUI.js.map