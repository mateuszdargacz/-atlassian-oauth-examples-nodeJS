const config = {
  // following can be obtained as per tutorial: https://developer.atlassian.com/server/jira/platform/oauth/#step-1-configure-jira
  consumerKey: "OauthKey",
  consumerPrivateKeyFile: "./jira_privatekey.pem",
  jiraUrl: "https://XXX.atlassian.net" // your Jira url
};

module.exports = config;