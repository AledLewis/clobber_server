var fs = require('fs');
var changeListeners = [];
var projectConfig;

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
exports.changeListeners = changeListeners;
exports.projectConfig = function(){
  return projectConfig;
}

exports.addSlobGlob = function(slobGlob){
  projectConfig.slobGlobs.push(slobGlob);
  changeCallbacks();
}
