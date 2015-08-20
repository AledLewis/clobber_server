var fs = require('fs');

var projectConfig;
var changeListeners = [];

exports.changeListeners = changeListeners;

exports.setProjectReq = function(req,res){
  setProject(req.body.projectFilePath);
  res.send(projectConfig);
}

function changeCallbacks(){
  for (i = 0; i < changeListeners.length; i++) {
    changeListeners[i](projectConfig);
  }
}

function setProject (filePath){
  projectConfig = loadConfigFile(filePath);
  changeCallbacks();
}

function loadConfigFile(filename){
  console.log('Attempting to parse ' + filename + ' as a clobber project');
  console.log('Success');
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (e) {
    console.log(e);
  }
}

exports.setProject = setProject;

exports.getProjectReq = function(req,res){
  res.send(projectConfig);
}

exports.getSlobGlobsReq = function(req,res){
  res.send(projectConfig.slobGlobs);
}

exports.addSlobGlobReq = function(req,res){
  projectConfig.slobGlobs.push(req.body.slobGlob);
  changeCallbacks();
  res.send({"result":"success"});
}