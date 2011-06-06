var static = require('node-static')
   ,file = new(static.Server)('./public')
   ,exec = require('child_process').exec
   ,nowjs = require("now")
   ,firmata = require('firmata');
var httpServer = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    });
});
var everyone = nowjs.initialize(httpServer);
var currentBoard;

everyone.now.getPins=function(port,callback){
    if(!currentBoard){
        currentBoard = new firmata.Board(port,function(){
            everyone.now.MODES=currentBoard.MODES;
            callback(currentBoard.pins);
            currentBoard.on('analog-read',function(e){
                everyone.now.analogRead(e.pin,e.data);
            });
            currentBoard.on('digital-read',function(e){
                everyone.now.digitalRead(e.pin,e.value);
            });
        });
    }else{
        callback(currentBoard.pins);
    }
};

everyone.now.pinMode=function(pin,mode){
    currentBoard.pinMode(number,mode);
};
everyone.now.digitalWrite=function(pin,value){
    currentBoard.digitalWrite(pin,value);
};
everyone.now.analogWrite=function(pin,value){
    currentBoard.analogWrite(pin,value);
};

everyone.now.getUSBPorts = function(callback){
  exec('ls /dev/ttyS*',function(error,stdout,stderror){
      var portArray = stdout.trim().split('\n');
      var ports =[];
      for(var i=0,length = portArray.length; i < length; i++){
          ports.push({port:portArray[i]});
      }
      callback(ports);
  });
};
httpServer.listen(8080);