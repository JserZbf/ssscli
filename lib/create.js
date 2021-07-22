const path = require('path');
const fs = require('fs-extra');
const Inquirer = require('inquirer');
const Creator = require('./Creator');


module.exports = async function (projectName, options) {
  const cwd = process.cwd(); // 获取当前工作的执行目录
  const targetDir = path.join(cwd, projectName);
  console.log(targetDir, options);
  if (fs.existsSync(targetDir)) {
    if (options.force) {
      // 强制安装先删除
      console.log('___');
      await fs.remove(targetDir);
    } else {
      // 提示用户是否覆盖
      let { action } = await Inquirer.prompt([
        {
          name: 'action',
          type: 'list',
          message: 'Target directory already exists Pick an action:',
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Cancel', value: false },
          ],
        },
      ]);
      if (!action) {
        return;
      } else if (action === 'overwrite') {
        console.log(`\r\nRemoving...`);
        await fs.remove(targetDir);
      }
      console.log(action);
    }
  }
  const create = new Creator(projectName,targetDir)
  create.create() //创建项目
};
