/**
* @version 1.0.0
* @file  Tracking a given keyword and generate various reports about the tweets.
* @author Prashant Pokhriyal <pokhariyalp@gmail.com>
*
*/


var
    /*
      Terminal string styling
    */
    chalk = require('chalk'),

    /*
      Clears the terminal screen
    */
    clear = require('clear'),

    /*
      draws command line spinner
    */
    CLI = require('clui'),

    /*
      Creates ASCII Art from text
    */
    figlet = require('figlet'),

    /*
      interactive command line user interfaces
    */
    inquirer = require('inquirer'),

    /*
      encrypted user preferences.
    */
    Preferences = require('preferences'),

    /*
      An asynchronous client library for the Twitter REST and Streaming API's.
    */
    Twitter = require('twitter'),

    /*
      Parse, validate, manipulate, and display dates
    */
    moment = require('moment'),


    /*
      Pretty unicode tables for the CLI
    */
    Table = require('cli-table'),

    /*
      extract keywords from a tweet
    */
    keyword_extractor = require("keyword-extractor"),

    fs      = require('fs'),
    Spinner = CLI.Spinner,
    prefs   = new Preferences('pothi'),
    credFileName = 'cred.json',
    print   = console.log;

const util = require('util');

clear();
print(chalk.blue(figlet.textSync('Pothi Task', {horizontalLayout : 'full'})));

/*
  function to check authorization and if it's Successfull then it will ask for
  keyword and do search.
*/
twitterAuth(function(error, client) {
  if (error) {
    print(chalk.red(error[0].message));
  }
  if (client) {
    print(chalk.green('Successfully authenticated!'));
    askKeyword(function(answer) {
      var keyword = answer.keyword;
      searchKeyword(client,keyword);
    });
  }
});



function twitterAuth(callback) {
  getTwitterAccess(function(credentials) {
    var status = new Spinner('Authenticating...');
    status.start();
    var client = new Twitter(credentials);
    client.get('favorites/list', function(error, tweets, response) {
      status.stop();
      if(error) {
        return callback(error,null);
      }
      prefs.twitter = credentials;
      return callback(null,client);
    });
  });
}

/*
  function to check if credentials are already stored in the system. If not then
  it will ask from user, otherwise return the stored value.
*/
function getTwitterAccess(callback) {

  var cred = JSON.parse(fs.readFileSync(credFileName, 'utf8'));
  if((cred.consumer_key != undefined && cred.consumer_key != '') &&
     (cred.consumer_secret != undefined && cred.consumer_secret != '') &&
     (cred.access_token_key != undefined && cred.access_token_key != '') &&
     (cred.access_token_secret != undefined && cred.access_token_secret != '')) {
       return callback(cred);
     }

  var questions = [
    {
      name : 'response',
      type : 'input',
      message : 'Keys found! Do you want to override it?(yes/no): '
    }
  ];

  if (prefs.twitter) {
    inquirer.prompt(questions).then(function(answer) {
      if(answer.response === 'yes') {
        getTwitterCred(callback);
      }
      else {
        callback(prefs.twitter);
      }
    });
  }
  else {
    getTwitterCred(callback);
  }
}

/*
  function going to ask user various keys for validation and accessing Twitter
  api
*/
function getTwitterCred(callback) {

  var questions = [
    {
      name : 'consumer_key',
      type : 'input',
      message : 'Enter twitter consumer key: '
    },
    {
      name : 'consumer_secret',
      type : 'input',
      message : 'Enter twitter consumer secret: '
    },
    {
      name : 'access_token_key',
      type : 'input',
      message : 'Enter twitter access token key: '
    },
    {
      name : 'access_token_secret',
      type : 'input',
      message : 'Enter twitter access token secret: '
    }
  ];

  inquirer.prompt(questions).then(callback);
}


/*
  it will ask user keyword that he wants to search
*/
function askKeyword(callback) {
  var question = [
    {
      name : 'keyword',
      type : 'input',
      message : 'Enter keyword you want to search: '
    }
  ];

  return inquirer.prompt(question).then(callback);
}


/*
  it will search given keyword for 5 minutes and shows the result every 1 minutes
*/
function searchKeyword(client,keyword) {

  var users_twitted = {}, links = {}, total_links = 0, unique_words = 0,
  start_time = moment(), minutes_counter = 1, words = {},
  countdown = new Spinner('Result will display in 60 seconds...');

  countdown.start();

  client.stream('statuses/filter', {track: keyword},  function(stream) {
    stream.on('data', function(tweet) {
      // print(util.inspect(tweet, false, null));
      var now = moment(),
      timer = 60 * minutes_counter - now.diff(start_time,"seconds");
      countdown.message('Results will display in ' + timer + ' seconds...');
      var minutes_ago = now.diff(start_time,"minutes");

      if(minutes_ago > 5) {
        countdown.stop();
        process.exit();
      }

      if(tweet.lang != 'en')
        return;

      if(minutes_ago == minutes_counter) {
        countdown.stop();
        var userTable = new Table({
          head : ['User', 'Counts', 'Total Tweets'],
          // colWidths : [40]
        }),

        linkTable = new Table({
          head : ['Links', 'Count']
        }),

        wordTable = new Table({
          head : ['Words', 'Count']
        });

        for(var user in users_twitted) {
          if(!users_twitted.hasOwnProperty(user))
            continue;
          userTable.push([user, users_twitted[user].count, users_twitted[user].statuses]);
        }

        for(var link in links) {
          if(!users_twitted.hasOwnProperty(user)) continue;
          linkTable.push([link, links[link].count]);
        }

        var keysSorted = Object.keys(words).sort(function(a,b){return words[b] - words[a]});

        for(var i = 0 ; i < 10; i++) {
          wordTable.push([keysSorted[i], words[keysSorted[i]]]);
        }

        print("**************************************************************");
        print("             Report After "+ minutes_counter + " minute");
        print("**************************************************************");
        print();
        display('Users', userTable);
        display('Links', linkTable, 'links:' + total_links);
        display('Content', wordTable, 'unique words:' + unique_words);
        countdown.start();
        ++minutes_counter;
      }

      if(users_twitted[tweet.user.name] === undefined) {
        users_twitted[tweet.user.name] = {
          count : 0,
          statuses : tweet.user.statuses_count
        };
      }

      ++users_twitted[tweet.user.name].count;

      for(var i = 0 ; i < tweet.entities.urls.length; i++) {
        if(links[tweet.entities.urls[i].expanded_url] === undefined) {
          links[tweet.entities.urls[i].expanded_url] = {
            count : 0,
          };
        }
        ++links[tweet.entities.urls[i].expanded_url].count;
      }
      total_links += tweet.entities.urls.length;

      // stopword.removeStopwords(tweet.text.split(' '))
      // wordpos.parse(tweet.text)
      keyword_extractor.extract(tweet.text,{
        language:"english",
        remove_digits: true,
        return_changed_case:true,
        remove_duplicates: false
      })
      .forEach(function(word) {
        if(words[word] === undefined) {
          ++unique_words;
          words[word] = 0;
        }
        ++words[word];
      });
    });

  });
}

/*
  function to display report
*/
function display(heading, table, count) {
  print("==============================================================");
  print("                      " + heading + " Report");
  print("==============================================================");
  count ? print("Total number of " + count) : false;
  print(table.toString());
  print();
}
