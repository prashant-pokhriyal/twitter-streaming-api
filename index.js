var chalk       = require('chalk'),
    clear       = require('clear'),
    CLI         = require('clui'),
    figlet      = require('figlet'),
    inquirer    = require('inquirer'),
    Preferences = require('preferences'),
    Twitter     = require('twitter');

var Spinner = CLI.Spinner;

var prefs = new Preferences('pothi');

clear();
console.log(chalk.blue(figlet.textSync('Pothi Task', {horizontalLayout : 'full'})));

twitterAuth(function(error, client) {
  if (error) {
    console.log(chalk.red(error[0].message));
  }
  if (client) {
    console.log(chalk.green('Successfully authenticated!'));
    setTimeout(, 1000 * 60, 'funky');
  }
});


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


function getTwitterAccess(callback) {
  if (prefs.twitter) {
    return callback(prefs.twitter);
  }
  getTwitterCred(callback);
}


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

function search(client,keyword) {
  client.get('search/tweets', {q: keyword, until: }, function(error, tweets, response) {
    console.log(tweets);
  });
}
