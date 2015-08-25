var clobProject = rootRequire('app/models/clobProject');

exports.setProjectReq = function(req,res){
  clobProject.setProject(req.body.projectFilePath);
  res.send(clobProject.projectConfig());
}

exports.getProjectReq = function(req,res){
  res.send(clobProject.projectConfig());
}

exports.getSlobGlobsReq = function(req,res){
  console.log('Getting slob globs');
  res.send(clobProject.projectConfig().slobGlobs);
}

exports.addSlobGlobReq = function(req,res){
  clobProject.addSlobGlob(req.body.slobGlob)
  res.send({"result":"success"});
}

