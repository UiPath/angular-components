const fs = require('fs');
const moment = require('moment');
const { execSync } = require('child_process');

const allowedBumps = ['patch', 'minor', 'major', 'pre', 'stable'];
const allowedRcBumps = ['patch', 'minor', 'major'];

const bumpType = process.argv[2];
const rcType = process.argv[3];

if (!allowedBumps.includes(bumpType)) {
    console.error('[ERROR] You have to pass the version type ( patch | minor | major | pre | stable )');
    process.exit(1);
}

if (rcType && !allowedRcBumps.includes(rcType)) {
    console.error('[ERROR] You have to pass the prerelease version type ( patch | minor | major)');
    process.exit(1);
}

changeLog(bumpVersion());

function bumpVersion() {
    const content = fs.readFileSync('./package.json', 'utf-8');
    const [initialVersionLine, initialVersion] = content.match(new RegExp(/"version": "(.*)"/));

    const versionTypes = initialVersion.match(new RegExp(/([0-9]*).([0-9]*).([0-9]*)(.*)?/));

    const mainVersion = `${versionTypes[1]}.${versionTypes[2]}.${versionTypes[3]}`;
    const preRelease = versionTypes[4];

    let bumpedVersion;

    if (bumpType === 'pre') {
        if (rcType) {
            bumpedVersion = `${generateNextVersion(rcType, mainVersion)}-rc.0`;
        } else {
            const [preReleaseText, preReleaseVersion] = preRelease.split('.');

            bumpedVersion = `${mainVersion}${[preReleaseText, +preReleaseVersion + 1].join('.')}`;
        }
    } else {
        bumpedVersion = generateNextVersion(bumpType, mainVersion);
    }

    const updatedVersionLine = initialVersionLine.replace(initialVersion, bumpedVersion);
    const updatedContent = content.replace(initialVersionLine, updatedVersionLine);

    fs.writeFileSync('./package.json', updatedContent);

    const angularProjectContent = fs.readFileSync('./projects/angular/package.json', 'utf-8');
    const updatedAngularProject = angularProjectContent.replace(initialVersionLine, updatedVersionLine);

    fs.writeFileSync('./projects/angular/package.json', updatedAngularProject);

    execSync(`git tag v${bumpedVersion}`);

    return [initialVersion, bumpedVersion];
}

function changeLog([initialVersion, bumpedVersion]) {
    const cmd = `git log v${initialVersion}..HEAD --oneline`;
    let commitsSinceTag;

    try {
        commitsSinceTag = execSync(cmd, { encoding: 'utf-8' });
    } catch (err) {
        console.error(`\n[ERROR] Cannot read new commits since tag v${initialVersion}\n`);
        process.exit(1);
    }

    let initialChangeLog = `# v${bumpedVersion} (${moment().format('YYYY-MM-DD')})\n`;

    if (commitsSinceTag) {
        commitsSinceTag.split('\n').forEach(commit => {
            const match = commit.match(new RegExp(/[a-zA-Z0-9]* (.*): (.*)/));

            if (!match) return;

            const [, subject, message] = match;

            // skip commits of type "chore: version bump"
            if (subject === 'chore' && message === 'version bump') {
                return;
            }

            const hasOptional = subject.match(new RegExp(/.*\((.*)\)/));

            initialChangeLog += `* **${hasOptional ? hasOptional[1] : subject}** ${message}\n`;
        });
    }

    const changeLogContent = fs.readFileSync('CHANGELOG.md', 'utf-8');

    fs.writeFileSync('CHANGELOG.md', `${initialChangeLog}\n${changeLogContent}`);
}

function generateNextVersion (type, version) {
    const [major, minor, patch] = version.split('.');

    switch (type) {
        case 'patch':
            return [major, minor, +patch + 1].join('.');
        case 'minor':
            return [major, +minor + 1, 0].join('.');
        case 'major':
            return [+major + 1, 0, 0].join('.');
        case 'stable':
            return version;
    }
}
