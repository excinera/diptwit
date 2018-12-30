// diptwit 1.0
// x. 2k18 10 01 - 2k18 10 17
// sorry
// gpl v2.0

var fs = require('fs'); 
var Twitter = require('twitter');
var Parser = require('rss-parser');
var now = require('moment');

fs.appendFileSync(__dirname + "/run.log", "\n" + now().format("[YYYY-MM-DD") + "T" + now().format("HH:mm:ss]") + " STARTED");

// Check for verbose and debug flags, set variables
var v = (process.argv.indexOf('v') + process.argv.indexOf('-v') + 2);
var d = (process.argv.indexOf('d') + process.argv.indexOf('-d') + 2);
var s = (process.argv.indexOf('s') + process.argv.indexOf('-s') + 2);
v = v ? 1 : 0;
d = d ? 1 : 0;  
s = s ? 1 : 0;  

var parser = new Parser();

// Read RSS url, auth tokens from JSON file, other miscellaneous logs and config files

var config;
var clientAuth;
var guids;

// Try to load config. If none, create am empty file.
try {
  config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
  console.log("Config file loaded.");
  }
 catch (e) {
  console.log("No config file found. Creating empty file.");
  config = {
   "rss_url": "http://example.com/rss",
   "twit_name": "null",
   "timeout": 10000
   }
  fs.appendFileSync(__dirname + '/config.json', JSON.stringify(config, null, ' '));
  }

// Try to load client auth. If none, create an empty file.
try {
  clientAuth = JSON.parse(fs.readFileSync(__dirname + "/clientAuth.json"));
  console.log("Authentication file loaded.");
  }
 catch (e) {
  console.log("No client authentication file found. Creating empty file.");
  clientAuth = {
   "consumer_key": "0000000000000000000000000",
   "consumer_secret": "00000000000000000000000000000000000000000000000000",
   "access_token_key": "00000000000000000000000000000000000000000000000000",
   "access_token_secret": "000000000000000000000000000000000000000000000"
   }
  fs.appendFileSync(__dirname + '/clientAuth.json', JSON.stringify(clientAuth, null, ' '));
  }  

// Try to load GUIDs. If none, create an empty file.
try {
  guids = JSON.parse(fs.readFileSync(__dirname + "/guids.log"));
  console.log("GUID log loaded.");
  }
 catch (e) {
  console.log("No GUID records found. Creating empty file.");
  guids = [];
  fs.appendFileSync(__dirname + '/guids.log', JSON.stringify(guids, null, ' '));
  }   

var rssUrl = config.rss_url;
var twitName = config.twit_name;
var timeout = config.timeout;
var client = new Twitter(clientAuth);

// No, Mr. Node.js, I expect you to die.
setTimeout(function() {
 console.log("Timeout reached. Ending process.");
 process.abort()
 }, timeout);

// Log and console output to describe program modes
s && console.log("Running in single-post mode.");
s && fs.appendFileSync(__dirname + "/run.log", " [in 1-post mode] from: " + rssUrl + " with timeout " + timeout + "\n");
!s && fs.appendFileSync(__dirname + "/run.log", " [in n-post mode] from: " + rssUrl + " with timeout " + timeout + "\n");
(d || v) && console.log("Starting with " + (d ? "debug " : "") + ((d * v) ? "and " : "") + (v ? "verbose " : "") + "mode enabled");

// Actually getting the tweet.
client.get('statuses/user_timeline', '{screen name: ' + twitName + '}', function(error, tweets, response) {
  if (!error) {
   //console.log(tweets);
   v && console.log("No error");
   (async () => {
    let feed = await parser.parseURL(rssUrl);
    var smeti = feed.items.reverse();
    v && console.log(guids);
    // var i = 0;
    for(var k in smeti){
     item = smeti[k];
     v && console.log(item.isoDate + ", " + item.guid + ": " + item.title + "(" + guids.indexOf(item.guid) + ")");
     if(guids.indexOf(item.guid) == -1) {
      // for(var j = -1; j < 1000*1000*2000*i; j++) {}
      k = smeti.length;
      guids.push(item.guid);
      v && console.log(item.guid);
      v && console.log(now().format("[YYYY-MM-DD") + "T" + now().format("HH:mm:ss]") + " POSTING.");
      var count = 0;
      count += countInstances(item.content, " ");
      v && console.log(count + "words");
      function countInstances(string, word) {
       return string.split(word).length - 1;
       }
      count = Math.floor(count / 300.0);
      if (count === 0) count++;
      console.log(count);
      client.post('statuses/update', {status: '"' + item.title + '", by ' + item.creator + " (" + count + "m read) "+ item.link})
      .then(function (tweet) {
       console.log(now().format("[YYYY-MM-DD") + "T" + now().format("HH:mm:ss]") + " " + tweet.text);
       fs.appendFileSync(__dirname + "/run.log", now().format("[YYYY-MM-DD") + "T" + now().format("HH:mm:ss]") + " SENT " + tweet.text + "\n");
       fs.writeFileSync(__dirname + "/guids.log", JSON.stringify(guids));
       s && process.abort();
       }) // closes tweet
      .catch(function (error) {
       throw error;
       fs.writeFileSync(__dirname + "/guids.log", JSON.stringify(guids));
       s && process.abort();
       }) // closes error catch 
     // i++;
     } // closes "if untweeted GUID"
    } // closes increment loop over smeti
   })(); // closes async
   for (var n in tweets){
    //console.log('a');
    //console.log(tweets[n]['user']['screen_name'] + ": " + tweets[n]['text']);
   }
  } // closes if (!error)
}); // closes client.get


console.log("RSS url: " + rssUrl);

/*
client.post('statuses/update', {status: 'test'},  function(error, tweet, response) {
  if(error) throw error;
  console.log(tweet);  // Tweet body.
  console.log(response);  // Raw response object.
}); // closes client.post */