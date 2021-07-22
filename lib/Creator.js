const { fetchRepoList } = require("./request");

class Creator {
  constructor(projectName, targetDir) {
    this.name = projectName;
    this.target = targetDir;
  }
  async fetchRepo() {
     let repos = fetchRepoList
     console.log(repos)
  }
  async fetchTag() {}
  async download() {}
  async create() {
    console.log(this.name, this.target, '_____');
    // 当前组织模版
    let repo = await this.fetchRepo();
    // 当前模版找到版本号
    // let tag = await this.fetchTag();
    // let downloadUrl = await this.download(repo, tag);
  }
}

module.exports = Creator;
