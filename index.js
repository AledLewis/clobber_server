var express = require('express');
var clobber = require('clobber');
var fs = require('fs');
var watch = require('watch');
var notifier = require('node-notifier');

module.exports.server = function (config_file_location){

var clobber_app = express();

clobber_app.use('/js', express.static(__dirname + '/js'));
clobber_app.use('/css', express.static(__dirname + '/css'));

clobber_app.set('view engine', 'jade');
clobber_app.set( 'views', __dirname +'/views');

clobber_app.get('/', function (req, res){
  res.render('index', {
    "project" : config.scriptrunner.project_name, 
    "scriptRunner" : config.scriptrunner.jarLocation,
    "codeSource" : config.scriptrunner.codeSourcePath
});
});


clobber_app.post('/stop', function(req,res){
  
  watch.unwatchTree(config.scriptrunner.codeSourcePath);
  console.log('Stopping listening on '+config.scriptrunner.codeSourcePath);
  io.emit('status', 'off');
  io.emit('status_message', 'Stopping listening on '+config.scriptrunner.codeSourcePath);
  res.send('stop');
});

clobber_app.post('/start', function(req,res){
  console.log('Starting listening on '+config.scriptrunner.codeSourcePath);
  start_clob();
  res.send('start');
});

var clobber_server = clobber_app.listen(2562, function() {
    var host = clobber_server.address().address;
    var port = clobber_server.address().port;
    console.log('Clobber server listening at http://%s:%s', host,port);
});

var io = require('socket.io').listen(clobber_server);




var config;
try {
  config = JSON.parse(fs.readFileSync(config_file_location, 'utf8'));
  } catch (e) {
  if (e instanceof SyntaxError) {
    console.log(e);
    process.exit(1)
  }
}

io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.on('clob', function(msg){
    console.log(msg);
  });


  socket.on('status', function(msg){
    io.emit('status', 'on')
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
});

var clobber_impl = clobber.get_instance(config);

function start_clob(){
  watch.watchTree(config.scriptrunner.codeSourcePath, function(f, curr, prev) {
    
    if (typeof f == "object" && prev === null && curr === null) {
      // Finished walking the tree
    } else if (curr.nlink === 0) {
      // file deleted
    } else { 
      clobber_impl(
        f
      , function(clob_result){
          if (clob_result.result === "success"){
            io.emit('clob', clob_result);
            notifier.notify({
              'title': 'Successfully Clobbed',
              'message': clob_result.file_location
            });
          }
          else {
            io.emit('clob' ,clob_result);
            notifier.notify({
              'title': 'Clob Failure',
              'message': clob_result.file_locationh
            });
          }
      });  
    }
  });

  io.emit('status', 'on');
  io.emit('status_message', 'Started listening on '+config.scriptrunner.codeSourcePath);
  

}

start_clob();

};
