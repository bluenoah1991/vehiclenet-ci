var util = require('util');
var fs = require('fs');
var path = require('path');
var https = require('https');
var querystring = require('querystring');
var child_process = require('child_process');
var config = require('../config.json');

var GITHUB_USERNAME = process.env.GITHUB_USERNAME;
var GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;

if(!GITHUB_USERNAME){
	throw new Error('GITHUB_USERNAME not found');
}
if(!GITHUB_PASSWORD){
	throw new Error('GITHUB_PASSWORD not found');
}

var auth_str = 'Basic ' + new Buffer(GITHUB_USERNAME + ':' + GITHUB_PASSWORD).toString('base64');

//path = /abc/cde/fgh
//callback = function(chunk[Buffer]){}
exports.get = function(path, callback){
	var headers = {
		'Authorization': auth_str,
	        'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
	};
	var options = {
		host: 'api.github.com',
		port: 443,
		headers: headers,
		method: 'GET',
		path: path
	};
	var req = https.request(options, function(res){
		var data = '';
		res.on('data', function(trunk){
			data += trunk;
		});
		res.on('end', function(){
			callback(data);
		});
		res.on('error', callback);
	});
	req.end();
};

exports.post = function(path, data, callback){
	var post_data = JSON.stringify(data);
	var headers = {
		'Authorization': auth_str,
		'Content-Type': 'application/json',
		'Content-Length': post_data.length,
	        'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
	};
	var options = {
		host: 'api.github.com',
		port: 443,
		headers: headers,
		method: 'POST',
		path: path
	};
	var req = https.request(options, function(res){
		var data = '';
		res.on('data', function(trunk){
			data += trunk;
		});
		res.on('end', function(){
			callback(data);
		});
		res.on('error', callback);
	});
	req.write(post_data);
	req.end();
};

exports.delete = function(path, callback){
	var headers = {
		'Authorization': auth_str,
	        'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36'
	};
	var options = {
		host: 'api.github.com',
		port: 443,
		headers: headers,
		method: 'DELETE',
		path: path
	};
	var req = https.request(options, callback);
	req.end();
};

exports.update_container = function(){
	var repository_path = path.join(process.cwd(), 'repos', config.github.repository);
	//var GITHUB_USERNAME = process.env.GITHUB_USERNAME;
	var enviroments = config.local.enviroments;
	var envs = [];
	var options = '';
	if(!!enviroments){
		for(var _ in enviroments){
			var value = process.env[enviroments[_]];
			if(!value){
				value = '';
			}
			envs.push(
				util.format('-e "%s=%s"', enviroments[_], value)
			);
		}
		options = envs.join(' ');
	}
	child = child_process.spawn('./Dockerfile.sh', [
			repository_path,
			config.local.imageName,
			config.local.containerName,
			config.local.hostPort,
			config.local.containerPort,
			options
		], {
		stdio: [
			0,
			fs.openSync('Dockerfile.out', 'w'),
			//0,
			fs.openSync('Dockerfile.err', 'w')
			//0
		]
	});
}
