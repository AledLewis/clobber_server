var express = require('express');
var slobber = require('slobber');
var fs = require('fs');
var gaze = require('gaze');
var notifier = require('node-notifier');
var bodyParser = require('body-parser');

module.exports.server = function (configFileLocation){

var slobberApp = express();

var router = express.Router();

//code to be moved to client
slobberApp.get('/', function (req, res){
  res.render('index', {
    "project" : config.scriptrunner.projectName, 
    "scriptRunner" : config.scriptrunner.jarLocation,
    "codeSource" : config.scriptrunner.codeSourcePath
  });
});
slobberApp.use('/js', express.static(__dirname + '/js'));
slobberApp.use('/css', express.static(__dirname + '/css'));
slobberApp.set('view engine', 'jade');
slobberApp.set( 'views', __dirname +'/views');

function handleResponse(slobberResponse){
  if (slobberResponse.result === "success"){
    console.log('Clob success');
    io.emit('clob', slobberResponse);
    notifier.notify({
      'title': 'Slobber',
      'message': "Successfully clobbed"
    });
  }
  else {
    console.log('Clob failure');
    io.emit('clob' ,slobberResponse);
    notifier.notify({
      'title': 'Clobber',
      'message': "Failed to clob"
    });
  }
}
//end code to be moved to client
router.use(bodyParser.json());

router.route('/clobWatch')
  .put(function(req,res){
    console.log('Attempting to start listening on '+config.scriptrunner.codeSourcePath);
    startClob();    
    res.send('start');
  })
  .delete(function(req,res){
    console.log('Stopping listening on '+config.scriptrunner.codeSourcePath);
    stopClob();
    res.send('stop');
  })
  .get(function(req,res){
    console.log('Received request for status');
    res.send({
      "Status":"status"    
    });
  });
  
router.route('/clobProject')
  .post (function(req,res){
    stopClob();
    loadConfigFile(req.body.projectFilePath);
    startClob();
    
    res.send(config);
  })
  .get (function(req,res){
    res.send(config);
  });

slobberApp.use('/api', router);

//7562 == slob :)
var slobberServer = slobberApp.listen(7562, function() {
  var host = slobberServer.address().address;
  var port = slobberServer.address().port;
  console.log('slobber server listening at http://%s:%s', host,port);
});

var io = require('socket.io').listen(slobberServer);



var config;

function loadConfigFile(filename){
  console.log('Attempting to parse ' + filename + ' as a clobber project');
  console.log('Success');
  try {
    config = JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (e) {
    console.log(e);
  }
}

loadConfigFile(configFileLocation);

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

var slobberImpl;

//TODO move out of here into a model thingy

function startClob(){
  slobberImpl = slobber.getInstance(config);
  
  gaze(config.scriptrunner.codeSourcePath+'/**',function(err,watcher){
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
  io.emit('status', 'on');
  io.emit('status_message', 'Started listening on '+config.scriptrunner.codeSourcePath);
}

// TODO move out of here into a model thingy
function stopClob(){
  gaze.close();
  io.emit('status', 'off');
  io.emit('statusMessage', 'Stopping listening on '+config.scriptrunner.codeSourcePath);
} 

startClob();

};
