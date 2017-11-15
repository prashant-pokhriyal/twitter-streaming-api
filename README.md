# Pothi Twitter Streaming API Task

![Pothi Programming Task](https://assets.pothi.com/img/logo.png)

Using the [Twitter Streaming API](https://developer.twitter.com/en/docs/tweets/filter-realtime/overview) to track a given keyword and generate various reports about the tweets.

## Documentation

**Yet to be drafted**

## Prerequisites
- [nodejs](https://nodejs.org/en/download/)
- [yarn](https://yarnpkg.com/lang/en/docs/install/)

You need valid Twitter developer credentials in the form of a set of consumer and access tokens/keys. You can get these [here](https://apps.twitter.com/).
  ```
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
```
You can store those credentials in file name [cred.json](https://github.com/prashant-pokhriyal/twitter-streaming-api/blob/master/cred.json) or while executing program it will ask you for those credentials.
## Installing
Open terminal, and run following command to clone repository.
```
git clone git@github.com:prashant-pokhriyal/twitter-streaming-api.git
cd twitter-streaming-api/
```
If you are running it in a dabian based system like ubuntu, then you can execute following command which will take care of installing latest version of nodejs and yarn package manager.
```
sudo ./install.sh
```
Otherwise you can download [nodejs](https://nodejs.org/en/download/) and [yarn package manager](https://yarnpkg.com/lang/en/docs/install/) in your system. And after installing run following command to install the dependencies required for running program.
```
yarn install
```
To execute the program, run following command.
```
node index.js
```
After running program it will ask your twitter developer credentials if you haven't stored it in [cred.json](https://github.com/prashant-pokhriyal/twitter-streaming-api/blob/master/cred.json).

After authenticating it will give you success message and then ask for the keyword that you want to search.

For every minute it will generate following three reports
* Users Report
* Links Report
* Content Report

## Built With

* [nodejs](https://nodejs.org)


## Author

* **Prashant Pokhriyal**
