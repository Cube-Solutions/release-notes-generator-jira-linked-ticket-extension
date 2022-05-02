'use strict'
const JiraApi = require('jira-client');
const debug = require('debug')('semantic-release:release-notes-generator-jira-linked-ticket-extension');
const resolveConfig = require('./resolve-config');

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

module.exports = async function (commits, moduleConfig, pluginConfig, context) {
  const {
    jiraHost,
    jiraUsername,
    jiraPassword,
    issuePrefixTopics,
    issuePrefixMatches
  } = resolveConfig(moduleConfig, context)


  var _postmanRequest = _interopRequireDefault(require("postman-request"));

  const jira = new JiraApi({
    protocol: 'https',
    host: jiraHost,
    username: jiraUsername,
    password: jiraPassword,
    apiVersion: '2',
    strictSSL: true,
    request: (uri, options) => {
      // Added to raise errors on http status errors: 4xx and 5xx errors
      return new Promise((resolve, reject) => {
        (0, _postmanRequest.default)(uri, options, (err, httpResponse) => {
          if (err) {
            reject(err);
          } else if (httpResponse.statusCode >= 400) {
            reject(new Error('Invalid status code received: ' + httpResponse.statusCode));
          } else {
            // for compatibility with request-promise
            resolve(httpResponse.body);
          }
        });
      });
    }
  });

  async function getLinkedReferences({prefix, issue, action, owner, repository, raw}) {
    if (!issuePrefixTopics.includes(prefix)) {
      return []
    }
    let ticket = prefix + issue
    let issueMatch
    let response
    let linkedReferences = []

    try {
      response = await jira.findIssue(ticket, null, 'issuelinks')
    } catch (error) {
      debug('Error fetching linked ticket for %s: %s', ticket, error.message);
      return []
    }

    let linkedTickets = response.fields.issuelinks
      .map((link) => {
        let linkedIssue = link.outwardIssue || link.inwardIssue
        return linkedIssue.key
      })

    debug('Linked tickets for ticket %s: %s', ticket, linkedTickets.join(', '));

    const issuePrefixMatchesRegex = getIssuePrefixMatchesPartsRegex(issuePrefixMatches, false)

    for (let linkedTicket of linkedTickets) {
      while ((issueMatch = issuePrefixMatchesRegex.exec(linkedTicket))) {
        const reference = {
          action: action,
          owner: owner,
          repository: repository,
          issue: issueMatch[2],
          raw: raw,
          prefix: issueMatch[1]
        }

        linkedReferences.push(reference)
      }
    }

    return linkedReferences
  }

  for (let commit of commits) {
    for (let reference of commit.references) {
      let linkedReferences = await getLinkedReferences(reference)
      commit.references = commit.references.concat(linkedReferences)
    }
  }

  return commits;
}

function getIssuePrefixMatchesPartsRegex(issuePrefixes, issuePrefixesCaseSensitive) {
  const flags = issuePrefixesCaseSensitive ? 'g' : 'gi'
  return new RegExp('(' + issuePrefixes.join('|') + ')' + '([0-9]+)', flags)
}