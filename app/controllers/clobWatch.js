var clobWatch = require('models/clobWatch');

exports.startClobReq = function(req, res){

  clobWatch.startClob();
  res.send('start');
}

exports.stopClobReq = function(req,res){
  clobWatch.stopClob();
  res.send('stop');
}

exports.status= function(req,res){
  res.send('status');
}

require('models/clobProject').changeListeners.push(
  function(projectConfig){
  
    clobWatch.setConfig(projectConfig);
    if(clobWatch.clobbing()){
      clobWatch.stopClob();
      clobWatch.startClob();
    }
    
  }
)



