const axios = require('axios')

axios.interceptors.response.use(function (res) {
    return res.data
})

async function fetchRepoList(params) {
    // 可以通过配置文件
    axios.get('')
}

module.exports ={
    fetchRepoList
}