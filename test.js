var github = require('./lib/github');
var common = require('./lib/common');

console.log('Begin test');

//github.setup()
//	.then(github.remove)
//	.then(function(res){
//		console.log('test is completed');
//	});

github.update()
	.then(function(res){
		console.log('test is completed');
	});

//common.update_container();
