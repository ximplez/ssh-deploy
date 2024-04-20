const { readFileSync, existsSync } = require('fs');
const { validateRequiredInputs } = require('./helpers');

const githubWorkspace = process.env.GITHUB_WORKSPACE;
const SSH_PRIVATE_KEY_PATH = 'SSH_PRIVATE_KEY_PATH';

const DEPLOY_CONFIG_PATH = 'DEPLOY_CONFIG_PATH';
const SSH_CMD_CONFIG_PATH = 'SSH_CMD_CONFIG_PATH';
const sshCmdRemoteKey = 'sshCmdRemote';

const readConfig = (configPath) => {
  if (!existsSync(configPath)) {
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
  if (!existsSync(SshKeyPath)) {
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
  console.info('[initConfig] start.');
  const deployConfigPath = process.env[DEPLOY_CONFIG_PATH] || process.env[`INPUT_${DEPLOY_CONFIG_PATH}`];
  const sshCmdPath = process.env[SSH_CMD_CONFIG_PATH] || process.env[`INPUT_${SSH_CMD_CONFIG_PATH}`];
  validateRequiredInputs({ deployConfigPath, sshCmdPath });
  const deployConfig = readConfig(`${githubWorkspace}/${deployConfigPath}`);
  const sshCmdConfig = readConfig(`${githubWorkspace}/${sshCmdPath}`);
  if (deployConfig && deployConfig[sshCmdRemoteKey]
    && sshCmdConfig && sshCmdConfig[deployConfig[sshCmdRemoteKey]]
  ) {
    const sshConfig = sshCmdConfig[deployConfig[sshCmdRemoteKey]];
    Object.keys(sshConfig).forEach((k) => {
      if (k && sshConfig[k]) {
        process.env[k] = sshConfig[k];
        if (k === SSH_PRIVATE_KEY_PATH) {
          process.env.SSH_PRIVATE_KEY = readSshKey(sshConfig[k]);
        }
      }
    });
    console.info('✅ [initConfig] success.');
    return;
  }
  console.warn(`⚠️ [initConfig] config is not match. sshCmdRemote: ${deployConfig[sshCmdRemoteKey]}`);
};

module.exports = {
  initConfig
};
