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
// original from https://github.com/salesforcecli/plugin-info/blob/main/test/shared/parseReleaseNotes.test.ts
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, it } from 'mocha';
import fs from 'fs-extra';
import { expect, use as chaiUse } from 'chai';
import Sinon from 'sinon';
import SinonChai from 'sinon-chai';
import { marked } from 'marked';
import { parseChangeLog } from '../../src/shared/parseChangeLog.js';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

chaiUse(SinonChai);

describe('parseReleaseNotes tests', () => {
  const sandbox = Sinon.createSandbox();
  const notes = fs.readFileSync(`${__dirname}/../fixtures/notes.md`, 'utf8');
  const baseUrl = 'https://github.com/forcedotcom/cli/tree/main/releasenotes/sfdx';

  let lexerSpy: Sinon.SinonSpy;

  beforeEach(() => {
    lexerSpy = sandbox.spy(marked, 'lexer');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('calls lexer with raw release notes', () => {
    parseChangeLog(notes, '7.121.8', '7.120.0');

    expect(lexerSpy.called).to.be.true;
    expect(lexerSpy.args[0][0]).to.deep.equal(notes);
  });

  it('filters out correct version from tokens', () => {
    const tokens = parseChangeLog(notes, '63.18.1', '63.17.2');

    const results = JSON.stringify(tokens, null, '  ');

    expect(tokens.tokens[0].raw).to.include('63.18.1');
    expect(results).to.include('63.18.1');
    expect(results).to.not.include('63.17.2');
    expect(results).to.not.include('13.3.1');
    expect(results).to.not.include('7.125.0');
  });

  it('throws error if version is not found', () => {
    try {
      parseChangeLog(notes, '1.2.3', '7.120.0');
    } catch (err) {
      expect((err as Error).message).to.equal(`Didn't find version '1.2.3'. View release notes online at: ${baseUrl}`);
    }
  });

  it('matches entire version, not partial', () => {
    const tokens = parseChangeLog(notes, '13.3.1', '7.120.0');

    const results = JSON.stringify(tokens, null, '  ');

    expect(tokens.tokens[0].raw).to.include('13.3.1');
    expect(results).to.include('- test for matching full version (`3.3.1 !== 13.3.1`)');

    try {
      // Won't find partial version (3.3.1 is part of 13.3.1)
      parseChangeLog(notes, '3.3.1', '7.120.0');
    } catch (err) {
      expect((err as Error).message).to.equal(`Didn't find version '3.3.1'. View release notes online at: ${baseUrl}`);
    }
  });

  it('finds a version above what was asked for if not found', () => {
    const tokens = parseChangeLog(notes, '63.17.0', '63.18.1');

    const results = JSON.stringify(tokens, null, '  ');

    expect(tokens.tokens[1].raw).to.include('63.17.2');
    expect(results).to.include('- test for finding nearby versions');
  });

  it('finds a version below what was asked for if not found', () => {
    const tokens = parseChangeLog(notes, '63.17.5', '63.18.1');

    const results = JSON.stringify(tokens, null, '  ');

    expect(tokens.tokens[1].raw).to.include('63.17.2');
    expect(results).to.include('- test for finding nearby versions');
  });

  it('finds highest version if multiple minors exist', () => {
    const tokens = parseChangeLog(notes, '63.18.0', '7.120.0');

    const results = JSON.stringify(tokens, null, '  ');

    expect(tokens.tokens[1].raw).to.include('63.18.2'); // 63.18.1 exists in fixtures/notes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    expect((tokens.tokens[3] as any).items[0].tokens[0].tokens[1].type).to.be.equal('link');
    expect(results).to.include('- testing multiple minors (higher)');
  });

  it('shows warning if a different version is shown', () => {
    const tokens = parseChangeLog(notes, '63.18.0', '7.120.0');

    const results = JSON.stringify(tokens, null, '  ');

    expect(tokens.tokens[0].raw).to.include('63.18.0'); // version asked for
    expect(tokens.tokens[0].raw).to.include('63.18.2'); // version found
    expect(results).to.include(
      'ATTENTION: Version 63.18.0 was not found. Showing notes for closest patch version 63.18.2.',
    );
  });
});
