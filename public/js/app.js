function loadSlobGlobs(){
  $.ajax({
    method:"GET", 
    url:"/api/clobProject/slobGlobs",
    success: function(slobGlobs){
      
      var $globs = $('#globs');
      $globs.empty();
      slobGlobs.forEach(function(glob) {
        $globs.append($('<li/>').text(glob));
      });
    }
  });
}

$(document).ready(function(){

  var socket = io();
  
  socket.on('clob', function(msg){

   var new_list_item = $("<li></li>");
   
   var bootstrap_class = msg.result==='success'?'success':'danger';
   var d = new Date();
   
   new_list_item.append(
     $('<div>', {"class":"panel panel-"+bootstrap_class})
     .append( 
       $('<div>', {"class":"panel-heading"})
       .append(
         $('<div>', {"class":"panel-title"}).text(msg.result+" "+d.toLocaleString())
       )
     ).append(
       $('<div>', {"class":"panel-body"}).append($('<strong>').text(msg.file_location))
       .append(
       
         $('<div>', {"class":"hide"})
         .append(
           $('<p>').text(msg.build_output)
         )
         .append(
           $('<p>').text(msg.run_output)
         )
         .append(
           msg.err?$('<p>').text(JSON.stringify(msg.err)):"" 
         )
         .append(
           msg.err_out?$('<p>').text(msg.err_out):"" 
           
         )
       )
       .append(
         $('<a>', {"style":"display:block"}).text('Show/hide details').click(function(ev) {
           var parent = $(this).parent().find("div").toggleClass("hide");
         })
       )
     )
   );

   
   $('#clobs').prepend(new_list_item);


    
  });

  socket.on('status_message', function(msg){
    $('#status_message').text(msg)
  });

  socket.on('status', function(msg){
    $('#status').text(msg)
  });

  $('#stop').click(function(){
    $.ajax({
      method:"DELETE",
      url:"/api/clobWatch"
    });
    return false;
  });

  $('#start').click(function(){
    $.ajax({
      method:"PUT",
      url:"/api/clobWatch"
    });
    return false;
  });
  
  $('#addGlob').click(function(){
    
    var globToAdd = $('#globToAdd').val();
    
    $.ajax({
      method:"POST", 
      contentType: "application/json",
      processData :false,
      url:"/api/clobProject/slobGlobs",
      data:JSON.stringify({slobGlob:globToAdd}),
      success: loadSlobGlobs
    });
  });
  
  $.ajax({
    method:"GET", 
    url:"/api/clobProject",
    success: function(projectData){
      $('#projectName').text(projectData.projectName);
      $('#codeSourcePath').text(projectData.scriptrunner.codeSourcePath);
      $('#scriptRunnerLocation').text(projectData.scriptrunner.jarLocation);
    }
  });
  
  loadSlobGlobs();
});