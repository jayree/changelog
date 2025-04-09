/*
 * Copyright (c) 2023, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join } from 'node:path';
import fs from 'fs-extra';
import Debug from 'debug';
import { marked, MarkedExtension } from 'marked';
import type { Logger } from '@salesforce/core';
import { markedTerminal } from '../local/marked-terminal.js';
import { parseChangeLog } from './shared/parseChangeLog.js';

export default async function printChangeLog(
  cacheDir: string,
  pluginRootPath: string,
  loggerOrDebug?: Logger | Debug.Debugger,
): Promise<string | undefined> {
  let logger: Logger | { debug: (txt: unknown) => void };

  if (isLogger(loggerOrDebug)) {
    logger = loggerOrDebug;
  } else if (isDebugDebugger(loggerOrDebug)) {
    logger = {
      debug(txt: unknown): void {
        loggerOrDebug(txt);
      },
    };
  } else {
    const debug = Debug(`jayree:changelog`);
    logger = {
      debug(txt: unknown): void {
        debug(txt);
      },
    };
  }

  try {
    const { name, version } = (await fs.readJson(join(pluginRootPath, 'package.json'))) as {
      name: string;
      version: string;
    };
    const changelogFile = await fs.readFile(join(pluginRootPath, 'CHANGELOG.md'), 'utf8');
    const versionDir = join(cacheDir, name);
    const versionFile = join(versionDir, 'version');
    await fs.ensureFile(versionFile);
    let localVersion: { version: string };
    try {
      localVersion = (await fs.readJSON(versionFile)) as { version: string };
    } catch {
      localVersion = { version: '0.0.0' };
    }
    logger.debug({ pluginRootPath, cacheDir, localVersion: localVersion.version, version });
    if (localVersion.version !== version) {
      const { tokens, version: parsedVersion } = parseChangeLog(changelogFile, version, localVersion.version);
      marked.use(markedTerminal({ emoji: false }) as unknown as MarkedExtension);
      tokens.unshift(marked.lexer(`# Changelog for '${name}':`)[0]);
      await fs.writeJson(versionFile, { version: parsedVersion });
      return marked.parser(tokens);
    }
  } catch (error) {
    logger.debug(error);
  }
}

function isLogger(obj: Logger | Debug.Debugger | undefined): obj is Logger {
  return (obj && 'debug' in obj && typeof obj.debug === 'function') ?? false;
}

function isDebugDebugger(obj: Logger | Debug.Debugger | undefined): obj is Debug.Debugger {
  return typeof obj === 'function' && 'namespace' in obj;
}
