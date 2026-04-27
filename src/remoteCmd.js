const { exec } = require('child_process');
const crypto = require('crypto');
const { sshServer, githubWorkspace, remotePort } = require('./inputs');
const { writeToFile, deleteFile } = require('./helpers');

const handleError = (message, isRequired, callback) => {
  if (isRequired) {
    callback(new Error(message));
  } else {
    console.warn(message);
  }
};

const remoteCmd = async (content, privateKeyPath, isRequired, sshCmdArgs, label) => new Promise((resolve, reject) => {
  const uuid = crypto.randomUUID();
  const filename = `local_ssh_script-${label}-${uuid}.sh`;
  try {
    writeToFile({ dir: githubWorkspace, filename, content });
    const dataLimit = 10000;
    const rsyncStdout = (process.env.RSYNC_STDOUT || '').substring(0, dataLimit);
    console.log(`Executing remote script: ssh -i ${privateKeyPath} ${sshServer}`);
    exec(
      `DEBIAN_FRONTEND=noninteractive ssh -p ${(remotePort || 22)} -i ${privateKeyPath} -o StrictHostKeyChecking=no ${sshCmdArgs} ${sshServer} 'RSYNC_STDOUT="${rsyncStdout}" bash -s' < ${filename}`,
      (err, data = '', stderr = '') => {
        if (err) {
          const message = `⚠️ [CMD] Remote script failed: ${err.message}`;
          console.warn(`${message} \n`, data, stderr);
          handleError(message, isRequired, reject);
        } else {
          const limited = data.substring(0, dataLimit);
          console.log('✅ [CMD] Remote script executed. \n', limited, stderr);
          deleteFile({ dir: githubWorkspace, filename });
          console.log('✅ [FILE] Script file deleted.');
          resolve(limited);
        }
      }
    );
  } catch (err) {
    handleError(err.message, isRequired, reject);
  }
});


const remoteCmdCfg = async (content, privateKeyPath, isRequired, sshCmdArgs, label) => new Promise((resolve, reject) => {
  const uuid = crypto.randomUUID();
  const filename = `local_ssh_script-${label}-${uuid}.sh`;
  try {
    writeToFile({ dir: githubWorkspace, filename, content });
    const dataLimit = 10000;
    const rsyncStdout = (process.env.RSYNC_STDOUT || '').substring(0, dataLimit);
    console.log(`Executing remote script: ssh -i ${privateKeyPath} ${label}`);
    exec(
      `DEBIAN_FRONTEND=noninteractive ssh ${label} -i ${privateKeyPath} -o StrictHostKeyChecking=no ${sshCmdArgs} 'RSYNC_STDOUT="${rsyncStdout}" bash -s' < ${filename}`,
      (err, data = '', stderr = '') => {
        if (err) {
          const message = `⚠️ [CMD] Remote script failed: ${err.message}`;
          console.warn(`${message} \n`, data, stderr);
          handleError(message, isRequired, reject);
        } else {
          const limited = data.substring(0, dataLimit);
          console.log('✅ [CMD] Remote script executed. \n', limited, stderr);
          deleteFile({ dir: githubWorkspace, filename });
          console.log('✅ [FILE] Script file deleted.');
          resolve(limited);
        }
      }
    );
  } catch (err) {
    handleError(err.message, isRequired, reject);
  }
});

module.exports = {
  remoteCmdBefore: async (cmd, privateKeyPath, isRequired,sshCmdArgs) => remoteCmd(cmd, privateKeyPath, isRequired,sshCmdArgs, 'before'),
  remoteCmdAfter: async (cmd, privateKeyPath, isRequired,sshCmdArgs) => remoteCmd(cmd, privateKeyPath, isRequired,sshCmdArgs, 'after'),
  remoteCmdCfg
};
