// const fs = require('fs');
// const moment = require('moment');

const { execSync } = require('child_process');

const execute = (commandString, options = { stdio: 'inherit' }) => execSync(commandString, { encoding: 'utf8', shell: 'bash', ...options });
const getPath = (path) => path.split('\\').join('/');

const [basePath] = execute('echo ${UIPATH_REPOS_FOLDER}', {}).split('\n');

const orchestratorPath = getPath(`${basePath}\\Orchestrator\\src\\Web\\Client\\app`);
const orchestratorModulePath = getPath(`${orchestratorPath}\\node_modules\\@uipath\\angular`);

const angularComponentsPath = getPath(`${basePath}\\angular-components`);
const angularComponentsDistPath = getPath(`${angularComponentsPath}\\dist\\angular`);


// Build lib for prod
execute(`npm run build:prod --prefix ${angularComponentsPath}`);

// Replace module in orch
execute(`rm -rf ${orchestratorModulePath}`);
execute(`cp -r ${angularComponentsDistPath} ${orchestratorModulePath}`);

// Start Orch FE Dev
execute(`npm run start --prefix ${orchestratorPath}`);
