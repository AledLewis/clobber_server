require('app-module-path').addPath(__dirname + '/app');
var express = require('express');
var bodyParser = require('body-parser');
var clobProjectController = require('controllers/clobProjects');
var clobWatchController = require('controllers/clobWatch');
var slobberApp = express();
var router = express.Router();

//code to be moved to client
// slobberApp.get('/', function (req, res){
  // res.render('index', {
    // "project" : config.scriptrunner.projectName, 
    // "scriptRunner" : config.scriptrunner.jarLocation,
    // "codeSource" : config.scriptrunner.codeSourcePath
  // });
// });
slobberApp.use('/js', express.static(__dirname + '/js'));
slobberApp.use('/css', express.static(__dirname + '/css'));
slobberApp.set('view engine', 'jade');
slobberApp.set( 'views', __dirname +'/views');

//end code to be moved to client
router.use(bodyParser.json());

router.route('/clobWatch')
  .put(clobWatchController.startClobReq)
  .delete(clobWatchController.stopClobReq);
  
router.route('/clobProject')
  .post (clobProjectController.setProjectReq)
  .get (clobProjectController.getProjectReq);

router.route('/clobProject/slobGlobs')
  .get(clobProjectController.getSlobGlobsReq)
  .post(clobProjectController.addSlobGlobReq);
  
slobberApp.use('/api', router);

//7562 == slob :)
var slobberServer = slobberApp.listen(7562, function() {
  var host = slobberServer.address().address;
  var port = slobberServer.address().port;
  console.log('slobber server listening at http://%s:%s', host,port);
});

var io = require('socket.io').listen(slobberServer);

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

require('models/clobProject').setProject('config.json');
