const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');
const envVarSchema = require('./envVarSchema.json');

const CONFIG_FILENAME = 'github_checks_reporter.json';

function getPathToRoot(currentDir = process.cwd()) {
  const pathToPackage = `${currentDir}/${CONFIG_FILENAME}`;
  if (existsSync(pathToPackage) || currentDir === '/') {
    return currentDir;
  }
  return getPathToRoot(resolve(currentDir, '..'));
}

function getConfigFileContent() {
  const configFilePath = `${getPathToRoot()}/${CONFIG_FILENAME}`;
  return existsSync(configFilePath) ? JSON.parse(readFileSync(configFilePath)) : {};
}

function getAppId() {
  return getConfigFileContent().appId;
}

function getEnvVarNameMap() {
  const configFileContent = getConfigFileContent();
  const configEnvVarNames = configFileContent.envVars || {};

  // get default env var names from schema
  const defaultEnvVarNames = Object.keys(envVarSchema).reduce((collector, key) => {
    // eslint-disable-next-line no-param-reassign
    collector[key] = envVarSchema[key].default;
    return collector;
  }, {});

  return Object.assign({}, defaultEnvVarNames, configEnvVarNames);
}

function getEnvVars() {
  const envVarNameMap = getEnvVarNameMap();

  return Object.keys(envVarNameMap).reduce((collector, key) => {
    // eslint-disable-next-line no-param-reassign
    collector[key] = process.env[envVarNameMap[key]];
    return collector;
  }, {});
}

function getCommandLineArgs() {
  return {
    name: process.argv[2],
    cmd: process.argv[3],
    cmdArgs: process.argv.slice(4)
  };
}

function verifyInputs(inputs) {
  const errors = [];

  Object.keys(envVarSchema).forEach(key => {
    if (typeof inputs[key] === 'undefined') {
      errors.push(
        `Missing ${envVarSchema[key].doc} in environment variable '${getEnvVarNameMap()[key]}'`
      );
    }
  });

  if (typeof inputs.appId === 'undefined') {
    errors.push(`Missing GitHub application id in ${CONFIG_FILENAME} key 'appId'`);
  }

  if (!inputs.name || !inputs.cmd) {
    errors.push(
      'Please invoke with the following format: github-checks-reporter {name of task} {task command} {...task arguments}'
    );
  }

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

module.exports = function getInputs() {
  const inputs = {
    appId: getAppId(),
    ...getEnvVars(),
    ...getCommandLineArgs()
  };

  verifyInputs(inputs);

  return inputs;
};
