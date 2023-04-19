const fs = require('fs');
const { execSync } = require('child_process');
const { DateTime } = require('luxon');

const allowedBumps = ['fix-changelog-order', 'patch', 'minor', 'major', 'pre', 'stable'];
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

if (bumpType !== 'fix-changelog-order') {
    bumpAndTagVersion();
} else {
    fixChangelogOrder();
}

function bumpAndTagVersion() {
    const [initialVersion, bumpedVersion] = bumpVersion();
    changeLog([initialVersion, bumpedVersion]);

    execSync('git reset HEAD -- .');

    execSync('git add package.json package-lock.json CHANGELOG.md projects/angular/package.json');

    execSync(`git commit -m "chore: bump version to v${bumpedVersion}"`);

    execSync(`git tag v${bumpedVersion}`);
}


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

    const packageLock = fs.readFileSync('./package-lock.json', 'utf-8');
    const updatedPackageLock = packageLock.replaceAll(initialVersionLine, updatedVersionLine);

    fs.writeFileSync('./package-lock.json', updatedPackageLock);

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

    let initialChangeLog = `# v${bumpedVersion} (${DateTime.now().toISODate()})\n`;

    if (commitsSinceTag) {
        commitsSinceTag.split('\n').forEach(commit => {
            const match = commit.match(new RegExp(/[a-zA-Z0-9]* (.*): (.*)/));

            if (!match) return;

            const [, subject, message] = match;

            // skip commits of type "chore: version bump"
            if (subject === 'chore' && ( message === 'version bump' || message === "bump version" )) {
                return;
            }

            const hasOptional = subject.match(new RegExp(/.*\((.*)\)/));

            initialChangeLog += `* **${hasOptional ? hasOptional[1] : subject}** ${message}\n`;
        });
    }

    const changeLogContent = fs.readFileSync('CHANGELOG.md', 'utf-8');

    fs.writeFileSync('CHANGELOG.md', `${initialChangeLog}\n${changeLogContent}`);
}

function fixChangelogOrder() {
    const content = fs.readFileSync('CHANGELOG.md', 'utf-8');

    const sortedItems = content.match(new RegExp(/# v.*\((.*)(.|\n(?!# v))*/g));

    sortedItems.sort((prevItem, nextItem) => {
        const dateRegex = new RegExp(/# v.*\((.*)\)/);

        const prevDate = prevItem.match(dateRegex)[1];
        const nextDate = nextItem.match(dateRegex)[1];

        if (prevDate === nextDate) {
            const versionRegex = new RegExp(/# v(.*) /);

            const prevVersion = prevItem.match(versionRegex)[1];
            const nextVersion = nextItem.match(versionRegex)[1];

            if (prevVersion < nextVersion) {
                return 1;
            }

            return -1;
        }

        if (new Date(prevDate) < new Date(nextDate)) {
            return 1;
        }

        return -1;
    });

    fs.writeFileSync('CHANGELOG.md', sortedItems.join('\n'));
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
