/*
 * Copyright (c) 2023, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// original from https://github.com/salesforcecli/plugin-info/blob/main/test/shared/parseReleaseNotes.test.ts
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

    // eslint-disable-next-line no-unused-expressions
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
    expect(results).to.include('- testing multiple minors (higher)');
  });

  it('shows warning if a different version is shown', () => {
    const tokens = parseChangeLog(notes, '63.18.0', '7.120.0');

    const results = JSON.stringify(tokens, null, '  ');

    expect(tokens.tokens[0].raw).to.include('63.18.0'); // version asked for
    expect(tokens.tokens[0].raw).to.include('63.18.2'); // version found
    expect(results).to.include(
      'ATTENTION: Version 63.18.0 was not found. Showing notes for closest patch version 63.18.2.'
    );
  });
});
