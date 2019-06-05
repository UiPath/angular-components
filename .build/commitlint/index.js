/**
 * Adapted from: https://github.com/fathyb/commitlint-circle
 */
const Octokit = require('@octokit/rest')
const { lint, load } = require('@commitlint/core')
const path = require('path')

const ACCESS_TOKEN = process.env['GH_STATUS_TOKEN']

if (!ACCESS_TOKEN) throw new Error('No access token found. env: GH_STATUS_TOKEN')

const github = new Octokit({
    auth: ACCESS_TOKEN,
})

const owner = process.env['GH_OWNER']
const repo = process.env['GH_REPO']
const pull = process.env['GH_PULL_ID']

const _handleUnexpectedError = (err) => {
    console.error(err)
    process.exit(1)
}

const getCommits = async () => {
    console.log('📡   Looking up commits for PR #%s...', pull)
    const response = await github.pulls.listCommits({
        owner,
        repo,
        pull_number: pull,
        per_page: 100
    })

    return response.data
}

const reportStatus = async (state, sha, description, target_url) => {
    await github.repos.createStatus({
        owner,
        repo,
        sha,
        state,
        description,
        context: 'commitlint',
        target_url,
    })
}

const getPullRequestHead = async () => {
    const pr = await github.pullRequests.get({
        owner,
        repo,
        pull_number: pull,
    })

    return pr.data.head
}

const run = async () => {
    const head = await getPullRequestHead()

    console.log('👮‍   Calling Git Police...')

    await reportStatus('pending', head.sha, 'Checking commits...')

    const commits = await getCommits()

    const { rules } = await load(path.resolve('commitlint.config.js'))

    const lintResultList = await Promise.all(
        commits.map(({ commit }) => lint(commit.message, rules))
    )

    const isConventionalCommitGuidelineRespected = lintResultList.every(result => result.valid)
    const isAnyFixupCommit = commits.some(({ commit }) => commit.message.startsWith('fixup!'))

    console.log(isConventionalCommitGuidelineRespected)

    if (
        isConventionalCommitGuidelineRespected &&
        !isAnyFixupCommit
    ) {
        console.log(`💯   Good to go!`)

        await reportStatus('success', head.sha, '✔ Good to go!')
            .catch(_handleUnexpectedError)

        return;
    }

    if (isAnyFixupCommit) {
        console.log(`😬   There are still some fixup commits.`)

        await reportStatus('error', head.sha, 'Please rebase and apply the fixup commits!')
            .catch(_handleUnexpectedError)

        return;
    }

    console.log(`⛔   Something doesn't check out`)

    await reportStatus('error', head.sha, 'We use conventional commits (╯°□°）╯︵ ┻━┻', 'https://www.conventionalcommits.org/en/v1.0.0-beta.4/')
        .catch(_handleUnexpectedError)
}

(async () => {
    await run()
        .catch(_handleUnexpectedError)
})()
