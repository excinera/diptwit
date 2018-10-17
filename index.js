// diptwit 0.1 
// x. 2k18 10 01
// sorry
// gpl v2.0

var fs = require('fs'); 
var Twitter = require('twitter');
var Parser = require('rss-parser');
var now = require('moment');

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
var guids = JSON.parse(fs.readFileSync(__dirname + "/guids.log"));
v && console.log("Connecting");
client.get('statuses/user_timeline', '{screen name: ' + twitName + '}', function(error, tweets, response) {
  if (!error) {
   //console.log(tweets);
   v && console.log("No error");
   (async () => {
    let feed = await parser.parseURL(rssUrl);
    var smeti = feed.items.reverse();
    console.log(guids);
    var i = 0;
    smeti.forEach(item => {
     v && console.log(item.isoDate + ", " + item.guid + ": " + item.title + "(" + guids.indexOf(item.guid) + ")");
     if(guids.indexOf(item.guid) == -1) {
      for(var j = -1; j < 1000*1000*2000*i; j++) {}
      guids.push(item.guid);
      v && console.log(item.guid);
      v && console.log(now().format('MM/DD/YYYY @ HH:mm:ss') + " | Posting.");
      client.post('statuses/update', {status: '"' + item.title + '", by ' + item.creator + ": "+ item.link})
      .then(function (tweet) {
       console.log(now().format('MM/DD/YYYY @ HH:mm:ss') + " | " + tweet.text);
      }) // closes tweet
      .catch(function (error) {
       throw error;
      }) // closes error catch */
     i++;
     } // closes "if untweeted GUID"
     fs.writeFileSync(__dirname + "/guids.log", JSON.stringify(guids));
    }); // closes forEach in feed
   })(); // closes async
   for (var n in tweets){
    //console.log('a');
    //console.log(tweets[n]['user']['screen_name'] + ": " + tweets[n]['text']);
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