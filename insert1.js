var AWS = require("aws-sdk");
//var awsConfig = require("aws-config");

// awsConfig({
//   region: 'us-west-2',                  // explicitly set AWS region 
//   sslEnabled: true,                    // override whether SSL is enabled 
//   maxRetries: 3,                       // override the number of retries for a request 
//   accessKeyId: 'AKIAIYGGV5YVEKAFYQQA',  // can omit access key and secret key 
//   secretAccessKey: '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',   // if relying on a profile or IAM 
//   profile: 'default',             // name of profile from ~/.aws/credentials 
//   timeout: 15000                       // optional timeout in ms. Will use AWS_TIMEOUT 
// });

AWS.config.update({
  region: "us-west-2",
  accessKeyId: '',  // can omit access key and secret key 
  secretAccessKey: ''
 // endpoint: "arn:aws:dynamodb:us-west-2:823146787824:table/Users"
});
//AWS.config = awsConfig();
//var dynamo = new AWS.DynamoDB(awsConfig({timeout: 5000}));


var docClient = new AWS.DynamoDB.DocumentClient();

var table = "Clipboard";

var email = "gaurav@gmail.com";
var text = "gaurav1";
var favflag = 0;
var date = +new Date;
var email_timestamp = email + date; 
var params = {
    TableName:table,
    Item:{
        "email_timestamp": email_timestamp,
        "email": email,
        "text": text,
        "fav_flag": favflag
    }
};

console.log("Adding a new item...");
docClient.put(params, function(err, data) {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
    }
});