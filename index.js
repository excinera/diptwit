// diptwit 0.1 
// x. 2k18 10 01
// sorry
// gpl v2.0

var fs = require('fs');	
var Twitter = require('twitter');
var Parser = require('rss-parser');

// Check for verbose and debug flags, set variables
var v = (process.argv.indexOf('v') + process.argv.indexOf('-v') + process.argv.indexOf('--verbose') + process.argv.indexOf('verbose') + 4);
var d = (process.argv.indexOf('d') + process.argv.indexOf('-d') + process.argv.indexOf('--debug') + process.argv.indexOf('debug') + 4);
v = v ? 1 : 0;
d = d ? 1 : 0;
(d || v) && console.log("Starting with " + (d ? "debug " : "") + ((d * v) ? "and " : "") + (v ? "verbose " : "") + "mode enabled");

var parser = new Parser();

// Read RSS url, auth tokens from JSON file, establishes connection to Twitter
const config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
var rssUrl = config.rss_url;
var twitName = config.twit_name;
const clientAuth = JSON.parse(fs.readFileSync(__dirname + "/clientAuth.json"));
var client = new Twitter(clientAuth);
v && console.log("Connecting");
client.get('statuses/user_timeline', '{screen name: ' + twitName + '}', function(error, tweets, response) {
  if (!error) {
  	console.log(tweets);
  	v && console.log("No error");
   (async () => {
    let feed = await parser.parseURL(rssUrl);
    feed.items.forEach(item => {
     v && console.log('Here is an item');
     client.post('statuses/update', {status: '"' + item.title + '", by ' + item.creator + ": "+ item.link})
      .then(function (tweet) {
       console.log(tweet.text);
      }) // closes tweet
      .catch(function (error) {
       throw error;
      }) // closes error catch */
    }); // closes forEach in feed
   })(); // closes async
   for (var n in tweets){
    console.log(tweets[n]['user']['screen_name'] + ": " + tweets[n]['text']);
   }
  } // closes if (!error)
}); // closes client.get


console.log(rssUrl);


/*
client.post('statuses/update', {status: 'I Love Twitter'},  function(error, tweet, response) {
  if(error) throw error;
  console.log(tweet);  // Tweet body.
  console.log(response);  // Raw response object.
}); // closes client.post */