#!/usr/bin/env node
const { sshDeploy } = require('./rsyncCli');
const { remoteCmdBefore, remoteCmdAfter, remoteCmdCfg } = require('./remoteCmd');
const { addSshKey, getPrivateKeyPath, updateKnownHosts } = require('./sshKey');
const { validateRequiredInputs, localCmd } = require('./helpers');
const inputs = require('./inputs');

const run = async () => {
  const {
    source, remoteUser, remoteHost, remotePort,
    deployKeyName, sshPrivateKey,
    args, exclude, sshCmdArgs,
    scriptBefore, scriptBeforeRequired,
    scriptAfter, scriptAfterRequired,
    rsyncServer, sshBefore, useConfig, sshConfigKey
  } = inputs;
  // Validate required inputs
  validateRequiredInputs({ sshPrivateKey, remoteHost, remoteUser });
  if (sshBefore) {
    await localCmd(sshBefore, true);
  }
  // Add SSH key
  addSshKey(sshPrivateKey, deployKeyName);
  const { path: privateKeyPath } = getPrivateKeyPath(deployKeyName);
  // Update known hosts if ssh command is present to avoid prompt
  if (scriptBefore || scriptAfter) {
    updateKnownHosts(remoteHost, remotePort);
  }
  // Check Script before
  if (scriptBefore) {
    if (useConfig) {
      await remoteCmdCfg(scriptBefore, privateKeyPath, scriptBeforeRequired, sshCmdArgs, sshConfigKey);
    } else {
      await remoteCmdBefore(scriptBefore, privateKeyPath, scriptBeforeRequired, sshCmdArgs);
    }
  }
  await sshDeploy({
    source, rsyncServer, exclude, remotePort,
    privateKeyPath, args, sshCmdArgs
  });
  // Check script after
  if (scriptAfter) {
    if (useConfig) {
      await remoteCmdCfg(scriptBefore, privateKeyPath, scriptBeforeRequired, sshCmdArgs, sshConfigKey);
    } else {
      await remoteCmdAfter(scriptAfter, privateKeyPath, scriptAfterRequired, sshCmdArgs);
    }
  }
};

run()
  .then((data = '') => {
    console.log('✅ [DONE]', data);
  })
  .catch((error) => {
    console.error('❌ [ERROR]', error.message);
    process.exit(1);
  });
