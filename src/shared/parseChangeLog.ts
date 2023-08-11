/*
 * Copyright (c) 2023, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// original from https://github.com/salesforcecli/plugin-info/blob/main/src/shared/parseReleaseNotes.ts
import semver from 'semver';
import compare from 'semver-compare';
import { marked } from 'marked';

const parseChangeLog = (
  notes: string,
  version: string,
  currentVersion: string,
): { tokens: marked.Token[]; version: string } => {
  let found = false;
  let versions: string[] = [];

  const parsed = marked.lexer(notes);

  let tokens: marked.Token[] = [];

  const findVersion = (desiredVersion: string, localVersion?: string): void => {
    versions = [];

    tokens = parsed.filter((token) => {
      if (token.type === 'heading' && token.depth <= 2) {
        const coercedVersion = semver.coerce(token.text)?.version;

        if (coercedVersion) {
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
        `# ATTENTION: Version ${version} was not found. Showing notes for closest patch version ${closestVersion}.`,
      )[0];

      tokens.unshift(warning);
      version = closestVersion;
    }
  }

  return { tokens, version };
};

export { parseChangeLog };
