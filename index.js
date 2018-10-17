// diptwit 0.1 
// x. 2k18 10 01
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
const config = JSON.parse(fs.readFileSync(__dirname + "/config.json"));
var rssUrl = config.rss_url;
var twitName = config.twit_name;
const clientAuth = JSON.parse(fs.readFileSync(__dirname + "/clientAuth.json"));
var client = new Twitter(clientAuth);
var guids = JSON.parse(fs.readFileSync(__dirname + "/guids.log"));

// Log and console output to describe program modes
s && console.log("Running in single-post mode.");
s && appendFileSync(__dirname + "/run.log", " [in 1-post mode] from: " + rssUrl + "\n");
!s && appendFileSync(__dirname + "/run.log", " [in n-post mode] from: " + rssUrl + "\n");
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
    for(var k = 0; k < smeti.length; k++){
     item = smeti[k];
     v && console.log(item.isoDate + ", " + item.guid + ": " + item.title + "(" + guids.indexOf(item.guid) + ")");
     if(guids.indexOf(item.guid) == -1) {
      // for(var j = -1; j < 1000*1000*2000*i; j++) {}
      k = smeti.length;
      guids.push(item.guid);
      v && console.log(item.guid);
      v && console.log(now().format("[YYYY-MM-DD") + "T" + now().format("HH:mm:ss]") + " POSTING.");
      client.post('statuses/update', {status: '"' + item.title + '", by ' + item.creator + ": "+ item.link})
      .then(function (tweet) {
        console.log(now().format("[YYYY-MM-DD") + "T" + now().format("HH:mm:ss]") + " " + tweet.text);
        fs.appendFileSync(__dirname + "/run.log", now().format("[YYYY-MM-DD") + "T" + now().format("HH:mm:ss]") + " SENT " + tweet.text + "\n");
      }) // closes tweet
      .catch(function (error) {
       throw error;
      }) // closes error catch */
     // i++;
     } // closes "if untweeted GUID"
     fs.writeFileSync(__dirname + "/guids.log", JSON.stringify(guids));
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