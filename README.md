This is an extension for the release notes generator fork.

This will receive the parsed commits and search for linked JIRA tickets.

Installation
---

Make sure this extension is installed:

```bash
npm install Cube-Solutions/release-notes-generator-jira-linked-ticket-extension
```

Configuration:
---

```javascript
[
  'Cube-Solutions/release-notes-generator',
  {
    preset: 'conventionalcommits',
    extensions: [
      {
        name: 'release-notes-generator-jira-linked-ticket-extension',
        config: {
          issuePrefixTopics: [
            'JIRA-',
          ],
          issuePrefixMatches: [
            'JIRASD-'
          ]
        }
      }
    ],
    presetConfig: {
      types: [
        // ...
      ],
      issuePrefixes: [
        'JIRA',
        'JIRASD'
      ],
      commitUrlFormat: '{{host}}/{{owner}}/{{repository}}/commit/{{hash}}',
      compareUrlFormat: '{{host}}/{{owner}}/{{repository}}/-/compare/{{previousTag}}...{{currentTag}}',
      issueUrlFormat: 'https://jira.host.be/browse/{{prefix}}{{id}}'
    }
  }
],
```