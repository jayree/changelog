/*
 * Copyright 2026, jayree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// original from https://github.com/salesforcecli/plugin-info/blob/main/src/shared/parseReleaseNotes.ts
import semver from 'semver';
import compare from 'semver-compare';
import { marked, Token } from 'marked';

const parseChangeLog = (
  notes: string,
  version: string,
  currentVersion: string,
): { tokens: Token[]; version: string } => {
  let found = false;
  let versions: string[] = [];

  const parsed = marked.lexer(notes);

  let tokens: Token[] = [];

  const findVersion = (desiredVersion: string, localVersion?: string): void => {
    versions = [];

    tokens = parsed.filter((token) => {
      if (token.type === 'heading' && token.depth <= 2) {
        const coercedVersion = semver.coerce(token.text as string)?.version;

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
