/*
 * Copyright (c) 2023, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join } from 'node:path';
import fs from 'fs-extra';
import Debug from 'debug';
import TerminalRenderer from 'marked-terminal';
import { marked } from 'marked';
import { parseChangeLog } from './shared/parseChangeLog.js';
export default async function printChangeLog(cacheDir, pluginRootPath, loggerOrDebug) {
    let logger;
    if (isLogger(loggerOrDebug)) {
        logger = loggerOrDebug;
    }
    else if (isDebugDebugger(loggerOrDebug)) {
        logger = {
            debug(txt) {
                loggerOrDebug(txt);
            },
        };
    }
    else {
        const debug = Debug(`jayree:changelog`);
        logger = {
            debug(txt) {
                debug(txt);
            },
        };
    }
    try {
        const { name, version } = (await fs.readJson(join(pluginRootPath, 'package.json')));
        const changelogFile = await fs.readFile(join(pluginRootPath, 'CHANGELOG.md'), 'utf8');
        const versionDir = join(cacheDir, name);
        const versionFile = join(versionDir, 'version');
        await fs.ensureFile(versionFile);
        let localVersion;
        try {
            localVersion = (await fs.readJSON(versionFile));
        }
        catch {
            localVersion = { version: '0.0.0' };
        }
        logger.debug({ pluginRootPath, cacheDir, localVersion: localVersion.version, version });
        if (localVersion.version !== version) {
            const { tokens, version: parsedVersion } = parseChangeLog(changelogFile, version, localVersion.version);
            marked.setOptions({
                renderer: new TerminalRenderer({ emoji: false }),
            });
            tokens.unshift(marked.lexer(`# Changelog for '${name}':`)[0]);
            await fs.writeJson(versionFile, { version: parsedVersion });
            return marked.parser(tokens);
        }
    }
    catch (error) {
        logger.debug(error);
    }
}
function isLogger(obj) {
    return (obj && 'debug' in obj && typeof obj.debug === 'function') ?? false;
}
function isDebugDebugger(obj) {
    return typeof obj === 'function' && 'namespace' in obj;
}
//# sourceMappingURL=index.js.map