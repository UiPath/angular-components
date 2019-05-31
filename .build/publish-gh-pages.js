const ghpages = require('gh-pages')

console.log('Publishing docs to branch `gh-pages`...')
ghpages.publish('documentation', (err) => {
    if (err) {
        console.error(err)
    } else {
        console.log('Docs have been published succesfully...')
    }
})



