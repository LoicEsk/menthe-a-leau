// variables globales
var dataGlobal = [];

// connection IO
var socket = io.connect();
socket.emit('echo');

socket.on('message', function(data){
	var msgHTML = $("<div/>").html(data);
	$("#content").append(msgHTML);
});
socket.on('donnees', function(data){
	var dataObj = data.paseJSON;
	var dataID = dataObj.cle;
	dataGlobal[dataID].push(dataObj.valeur);

	var msgHTML = $("<div/>").html(dataObj.cle + ' = ' + dataObj.value);
	$("#content").append(msgHTML);
})

socket.on('serial', function(data){
	var msgHTML = $("<div/>").html(data);
	$("#serial").append(msgHTML);
	
});

$('form').submit(function(event){
	alert('submit !');
	socket.emit('serial', $(this, 'input').text());
	alert($(this, 'input').text());
	return false;
});