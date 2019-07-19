const Octokit = require('@octokit/rest')
const { variables } = require('../../common')
const { owner, repo, pull, token } = variables;
const { red, blue } = require('chalk');

const isTokenDefined = !!token;

const REQUIRED = red('required');
const OWNER = blue('Owner');
const REPOSITORY = blue('Reposiory');
const PULL_NUMBER = blue('Pull Number');
const TOKEN = blue('Token');

if (!isTokenDefined) {
    console.warn(`${TOKEN} variable is required in order to contact GitHub!`);
}

const github = new Octokit({
    auth: token,
})

const getPullRequestHead = async () => {
    if (!isTokenDefined) {
        console.warn(`${OWNER}, ${REPOSITORY}, ${PULL_NUMBER} variables are ${REQUIRED}. Skipping HEAD fetch...`)
        return { sha: '' };
    }

    const pr = await github.pullRequests.get({
        owner,
        repo,
        pull_number: pull,
    })

    return pr.data.head
}

const getCommits = async () => {
    if (!isTokenDefined) {
        console.warn(`${OWNER}, ${REPOSITORY}, ${PULL_NUMBER} variables are ${REQUIRED}. Skipping commit fetch...`)
        return [];
    }

    console.log('📡   Looking up commits for PR #%s...', pull)
    const response = await github.pulls.listCommits({
        owner,
        repo,
        pull_number: pull,
        per_page: 100
    })

    return response.data
}

const statusReporterFactory =
    (context) => {
        return async (state, sha, description, target_url) => {
            if (!isTokenDefined) {
                console.warn(`${OWNER}, ${REPOSITORY}, ${PULL_NUMBER} variables are ${REQUIRED}. Skipping status report ${state} for ${context}...`)
                return;
            }

            await github.repos.createStatus({
                owner,
                repo,
                sha,
                state,
                description,
                context,
                target_url,
            })
        }
    }

module.exports = {
    getCommits,
    getPullRequestHead,
    statusReporterFactory
}
