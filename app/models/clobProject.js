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
  var glob_index = projectConfig.slobGlobs.indexOf(slobGlob);
  if(glob_index == -1){
    projectConfig.slobGlobs.push(slobGlob);
    projectConfig.slobGlobs.sort();
    changeCallbacks();
  } else {
    console.log("Glob \"" + slobGlob + "\" already exists");
  }
}

exports.removeSlobGlob = function(slobGlob){
  var glob_index = projectConfig.slobGlobs.indexOf(slobGlob);
  if(glob_index != -1){
    projectConfig.slobGlobs.splice(glob_index, 1);  
    changeCallbacks();
  }
}