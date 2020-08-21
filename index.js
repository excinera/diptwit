const versionid = "1.2.1";

// x. 2k18 10 01 - 2k18 10 17
// 2k18 12 30: fixed the post modes
// 2k19 02 03: multi-url fetching
// 2k19 02 06: fix multi-url fetching
// gpl v3.0

var fs = require('fs');
var path = require('path');
var Twitter = require('twitter');
var Parser = require('rss-parser');
var now = require('moment');

fs.appendFileSync(__dirname + "/run.log", "\n" + now().format("[YYYY-MM-DD") + "T" + now().format("HH:mm:ss]") + " STARTED");

// Set variables from process arguments.
var v = (process.argv.indexOf('v') + process.argv.indexOf('-v') + 2);
// If either version of the flag has been included as an argument, this will return an arbitrary positive integer. Otherwise, it will return zero.

var d = (process.argv.indexOf('d') + process.argv.indexOf('-d') + 2);
var t = (process.argv.indexOf('t') + process.argv.indexOf('-t') + 2);
var r = (process.argv.indexOf('r') + process.argv.indexOf('-r') + 2);
var s = (process.argv.indexOf('s') + process.argv.indexOf('-s') + 2);
var h = (process.argv.indexOf('h') + process.argv.indexOf('-h') + 2);
var w = (process.argv.indexOf('w') + process.argv.indexOf('-w') + 2);

v = v ? 1 : 0;
// If "v" is anything besides 0, this line sets it to 1.
d = d ? 1 : 0;  
r = r ? 1 : 0; 
s = s ? 1 : 0;  
h = h ? 1 : 0;  
t = t ? 1 : 0;  
w = w ? 1 : 0;  

if (h) {
 console.log(versionid + " / x. cinera 2k19 / GPL v3");
 console.log("Usage: node " + path.basename(__filename) + " [-d / -t]   [-h] [-s] [-v]")
 console.log("  -d, discord     | Post to Discord channel.")
 console.log("  -t, twitter     | Post to Twitter feed.")
 console.log(" "),
 console.log("  -h, help        | Display help menu and exit")
 console.log("  -r, restrict    | Post a maximum of one Tweet per feed.")
 console.log("  -s, single      | Post a maximum of one Tweet in total.")
 console.log("  -v, verbose     | Run with verbose logging enabled.")
 console.log("  -w, way verbose | Debug mode; log *everything*.")
 process.exit(0);
 } // If help flag is set, print command flags and exit.

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
   "rss_urls": ["http://example.com/rss", "http://example.com/rss2"],
   "twit_name": "null",
   "timeout": 10000
   }
  fs.appendFileSync(__dirname + '/config.json', JSON.stringify(config, null, ' '));
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

var rssUrls = config.rss_urls;
var twitName = config.twit_name;
var timeout = config.timeout;
var client = new Twitter(clientAuth);
var feed = [];
var smeti = [];

// No, Mr. Node.js, I expect you to die.
setTimeout(function() {
 (d || v) && console.log("Timeout reached. Ending process.");
 process.exit(0);
 }, timeout);






 // This is the whole Twitter-posting escapade.

if (t) {

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
 
 // Log and console output to describe program modes
 s && console.log("Running in single-post mode over " + rssUrls.length + " RSS URLs.");
 !s && console.log("Running in multi-post mode over " + rssUrls.length + " RSS URLs.");
 (w || v) && console.log("Starting with " + (w ? "debug " : "") + ((w * v) ? "and " : "") + (v ? "verbose " : "") + "mode enabled");
 var skipAllRest = 0;
 var skipTheRest = []; 

  // Actually getting the tweets.
  client.get('statuses/user_timeline', '{screen name: ' + twitName + '}', function(error, tweets, response) {
   if (!error) {
    w && console.log("Fetched timeline for " + twitName + "!");
    for (var asdf in rssUrls) {
     w && console.log(asdf + " RQ RSS " + rssUrls[asdf]);
     s && fs.appendFileSync(__dirname + "/run.log", " [in 1-post mode] from: " + rssUrls[asdf] + " with timeout " + timeout + "\n");
     !s && fs.appendFileSync(__dirname + "/run.log", " [in n-post mode] from: " + rssUrls[asdf] + " with timeout " + timeout + "\n");
     parser.parseURL(rssUrls[asdf])
     .then(function (items) {
      skipTheRest[items.feedUrl] = 0;
      (w || v) && console.log(items.feedUrl.length + " RX RSS " + rssUrls[asdf]);
      smeti[asdf] = items['items'].reverse();
      // d && console.log(guids);
      // var i = 0;
      for(var k in smeti[asdf]){
       item = smeti[asdf][k];
       w && console.log(items.feedUrl.length + " ITEM : " + item.isoDate + ", " + item.guid + ": " + item.title + " (" + guids.indexOf(item.guid) + ")");
       if(guids.indexOf(item.guid) == -1) {
        // for(var j = -1; j < 1000*1000*2000*i; j++) {}
        k = smeti[asdf].length;
        var count = 0;
        count += item.content.split(" ").length - 1;
        (w || v) && console.log(items.feedUrl.length + " NEW  : " + now().format("YYYY-MM-DD") + "T" + now().format("HH:mm:ss") + " GUID " + item.guid + " skip: " + skipAllRest + "/" + skipTheRest[items.feedUrl] + " ( " + count + " words)");
        count = Math.floor(count / 300.0);
        if (count === 0) count++;
        if (skipAllRest === 0 && skipTheRest[items.feedUrl] === 0) {
         s && skipAllRest++;
         r && skipTheRest[items.feedUrl]++;
         guids.push(item.guid);
         console.log("tweetan from " + items.feedUrl);
         client.post('statuses/update', {status: '"' + item.title + '", by ' + item.creator + " (" + count + "m read) "+ item.link})
         .then(function (tweet) {
          (w || v) && console.log(items.feedUrl.length + " TWEET: " + now().format("[YYYY-MM-DD") + "T" + now().format("HH:mm:ss]") + " " + tweet.text);
          fs.appendFileSync(__dirname + "/run.log", now().format("[YYYY-MM-DD") + "T" + now().format("HH:mm:ss]") + " SENT " + tweet.text + "\n");
          fs.writeFileSync(__dirname + "/guids.log", JSON.stringify(guids));
          }) // closes tweet
         .catch(function (error) {
          throw error;
          fs.writeFileSync(__dirname + "/guids.log", JSON.stringify(guids));
          }) // closes error catch
         }  // if the "skip 'em all" flag isn't planted.
         else if (skipAllRest > 0) {
         (w || v) && console.log("Terminating program.");
         setTimeout(function() {process.exit(0);}, 5000);
         }  // if skipAllRest is set
       }   // closes "if untweeted GUID"
      }   // closes increment loop over smeti
     }); // closes then-block for handling rss feed items
    }   // closes iterator over all urls
   }   // closes if (!error)
  }); // closes client.get
 }   // CLOSES TWITTER POSTING BLOCK

