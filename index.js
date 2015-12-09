module.exports.server = function(callback){
  require('./server.js')
  if (callback) callback();  
  
};
