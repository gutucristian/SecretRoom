class Config{
    public topics: Array<string> = ['Politics', 'School', 'Fun'];
    public dhGenerator: number = 2;
    public dhPrimeModulo: number = 4294967295;
    public privateNumMax: number = 10;
    public privateNumMin: number = 1;   
    public maxMsgLength: number = 16; 
    public socketToEndpoint = "http://localhost:3000";
    public socketToEndpoint1 = "http://srmit.azurewebsites.net";    
}