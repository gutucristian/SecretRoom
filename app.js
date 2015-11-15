var express = require('express');
var app = express();
var http = require('http').Server(app);
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/Client.html');
});
var port = process.env.port || 3000;
http.listen(port, function () {
    console.log('listening on *:' + port);
    var server = new Server(http);
    server.run();
});
//# sourceMappingURL=app.js.map