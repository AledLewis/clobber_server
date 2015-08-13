var Gaze = require('gaze').Gaze;
var slobber = require('slobber');
var notifier = require('node-notifier');

var currentConfig;
var slobberImpl;
var gaze = new Gaze();


exports.setConfig = function(config){
  currentConfig = config;
  slobberImpl = slobber.getInstance(currentConfig);
}

exports.startClob = function(req, res){

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
  
  res.send('start');
}

exports.stopClob = function(req,res){
  console.log('Stopping listening on '+currentConfig.scriptrunner.codeSourcePath);
  gazeWatcher.close();
  res.send('stop');
}

exports.status= function(req,res){
  res.send('status');
}

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
