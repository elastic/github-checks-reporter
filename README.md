# github-checks-reporter
Task wrapper that provides expressive CI feedback via GitHub checks 

## Usage

`yarn run github-checks-reporter ${task title} ${...command and command args}`

example

`yarn run github-checks-reporter jest node scripts/jest`

## Setup

`yarn add --dev github-xyz` (package name will be updated)

github-checks-reporter relies on a number of environment variables in order to 
call the GitHub API -

Value | Default environment variable
----- | ----------------------------
appKey | GITHUB_CHECKS_REPORTER_KEY
appId | GITHUB_CHECKS_REPORTER_ID
repoSlug | ghprbGhRepository
commitSha | ghprbActualCommit
buildUrl | BUILD_URL

Different environment variables can be used via the `github_checks_api.json` 
config file located in the project root.

Example -
```json
{
  "envVars": {
    "appKey": "KIBANA_CI_REPORTER_KEY"
  }
}
```

## How it works

github-checks-reporter takes a task title and a shell command and its arguments
and:

- Creates a check via the GitHub checks API
- Executes the command
- Stores and passes along log data and exit code
- Updates the check based on the exit code, appending log data to the check