"use strict";
var mq_client = require('../rpc/client');
var copypasteController = require('./copyPasteCtrl');
var sqs_sns_consume = require('../consume');
var mac = require('getmac');
var config = {};

// SNS-SQS
var sqs_sns_inititate = require('../create');


var queueUrl = '';


var cron = require('cron');
var cronJob = cron.job("*/10 * * * * *",subscribe);

function subscribe()
{
	sqs_sns_consume.getMessages(queueUrl);
}


//-----function to create JSON for alarm data -------------//
var loggedIn = false;
var emailLoggedIn="";

exports.getEmail = function(){
	return emailLoggedIn;
}
exports.doLogin = function(req, res){
  var loginSucess = false;
  console.log("In doLogin");
  var email = req.param("email");
  var password = req.param("password");
  var loginJSON = {"email" : email};

  mq_client.make_request('LOGIN_QUEUE', loginJSON, function (err, results) {
        if(err)
		{
			throw err;
		}
		else
		{

			if(results.userDetails.Item.password == password){
				console.log("login results");
				req.clipBoardSession.email = results.userDetails.Item.email;
				copypasteController.email = req.clipBoardSession.email;
				loggedIn = true;
				//this.emailLoggedIn = req.clipBoardSession.email;
				req.clipBoardSession.fname = results.userDetails.Item.first_name;
				req.clipBoardSession.lname = results.userDetails.Item.last_name;
				mac.getMac(function(err,macAddress){
   					if (err)  throw err
    				console.log(macAddress)
					var macJSON = {
						"email_mac" : email + macAddress,
						"email" : email,
						"mac" : macAddress
					};
				mq_client.make_request('MAC_QUEUE', macJSON, function (err, results) {
					if(err){
						throw err;
					}
					else{
						console.log("***");
						//console.log(results);
						cronJob.stop();
						queueUrl = results.userDetails.Item.queue_url;
						cronJob.start();

						var json_responses = {"passwordMatched" : true,"results":results.userDetails.Item};
						res.send(json_responses);
					}

				});
			});

			}else{
				console.log("Invalid password");
				var json_responses = {"passwordMatched" : false};
				res.send(json_responses);
			}

		}
    });
}

exports.getLoggedInFlag = function(){
	return loggedIn;
}



exports.doLogout = function(req,res){
	console.log("in logout");
  	req.clipBoardSession.destroy();
  	req.clipBoardSession.reset();
  	console.log(req.clipBoardSession.email);
  	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  	res.status(200).send();
}

exports.doSignup = function(req, res){
	var email = req.param("email");
	var pwd = req.param("password");
	var fname = req.param("firstname");
	var lname = req.param("lastname");

	var signupJSON = {
		"email": email,
        "first_name": fname,
        "last_name": lname,
        "password": pwd,
        "fav_flag" : 0
	};
	console.log(signupJSON);
	mq_client.make_request('SIGNUP_QUEUE', signupJSON, function (err, results) {
        if(err)
		{
			throw err;
		}
		else
		{
			console.log("signup results");
			mac.getMac(function(err,macAddress){
   					if (err)  throw err
    				console.log(macAddress)
					var macJSON = {
						"email_mac" : email + macAddress,
						"email" : email,
						"mac" : macAddress
					};
					mq_client.make_request('MAC_QUEUE', macJSON, function (err, results) {
					if(err){
						throw err;
					}
					else{
						console.log(results);
						//req.clipBoardSession.email = email;
						//copypasteController.email = req.clipBoardSession.email;
						//loggedIn = true;
						//req.clipBoardSession.fname = fname;
						//req.clipBoardSession.lname = lname;
						res.send();
					}

				});
			});

		}
    });


	var queueName = email.replace('@','').replace('.','');

	// SNS - SQS Code
	sqs_sns_inititate.createTopic(queueName, function (err, results) {
        if(err)
		{
			throw err;
		}
		else
		{
			config.TopicArn = results;
			console.log("Topic created");
			sqs_sns_inititate.createQueue(queueName, function (err, results) {
		        if(err)
				{
					throw err;
				}
				else
				{
					config.QueueUrl = results;
					console.log("URL:"+results);
					console.log("Queue created");
					sqs_sns_inititate.getQueueAttr(config.QueueUrl, function (err, results) {
				        if(err)
						{
							throw err;
						}
						else
						{
							config.QueueArn = results;
							console.log("Fetched queue attributes");
							sqs_sns_inititate.snsSubscribe(config.TopicArn, config.QueueArn, function (err, results) {
						        if(err)
								{
									throw err;
								}
								else
								{
									console.log("Successfully subscribed");

								}
						    });


						    sqs_sns_inititate.setQueueAttr(config.QueueUrl, config.TopicArn, config.QueueArn, function (err, results) {
						        if(err)
								{
									throw err;
								}
								else
								{
									console.log("Queue attributes set successfully");
									sqs_sns_inititate.writeConfigFile(config, function (err, results) {
								        if(err)
										{
											throw err;
										}
								    });

								}
						    });
						}
				    });
				}
		    });
		}
    });





}
