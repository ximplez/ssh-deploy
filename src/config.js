const { readFileSync, existsSync } = require('fs');
const { handleError } = require('./helpers');

const githubWorkspace = process.env.GITHUB_WORKSPACE;
const inputConfigKey = 'CONFIG_PATH';
const inputSshKeyPath = 'SSH_PRIVATE_KEY_PATH';

const readConfig = (configPath) => {
  if (existsSync(configPath)) {
    const message = `⚠️ [FILE] ${configPath} Required file exist.`;
    handleError(message, true);
    return null;
  }
  try {
    console.log(`[FILE] reading ${configPath} file ...`);
    const fileContents = readFileSync(configPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    const message = `⚠️[FILE] reading file error. configPath: ${configPath}, message:  ${error.message}`;
    handleError(message, true);
    return null;
  }
};

const readSshKey = (SshKeyPath) => {
  if (existsSync(SshKeyPath)) {
    const message = `⚠️ [FILE] ${SshKeyPath} Required file exist.`;
    handleError(message, true);
    return null;
  }
  try {
    console.log(`[FILE] reading ${SshKeyPath} file ...`);
    return readFileSync(SshKeyPath, 'utf8');
  } catch (error) {
    const message = `⚠️[FILE] reading file error. configPath: ${SshKeyPath}, message:  ${error.message}`;
    handleError(message, true);
    return '';
  }
};

const initConfig = () => {
  const inputValue = process.env[inputConfigKey] || process.env[`INPUT_${inputConfigKey}`];
  if (inputValue) {
    const path = `${githubWorkspace}/${inputValue}`;
    const conf = readConfig(path);
    Object.keys(conf).forEach((k) => {
      if (k && conf[k]) {
        process.env[k] = conf[k];
        if (k === inputSshKeyPath) {
          process.env.SSH_PRIVATE_KEY = readSshKey(conf[k]);
        }
      }
    });
    return;
  }
  console.warn('⚠️ [initConfig] CONFIG_PATH is not defined');
};

module.exports = {
  initConfig
};
