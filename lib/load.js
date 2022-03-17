//var http = require('http');
var fs = require('fs');

exports.seat_img = function(request, response){
  fs.readFile(`./lib/img/seat.GIF`, function(err, img){
    response.writeHead(200);
    response.write(img);
    response.end();
  })
}

exports.airplane_img = function(request, response){
  fs.readFile(`./lib/img/airplane.GIF`, function(err, img){
    response.writeHead(200);
    response.write(img);
    response.end();
  })
}
