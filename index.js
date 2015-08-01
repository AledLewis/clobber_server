var express = require('express');
var slobber = require('slobber');
var fs = require('fs');
var watch = require('watch');
var notifier = require('node-notifier');

module.exports.server = function (configFileLocation){

var slobberApp = express();

slobberApp.use('/js', express.static(__dirname + '/js'));
slobberApp.use('/css', express.static(__dirname + '/css'));

slobberApp.set('view engine', 'jade');
slobberApp.set( 'views', __dirname +'/views');

slobberApp.get('/', function (req, res){
  res.render('index', {
    "project" : config.scriptrunner.projectName, 
    "scriptRunner" : config.scriptrunner.jarLocation,
    "codeSource" : config.scriptrunner.codeSourcePath
  });
});


slobberApp.post('/stop', function(req,res){
  watch.unwatchTree(config.scriptrunner.codeSourcePath);
  console.log('Stopping listening on '+config.scriptrunner.codeSourcePath);
  io.emit('status', 'off');
  io.emit('statusMessage', 'Stopping listening on '+config.scriptrunner.codeSourcePath);
  res.send('stop');
});

slobberApp.post('/start', function(req,res){
  console.log('Starting listening on '+config.scriptrunner.codeSourcePath);
  startClob();
  res.send('start');
});

//7562 == slob :)
var slobberServer = slobberApp.listen(7562, function() {
  var host = slobberServer.address().address;
  var port = slobberServer.address().port;
  console.log('slobber server listening at http://%s:%s', host,port);
});

var io = require('socket.io').listen(slobberServer);

var config;
try {
  config = JSON.parse(fs.readFileSync(configFileLocation, 'utf8'));
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

var slobberImpl = slobber.getInstance(config);

function startClob(){
  watch.watchTree(config.scriptrunner.codeSourcePath, function(f, curr, prev) {
    
    if (typeof f == "object" && prev === null && curr === null) {
      // Finished walking the tree
    } else if (curr.nlink === 0) {
      // file deleted
    } else { 
      slobberImpl(
        f
      , function(clobResult){
          if (clobResult.result === "success"){
            io.emit('clob', clobResult);
            notifier.notify({
              'title': 'Successfully Clobbed',
              'message': clobResult.fileLocation
            });
          }
          else {
            io.emit('clob' ,clobResult);
            notifier.notify({
              'title': 'Clob Failure',
              'message': clobResult.fileLocation
            });
          }
      });  
    }
  });

  io.emit('status', 'on');
  io.emit('status_message', 'Started listening on '+config.scriptrunner.codeSourcePath);

}

startClob();

};
