var Gaze = require('gaze').Gaze;
var slobber = require('slobber');
var currentConfig;
var slobberImpl;
var gaze = new Gaze();
var notifier = require('node-notifier');
var path = require('path');
var io;
var clobbing = true;

exports.setIO = function(newIO){
  io = newIO;
}

function stopClob(){
  if (clobbing) {
    console.log('Stopping listening on '+currentConfig.scriptrunner.codeSourcePath);
    gaze.close();
  }else{
    console.log('Not doing anything as not clobbing');
  }
  clobbing = false;
}

function handleResponse(slobberResponse){
  if (slobberResponse.result === "success"){
    console.log('Clob success');
    notifier.notify({
      'title': 'Success',
      'message': slobberResponse.clobFile
    });
  }
  else {
    console.log('Clob failure');
    notifier.notify({
      'title': 'Failure',
      'message': slobberResponse.clobFile
    });
  }
  io.emit('clob', slobberResponse);
}

function startClob(){
  
  console.log('Attempting to start listening on '+currentConfig.scriptrunner.codeSourcePath);
  console.log("Current globs to listen on are "+currentConfig.slobGlobs);
  var gaze = new Gaze([], {"cwd":currentConfig.scriptrunner.codeSourcePath});
  
  gaze.add(currentConfig.slobGlobs, function(){
    this.on('changed', function(filePath){
      slobberImpl(
        filePath
      , handleResponse
      );  
    });
    
    this.on('added', function(filePath){
      slobberImpl(
        filePath
      , handleResponse
      );
    });
  
  });

  clobbing = true;
}

exports.setConfig = function(config){
  currentConfig = config;
  slobberImpl = slobber.getInstance(currentConfig);
}

exports.clobbing = function(){
  return clobbing;
}

exports.stopClob = stopClob;
exports.startClob = startClob;