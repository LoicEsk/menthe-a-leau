// variables globales
var dataGlobal = [];

// connection IO
var socket = io.connect();
socket.emit('ping');

socket.on('message', function(data){
	var msgHTML = $("<p/>").html(data);
	$("#data-serial").append(msgHTML);
});
socket.on('donnees', function(data){
	var dataObj = data.paseJSON;
	var dataID = dataObj.cle;
	dataGlobal[dataID].push(dataObj.valeur);

	var msgHTML = $("<div/>").html(dataObj.cle + ' = ' + dataObj.value);
	$("#content").append(msgHTML);
})

socket.on('serial', function(data){
	var $dataZone = $('#data-serial');
	data.replace('#\n#g', '<br />');
	$dataZone.html($dataZone.html() + data);
	
});

$('form').submit(function(event){
	alert('submit !');
	socket.emit('serial', $(this, 'input').text());
	alert($(this, 'input').text());
	return false;
});