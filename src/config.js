const { readFileSync, existsSync } = require('fs');

const githubWorkspace = process.env.GITHUB_WORKSPACE;
const inputConfigKey = 'CONFIG_PATH';
const inputSshKeyPath = 'SSH_PRIVATE_KEY_PATH';

const readConfig = (configPath) => {
  if (existsSync(configPath)) {
    const message = `⚠️ [FILE] ${configPath} Required file exist.`;
    throw new Error(message);
  }
  try {
    console.log(`[FILE] reading ${configPath} file ...`);
    const fileContents = readFileSync(configPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    const message = `⚠️[FILE] reading file error. configPath: ${configPath}, message:  ${error.message}`;
    throw new Error(message);
  }
};

const readSshKey = (SshKeyPath) => {
  if (existsSync(SshKeyPath)) {
    const message = `⚠️ [FILE] ${SshKeyPath} Required file exist.`;
    throw new Error(message);
  }
  try {
    console.log(`[FILE] reading ${SshKeyPath} file ...`);
    return readFileSync(SshKeyPath, 'utf8');
  } catch (error) {
    const message = `⚠️[FILE] reading file error. configPath: ${SshKeyPath}, message:  ${error.message}`;
    throw new Error(message);
  }
};

const initConfig = () => {
  console.info('⚠️ [initConfig] start.');
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
    console.info('⚠️ [initConfig] end. process.env:', JSON.stringify(process.env));
    return;
  }
  console.warn('⚠️ [initConfig] CONFIG_PATH is not defined');
};

module.exports = {
  initConfig
};
