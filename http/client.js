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
	var res = String.fromCharCode(10);
	//var nData = data.replace('#'+res+'#g', '<br />');
	var nData = "";
	
	for(var i=0; i<data.length; i++){
		if(data.charCodeAt(i) == 13){
			nData += '<br />';
		}else
			nData += data.charAt(i);
	}
	//console.log('data converit : %s', nData);
	$dataZone.html($dataZone.html() + nData);
	window.scrollTo(0, document.body.scrollHeight);
});

$('form').submit(function(event){
	alert('submit !');
	socket.emit('serial', $(this, 'input').text());
	alert($(this, 'input').text());
	return false;
});