var Gaze = require('gaze').Gaze;
var slobber = require('slobber');
var notifier = require('node-notifier');

var currentConfig;
var slobberImpl;
var gaze = new Gaze();
var clobbing = false;

function handleResponse(slobberResponse){
  if (slobberResponse.result === "success"){
    console.log('Clob success');
    notifier.notify({
      'title': 'Slobber',
      'message': "Successfully clobbed"
    });
  }
  else {
    console.log('Clob failure');
    notifier.notify({
      'title': 'Clobber',
      'message': "Failed to clob"
    });
  }
}
//Begin stuff that should be in a model 
function stopClob(){
  if (clobbing) {
    console.log('Stopping listening on '+currentConfig.scriptrunner.codeSourcePath);
    gaze.close();
  }else{
    console.log('Not doing anything as not clobbing');
  }
  clobbing = false;
}

function startClob(){
   console.log('Attempting to start listening on '+currentConfig.scriptrunner.codeSourcePath);
  
  gaze.on('changed', function(filePath){
    slobberImpl(
      filePath
    , handleResponse
    );  
  });
  
  gaze.on('added', function(filePath){
    slobberImpl(
      filePath
    , handleResponse
    );
  });
  
  console.log("Current globs to listen on are "+currentConfig.slobGlobs);
  
  gaze.add(currentConfig.slobGlobs.map(function(path){return currentConfig.scriptrunner.codeSourcePath+"/"+path}));
  
  clobbing = true;
}


exports.setConfig = function(config){
  currentConfig = config;
  slobberImpl = slobber.getInstance(currentConfig);
}
exports.stopClob = stopClob;
exports.startClob = startClob;
// end stuff that should be in a model

exports.startClobReq = function(req, res){

  startClob();
  res.send('start');
}

exports.stopClobReq = function(req,res){
  stopClob();
  res.send('stop');
}

exports.status= function(req,res){
  res.send('status');
}




