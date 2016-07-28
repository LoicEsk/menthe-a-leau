/*
	Scrit Node.js pout le test des envois de données vers le plugin WordPress
*/


// We need this to build our post string
var querystring = require('querystring');
var http = require('http');
var fs = require('fs');

function PostCode() {
  // Build the post string from an object
  var post_data = querystring.stringify({
   'action': 'datalizer_setData',
	 'donnee' : 'test',
	 'valeur' : 50
  });
  console.log('Requete: \n--------------\n' + post_data);

  // An object of options to indicate where to post to
  var post_options = {
      host: 'localhost',
      port: '80',
      path: '/home/wp-admin/admin-ajax.php',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: \n--------------\n' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}


PostCode();
