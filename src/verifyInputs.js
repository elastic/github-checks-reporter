const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');
const convict = require('convict');

const CONFIG_FILENAME = '/github_checks_reporter.json';
const ENV_VAR_SCHEMA_JSON = __dirname + '/envVarSchema.json';

function getPathToRoot( currentDir = process.cwd() ){
  const pathToPackage = currentDir + CONFIG_FILENAME;
  if( existsSync(pathToPackage) || currentDir === "/"){
    return currentDir;
  } else {
    return getPathToRoot( resolve(currentDir, '..') );
  }
}

function getEnvVars(){
  // get config file content
  const configFilePath = getPathToRoot() + CONFIG_FILENAME;
  const configFileContent = existsSync(configFilePath) ? JSON.parse(readFileSync(configFilePath)) : {};

  // mush config with defaults
  const envVarConfig = convict(ENV_VAR_SCHEMA_JSON);
  const envVarConfigContent = configFileContent.envVars || {};
  envVarConfig.load(envVarConfigContent);
  const envVarNameMap = envVarConfig.getProperties();

  // gimme values!
  const envVarValues = Object.keys(envVarNameMap).reduce((collector,key) => {
    collector[key] = process.env[envVarNameMap[key]];
    return collector;
  },{});

  //validateEnvVars(envVarValues);

  return envVarValues;
}

/*
  if(!process.env.KIBANA_CI_REPORTER_KEY){
    errors.push('Missing GitHub app key in KIBANA_CI_REPORTER_KEY environment variable');
  }
  
  if(!process.env.KIBANA_CI_REPORTER_KEY){
    errors.push('Missing GitHub app id in KIBANA_CI_REPORTER_KEY environment variable');
  }
  
  if(!process.env.ghprbGhRepository){
    errors.push('Missing repo in ghprbGhRepository environment variable');
  }

  if(!process.env.ghprbActualCommit){
    errors.push('Missing commit sha in ghprbActualCommit environment variable');
  }

  if(!process.env.BUILD_URL){
    errors.push('Missing build url in BUILD_URL environment variable');
  }
*/

function validateEnvVars(envVarValueMap){
  const errors = [];
  Object.keys(envVarValueMap)
    .forEach(key => {
      if(typeof envVarValueMap[key] !== 'string'){
        errors.push(`Environment variable ${key} not set`);
      }
    });
  if(errors.length){
    throw new Error(errors.join('\n'));
  }
}

function getCommandLineArgs(){
  const args = {
    name: process.argv[2],
    cmd: process.argv[3],
    cmdArgs: process.argv.slice(4),
  }

  if(!args.name || !args.cmd ){
    throw new Error('Please invoke with the following format: github-checks-reporter {name of task} {task command} {...task arguments}');
  }

  return args;
};

module.exports = function(){
  // appKey, appId, repoSlug, name, cmd, cmdArgs
  return {
    ...getEnvVars(),
    ...getCommandLineArgs(),
  };
};