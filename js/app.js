$(document).ready(function(){

  var socket = io();
  
  socket.on('clob', function(msg){
    $('#clobs').append($('<li>').text(msg));
  });

  socket.on('status', function(msg){
    $('#status').text(msg)
  });

  $('#stop').click(function(){
    $.ajax({
      method:"POST",
      url:"/stop"
    });
    return false;
  });
  $('#start').click(function(){
    $.ajax({
      method:"POST",
      url:"/start"
    });
    return false;
  });
});
