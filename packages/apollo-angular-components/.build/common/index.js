const extract = (token) => {
    const value = process.env[token]
    if (!value) throw new Error(`Could not read environment variable: ${token}`)

    return value;
}
const owner = extract('GH_OWNER')
const repo = extract('GH_REPO')
const pull = extract('GH_PULL_ID')
const token = extract('GH_TOKEN')

const variables = {
    owner,
    repo,
    pull,
    token,
}

module.exports = {
    variables,
}
