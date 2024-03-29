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
export default async function printChangeLog(cacheDir, pluginRootPath, debug) {
    if (!debug)
        debug = Debug(`jayree:changelog`);
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
        catch (error) {
            localVersion = { version: '0.0.0' };
        }
        debug({ pluginRootPath, cacheDir, localVersion: localVersion.version, version });
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
        debug(error);
    }
}
//# sourceMappingURL=index.js.map