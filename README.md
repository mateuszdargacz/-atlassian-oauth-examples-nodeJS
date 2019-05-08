# Nodejs example of Jira OAUTH
Here a tutorial for getting the  required oauth keys and generating the Private key: 
https://developer.atlassian.com/server/jira/platform/oauth/#step-1-configure-jira

## It's update of official repository:
https://bitbucket.org/atlassianlabs/atlassian-oauth-examples/src/dd0264cad0432ed514d2701367c5bfc2b2a18401/nodejs/?at=master



This example simulates a nodejs client retrieving a JIRA issue via Oauth.  You connect your browser to the node server (running on port 8080 by default).
Go to /session/connect, you will be redirected to JDOG where you do the OAuth dance, JDOG redirects you to /session/callback where the REST representation
of JRADEV-8110 is then retrieved from JDOG (using the new freshly minted OAuth access token).

## Pre-requisites
* Connectivity to JDOG (pretty eash to change to another JIRA instance though)
* An issue with key JRADEV-8110
* An OAuth consumer with 'oauth-sample-consumer' as it's key and the public key from rsa.pub
* Nodejs
** oauth module from my fork (https://github.com/sladey/node-oauth)
** express module (http://expressjs.com/)


## Running the test
* Create a config.js file on your home directory, that looks like this:

	var config = {}
	config.consumerKey = "oauth-sample-consumer";
	config.consumerPrivateKeyFile = "atlassian-oauth-examples/rsa.pem"
	module.exports = config;

* Start the node server 
	node app.js
* Point your browser at '/session/connect'
* You should be redirected to JDOG, do the oauth dance then back to the node server and you should see details on JRADEV-8110.