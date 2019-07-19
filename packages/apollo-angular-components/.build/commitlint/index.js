/**
 * Adapted from: https://github.com/fathyb/commitlint-circle
 */
const { lint, load } = require('@commitlint/core')
const path = require('path')
const { red, yellow, blue, green } = require('chalk');

const { getPullRequestHead, getCommits, statusReporterFactory } = require('../common/github');

const _handleUnexpectedError = (err) => {
    console.error(err)
    process.exit(1)
}

const reportStatus = statusReporterFactory('commitlint')

const run = async () => {
    const head = await getPullRequestHead()

    console.log(blue('👮‍   Calling Git Police...'))

    await reportStatus('pending', head.sha, 'Checking commits...')

    const commits = await getCommits()

    const { rules } = await load(path.resolve('commitlint.config.js'))

    const lintResultList = await Promise.all(
        commits.map(({ commit }) => lint(commit.message, rules))
    )

    const isConventionalCommitGuidelineRespected = lintResultList.every(result => result.valid)
    const isAnyFixupCommit = commits.some(({ commit }) => commit.message.startsWith('fixup!'))

    if (
        isConventionalCommitGuidelineRespected &&
        !isAnyFixupCommit
    ) {
        console.log(green(`💯   Good to go!`))

        await reportStatus('success', head.sha, '✔ Good to go!')
            .catch(_handleUnexpectedError)

        return;
    }

    if (isAnyFixupCommit) {
        console.warn(yellow(`😬   There are still some fixup commits.`))

        await reportStatus('error', head.sha, 'Please rebase and apply the fixup commits!')
            .catch(_handleUnexpectedError)

        return;
    }

    console.error(red(`⛔   Something doesn't check out`))

    await reportStatus('error', head.sha, 'We use conventional commits (╯°□°）╯︵ ┻━┻', 'https://www.conventionalcommits.org/en/v1.0.0-beta.4/')
        .catch(_handleUnexpectedError)
}

(async () => {
    await run()
        .catch(_handleUnexpectedError)
})()
