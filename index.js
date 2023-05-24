const core = require('@actions/core')
const github = require('@actions/github')

async function main() {
  try {
    const { payload: { repository: repo } } = github.context

    const token = core.getInput('token')
    const filterOutPattern = core.getInput('filter_out_pattern')
    const filterOutFlags = core.getInput('filter_out_flags')
    const prNumber = core.getInput('pr_number')

    const octokit = new github.GitHub(token)

    const commitsListed = await octokit.pulls.listCommits({
      owner: repo.owner.login,
      repo: repo.name,
      pull_number: prNumber,
    })

    let commits = commitsListed.data

    if (filterOutPattern) {
      const regex = new RegExp(filterOutPattern, filterOutFlags)
      commits = commits.filter(({ commit }) => {
        return !regex.test(commit.message)
      })
    }

    const messages = commits.map(({ commit }) => commit.message)

    core.saveState('commits', commits)
    core.saveState('messages', messages)
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
