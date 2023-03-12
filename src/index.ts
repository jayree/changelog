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
import semver from 'semver';
import compare from 'semver-compare';

const debug = Debug(`jayree:changelog`);

// original from https://github.com/salesforcecli/plugin-info/blob/main/src/shared/parseReleaseNotes.ts
const parseChangeLog = (
  notes: string,
  version: string,
  currentVersion: string
): { tokens: marked.Token[]; version: string } => {
  let found = false;
  let versions: string[] = [];

  const parsed = marked.lexer(notes);

  let tokens: marked.Token[] = [];

  const findVersion = (desiredVersion: string, localVersion?: string): void => {
    versions = [];

    tokens = parsed.filter((token) => {
      // TODO: Could make header depth (2) a setting in oclif.info.releasenotes
      if (token.type === 'heading' && token.depth <= 2) {
        const coercedVersion = semver.coerce(token.text)?.version;

        if (coercedVersion) {
          // We will use this to find the closest patch if passed version is not found
          versions.push(coercedVersion);

          if (
            (!localVersion && compare(desiredVersion, coercedVersion) === 0) ||
            (localVersion &&
              compare(desiredVersion, coercedVersion) >= 0 &&
              compare(coercedVersion, localVersion) === 1)
          ) {
            found = true;

            return token;
          }
        }

        found = false;
      } else if (found === true) {
        return token;
      }
    });
  };

  findVersion(version, currentVersion);

  if (!versions.includes(version)) {
    const semverRange = `${semver.major(version)}.${semver.minor(version)}.x`;

    const closestVersion = semver.maxSatisfying<string>(versions, semverRange);

    if (closestVersion !== null) {
      findVersion(closestVersion, currentVersion);

      if (!tokens.length) findVersion(closestVersion);

      const warning = marked.lexer(
        `# ATTENTION: Version ${version} was not found. Showing notes for closest patch version ${closestVersion}.`
      )[0];

      tokens.unshift(warning);
      version = closestVersion;
    }
  }

  return { tokens, version };
};

export default async function printChangeLog(cacheDir: string, pluginRootPath: string): Promise<string | undefined> {
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
    } catch (error) {
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
  } catch (error) {
    debug(error);
  }
}
