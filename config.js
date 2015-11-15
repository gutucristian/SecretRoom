var Config = (function () {
    function Config() {
        this.topics = ['Politics', 'School', 'Fun'];
        this.dhGenerator = 2;
        this.dhPrimeModulo = 4294967295;
        this.privateNumMax = 10;
        this.privateNumMin = 1;
        this.maxMsgLength = 16;
        this.socketToEndpoint = "http://localhost:3000";
        this.socketToEndpoint1 = "http://srmit.azurewebsites.net";
    }
    return Config;
})();
//# sourceMappingURL=config.js.map