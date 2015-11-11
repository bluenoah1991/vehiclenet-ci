var http = require('http');
var util = require('util');
var createHandler = require('github-webhook-handler');
var github = require('./lib/github');
var common = require('./lib/common');
var config = require('./config.json');

var handler = createHandler({ path: '/webhook', secret: config.local.secret });

console.log(util.format('Try installing webhook on github.com/%s', config.github.repository));
github.setup()
	.then(function(){
		console.log('Installation was successful');
	});

http.createServer(function(req, res){
	handler(req, res, function(err){
		res.statusCode = 404;
		res.end('no such location');
	});
}).listen(7777);

console.log('Update Github repository');
github.update()
.then(function(){
	debugger;
	common.update_container();
});

console.log('Register Github push event');

handler.on('error', function(err){
	debugger;
	console.error('Error:', err.message);
});

handler.on('push', function(event_){
	debugger;
	console.log('Received a push event_ for %s to %s',
		event_.payload.repository.name,
		event_.payload.ref
	);
	github.update()
	.then(function(){
		debugger;
		common.update_container();
	});
	//TODO
});

handler.on('issues', function(event_){
	console.log('Received an issue event_ for %s action=%s: #%d %s',
		event_.payload.repository.name,
		event_.payload.action,
		event_.payload.action,
		event_.payload.issue.number,
		event_.payload.issue.title
	);
});
