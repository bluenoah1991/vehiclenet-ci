var util = require('util');
var fs = require('fs');
var path = require('path');
var Q = require('q');
var nodegit = require('nodegit');
//var nodegit = require('../../nodegit');
var common = require('./common');
var config = require('../config.json');

var hooks_url = util.format('/repos/%s/%s/hooks', 
	config.github.username, 
	config.github.repository
);
var webhook_config_path = path.join(process.cwd(), '.webhook_info.json');
var repository_path = path.join(process.cwd(), 'repos', config.github.repository);
var repository_uri = util.format('https://github.com/%s/%s.git',
	config.github.username,
	config.github.repository
);

exports.setup = function(){
	debugger;
	var deferred = Q.defer();
	common.get(hooks_url, function(trunk){
		debugger;
		var content = trunk.toString();
		console.log(content);
		var obj = JSON.parse(content);
		if(!!obj && obj.length > 0){
			for(var _ in obj){
				var item_ = obj[_];
				var config_ = item_['config'];
				if(!!config_){
					var url_ = config_['url'];
					if(url_ === config.local.url){
						deferred.resolve();
						return;
					}
				}
			}
		}
		common.post(
			hooks_url, {
				'name': 'web',
				'config': {
					'url': config.local.url,
					'secret': config.local.secret,
					'content_type': 'json'
				}
			}, function(trunk){
				debugger;
				var content = trunk.toString();
				fs.writeFile(webhook_config_path, content, function(err){
					if(err){
						deferred.reject(err);
						throw err;
					}
					deferred.resolve();
				});
				console.log(content);
			}
		);
	});
	return deferred.promise;
};

exports.remove = function(){
	var deferred = Q.defer();
	if(!fs.existsSync(webhook_config_path)){
		deferred.resolve();
		return deferred.promise;
	}
	var webhook_info = require(webhook_config_path);
	if(!!webhook_info){
		var id_ = webhook_info['id'];
		if(!!id_){
			common.delete(
				path.join(hooks_url, id_.toString()),
				function(){
					console.log('Removing \'.webhook_info.json\' file');
					fs.unlinkSync(webhook_config_path);
					deferred.resolve();
				});
		}
	}
	return deferred.promise;
};

exports.update = function(){
	debugger;
	var deferred = Q.defer();
	var update_repository = function(){
		debugger;
		var repos = null;
		var remote_branch_name = util.format('origin/%s', config.github.branchName);
		nodegit.Repository.open(repository_path)
			.then(function(repository){
				debugger;
				repos = repository;
				return repository.fetchAll();
			})
			.then(function(){
				debugger;
				return repos.getBranch(config.github.branchName)
					.then(function(ref){
						debugger;
					})
					.catch(function(err){
						debugger;
						return repos.getBranchCommit(remote_branch_name)
							.then(function(commit){
								debugger;
								return repos.createBranch(
									config.github.branchName,
									commit,
									0,
									repos.defaultSignature(),
									'');
							});
					})
					.then(function(){
						debugger;
						return repos.mergeBranches(
							config.github.branchName,
							remote_branch_name
						);
					})
					.then(function(){
						debugger;
						repos.checkoutBranch(config.github.branchName)
							.then(function(){
								debugger;
								deferred.resolve();
							})
							.catch(function(){
								debugger;
								deferred.reject();
							});
					})
					.catch(function(){
						debugger;
						deferred.reject();
					});
			});
	};
	if(!fs.existsSync(path.join(repository_path, '.git'))){
		nodegit.Clone.clone(repository_uri, repository_path)
			.then(function(repository){
				debugger;
				update_repository();
			})
			.catch(function(err){
				debugger;
			});
	} else {
		update_repository();
	}
	return deferred.promise;
};



