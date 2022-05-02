module.exports = (
  {jiraHost, jiraUsername, jiraPassword, issuePrefixTopics, issuePrefixMatches},
  {
    env: {
      JIRA_HOST,
      JIRA_USERNAME,
      JIRA_PASSWORD,
    },
  }
) => {
  return {
    jiraHost: jiraHost || JIRA_HOST,
    jiraUsername: jiraUsername || JIRA_USERNAME,
    jiraPassword: jiraPassword || JIRA_PASSWORD,
    issuePrefixTopics: issuePrefixTopics || [],
    issuePrefixMatches: issuePrefixMatches || [],
  };
};