const ghpages = require('gh-pages')
const { variables } = require('../common')
const { owner, repo, token } = variables;

const PUBLISH_CONFIG = {
    repo: `https://${token}@github.com/${owner}/${repo}.git`,
    silent: true,
}

console.log('Publishing docs to branch `gh-pages`...')

ghpages.publish(
    'documentation',
    PUBLISH_CONFIG,
    (err) => {
        if (err) {
            console.error(err)
        } else {
            console.log('Docs have been published succesfully...')
        }
    })
