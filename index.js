module.exports.server = function(configFile, callback){
  require('./server.js')(configFile);
  if (callback) callback();  
  
};
