import * as chalk from 'chalk';
import {
  existsSync,
  readFileSync,
} from 'fs';
import * as glob from 'glob';
import {
  basename,
  dirname,
  resolve,
} from 'path';
import * as ts from 'typescript';

import {
  getPullRequestHead,
  statusReporterFactory,
} from '../common/github';

const reportStatus = statusReporterFactory('public-api-check');

const {
    red,
    cyan,
    green,
    grey,
} = chalk.default;

const ROOT = resolve(__dirname, '../..');
const BARREL = 'index.ts';

const resolveParentDir = (path) => dirname(resolve(ROOT, path));
interface IExportPair {
    exportLocation: string;
    exported: string;
}

interface IDecoratedClass {
    decoratorName: string;
    className: string;
}

interface IDecoratedError extends IDecoratedClass {
    exportLocation: string;
    rootPath: string;
}

let isErrorFlagged = false;

const _handleUnexpectedError = (err?: string) => {
    if (err) { console.error(err); }

    process.exit(1);
};

const buildError = ({ className, decoratorName, exportLocation, rootPath }: IDecoratedError, message: string) => {
    return [
        red(`ERROR:`),
        `    Invalid export source: ${cyan(rootPath)}`,
        `    Class source: ${cyan(`${exportLocation}.ts`)}`,
        `    Class name: ${cyan(className)}`,
        `    Annotation: ${cyan(decoratorName)}`,
        `    ${green('Recommendation:')} ${cyan(message)}`,
        ``,
    ];
};

const reportAnnotationError = (error: IDecoratedError) =>
    console.error(
        buildError(
            error,
            `Use named exports! eg: 'export { A } from './a.module`,
        )
            .join('\n'),
    );

const reportBarrelError = (error: IDecoratedError) =>
    console.error(
        buildError(
            error,
            `Please drop any barreled export files from the export chain of annotated classes.`,
        )
            .join('\n'),
    );

const readFileNode = (path: string) =>
    ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);

const getChildren = (node: ts.Node) => {
    const children: ts.Node[] = [];

    ts.forEachChild(node, (subnode) => {
        children.push(subnode);
    });

    return children;
};

const getExportDeclarations = (sourceNode: ts.Node) =>
    getChildren(sourceNode)
        .filter(node => ts.isExportDeclaration(node))
        .map((exportNode) => {
            const children = getChildren(exportNode);

            const exportedFrom = children
                .find(node => ts.isStringLiteral(node))!;

            const namedExports = children
                .find(node => ts.isNamedExports(node));

            const locationText = exportedFrom.getText();

            return {
                exportLocation: locationText.substring(1, locationText.length - 1),
                exported: namedExports ? namedExports.getText() : null,
            } as IExportPair;
        });

const searchForDecoratedClasses = (source: ts.SourceFile) => {
    const decoratedClassNodes = getChildren(source)
        .filter(node => ts.isClassDeclaration(node))
        .filter(node => !!node.decorators);

    const classes: IDecoratedClass[] = [];

    decoratedClassNodes
        .forEach(decoratedClassNode => {
            decoratedClassNode.decorators
                .forEach(decoratorNode => {
                    const className = getChildren(decoratedClassNode)
                        .find(classNode => ts.isIdentifier(classNode))
                        .getText();

                    const [decoratorName] = getChildren(decoratorNode.expression)
                        .map(expressionNode => expressionNode.getText());

                    classes.push({
                        className,
                        decoratorName,
                    });
                });
        });

    return classes;
};

const resolveFileLocation = (exportLocation: string, path: string) => {
    const parentDir = resolveParentDir(path);

    let fileName = `${exportLocation}.ts`;

    const fileLocation = resolve(parentDir, fileName);

    if (existsSync(fileLocation)) { return fileLocation; }

    fileName = `${exportLocation}/index.ts`;

    return resolve(parentDir, fileName);
};

const checkForUnnamedDecoratedExports = (rootPath: string, path: string, exportList: IExportPair[]) =>
    exportList
        .filter(e => !e.exported)
        .forEach(({ exportLocation }) => {
            const fileLocation = resolveFileLocation(exportLocation, path);
            const file = readFileNode(fileLocation);

            const exportDeclarations = getExportDeclarations(file);

            if (!exportDeclarations.length) {
                const decoratedClasses = searchForDecoratedClasses(file);

                if (!decoratedClasses.length) { return; }

                isErrorFlagged = true;

                decoratedClasses
                    .map(
                        ({ className, decoratorName }) =>
                            reportAnnotationError({
                                className,
                                decoratorName,
                                rootPath,
                                exportLocation,
                            }),
                    );
            } else {
                checkForUnnamedDecoratedExports(rootPath, fileLocation, exportDeclarations);
            }
        });

const barrelMap = new Map<string, IDecoratedError[]>();
const barrelChainMap = new Map<string, boolean>();

const checkForBarreledDecoratedExports = (rootPath: string, path: string, exportList: IExportPair[]) => {
    const isFirstStackFrame = rootPath === path;

    // exit early if an error has already been found down this path
    if (barrelMap.get(rootPath)) { return; }

    exportList
        .forEach(({ exportLocation }) => {
            const fileLocation = resolveFileLocation(exportLocation, path);
            const file = readFileNode(fileLocation);

            if (basename(fileLocation) === BARREL) {
                barrelChainMap.set(rootPath, true);
            }

            const decoratedClasses = searchForDecoratedClasses(file);
            const exportDeclarations = getExportDeclarations(file);

            if (
                barrelChainMap.has(rootPath) &&
                !!decoratedClasses.length
            ) {
                const errors = decoratedClasses.map(
                    ({ className, decoratorName }) => ({
                        className,
                        decoratorName,
                        exportLocation,
                        rootPath,
                    } as IDecoratedError),
                );

                barrelMap.set(rootPath, errors);
            }

            checkForBarreledDecoratedExports(rootPath, fileLocation, exportDeclarations);
        });

    if (
        isFirstStackFrame &&
        barrelMap.has(rootPath)
    ) {
        isErrorFlagged = true;
        const errors = barrelMap.get(rootPath);
        errors.forEach(error => reportBarrelError(error));
    }
};

const checkFile = (path: string) => {
    const sourceFile = readFileNode(path);
    const rootExports = getExportDeclarations(sourceFile);

    console.log(`${grey('Checking')} ${cyan(sourceFile.fileName)} ${grey('for unnamed decorated exports...')}`);
    checkForUnnamedDecoratedExports(path, path, rootExports);

    console.log(`${grey('Checking')} ${cyan(sourceFile.fileName)} ${grey('decorated exports hidden behind barrels...')}`);
    checkForBarreledDecoratedExports(path, path, rootExports);
};

const forEachApiFile = (callback: (string) => void) => {
    return new Promise((res, rej) => {
        const walker = new glob.Glob('./projects/**/public_api.ts', {
            root: ROOT,
        }, (err, files) => {
            if (err) {
                console.error(err);
                rej(err);
            }

            files.forEach(callback);
        });

        walker.on('end', res);
    });
};

const run = async () => {
    const head = await getPullRequestHead();

    await reportStatus('pending', head.sha, 'Checking Public API...')
        .catch(_handleUnexpectedError);

    await forEachApiFile(checkFile);

    if (isErrorFlagged) {
        console.error(red(`⛔   Something doesn't check out`));

        await reportStatus('error', head.sha, 'npm run check:exports for more info...')
            .catch(_handleUnexpectedError);
    } else {
        console.log(green(`💯   Good to go!`));

        await reportStatus('success', head.sha, '✔ Good to go!')
            .catch(_handleUnexpectedError);
    }
};

(async () => {
    await run()
        .catch(_handleUnexpectedError);
})();

