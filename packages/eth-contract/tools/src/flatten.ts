const fs = require("fs");
const path = require("path");

interface ICompiledContract {
    filePath: string;
    source: string;
    dependencies: Record<string, ICompiledContract>;
    license?: string;
}

const importRegex = /^\s*import\s+(?:"([^"]+)"|'([^']+)')./gm;
const licenseRegex = /\/\/\s+SPDX-License-Identifier:.*/gm;
const compiledContracts: Record<string, ICompiledContract> = {};

async function compileSolidityFile(filePath: string, isBaseFile: boolean = false) {
    if (compiledContracts[filePath]) {
        return compiledContracts[filePath];
    }

    let sourceCode = fs.readFileSync(filePath, "utf8");
    let license;
    if (isBaseFile) {
        const licenseMatch = licenseRegex.exec(sourceCode);
        license = licenseMatch[0];
    }
    sourceCode = sourceCode.replace(licenseRegex, '');

    let importMatch;
    const imports = [];
    while ((importMatch = importRegex.exec(sourceCode))) {
        const importPath = importMatch[1] || importMatch[2];
        imports.push(importPath);
    }

    const dependencies = {};
    await Promise.all(
        imports.map(async (importPath) => {
            let importFilePath;
            if (importPath.startsWith('.')) {
                importFilePath = path.resolve(path.dirname(filePath), importPath);
            }
            else {
                importFilePath = path.resolve('./node_modules/' + importPath);
            }
            dependencies[importPath] = await compileSolidityFile(importFilePath);
        })
    );

    compiledContracts[filePath] = {
        filePath: filePath,
        source: sourceCode,
        dependencies: dependencies,
        license: license
    };

    return compiledContracts[filePath];
}

export default async function flattenSolidityFile(sourcefilePath: string, targetFilePath: string) {
    let processedFilePath = [];
    const contracts = await compileSolidityFile(sourcefilePath, true);
    const license = contracts.license;
    const flattenDependencies = (contract) => {
        let sourceCode = "";
        for (const [importPath, dependency] of Object.entries(
            contract.dependencies
        )) {
            sourceCode += flattenDependencies(dependency);
        }
        if (!processedFilePath.includes(contract.filePath)) {
            sourceCode += contract.source;
            processedFilePath.push(contract.filePath);
        }
        return sourceCode;
    };

    let sourceCode = license + '\n' + flattenDependencies(contracts);
    sourceCode = sourceCode.replace(importRegex, '');
    fs.writeFileSync(targetFilePath, sourceCode);
    return sourceCode;
}