const core = require('@actions/core')
const github = require('@actions/github')

const filterPattern = /([a-zA-Z0-9]+-[0-9]+)/g;

async function main() {
  try {
    const { payload: { repository: repo } } = github.context

    const token = core.getInput('token')
    const prNumber = core.getInput('pr_number')

    const octokit = new github.GitHub(token)
    const messages = [];
    let page = 1;

    while (true) {
      const commitsListed = await octokit.pulls.listCommits({
        owner: repo.owner.login,
        repo: repo.name,
        pull_number: prNumber,
        per_page: 100,
        page
      });

      if (!commitsListed.data.length) {
        break;
      }

      page += 1;
      messages.push(
        ...commitsListed.data
          .map(item => item.commit.message)
          .filter(message => filterPattern.test(message))
      );
    }

    core.setOutput('messages', messages)

  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
