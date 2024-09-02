/*
 * Copyright (c) 2023, jayree
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import fs from 'fs-extra';
import sinon from 'sinon';
import printChangeLog from '../src/index.js';

describe('printChangeLog', () => {
  const cacheDir = '/path/to/cache';
  const pluginRootPath = '/path/to/plugin';

  const pluginName = 'test-plugin';
  const pluginVersion = '1.0.0';

  const changeLog = `# Changelog\n\n## Version ${pluginVersion}\n- Some changes`;
  const expectedResult = `\u001b[35m\u001b[4m\u001b[1m# Changelog for '${pluginName}':\u001b[22m\u001b[24m\u001b[39m\n\n\u001b[32m\u001b[1m## Version ${pluginVersion}\u001b[22m\u001b[39m\n\n    * \u001b[0mSome changes\u001b[0m\n\n`;

  let readJsonPackageStub: sinon.SinonStub;

  let readFileChangeLogStub: sinon.SinonStub;

  let ensureFileVersionStub: sinon.SinonStub;
  let readJsonVersionStub: sinon.SinonStub;
  let writeJsonVersionStub: sinon.SinonStub;

  beforeEach(() => {
    readJsonPackageStub = sinon.stub(fs, 'readJson');
    readFileChangeLogStub = sinon.stub(fs, 'readFile');
    ensureFileVersionStub = sinon.stub(fs, 'ensureFile');
    readJsonVersionStub = sinon.stub(fs, 'readJSON');
    writeJsonVersionStub = sinon.stub(fs, 'writeJson');

    readJsonPackageStub
      .withArgs(`${pluginRootPath}/package.json`)
      .resolves({ name: pluginName, version: pluginVersion });

    readFileChangeLogStub.withArgs(`${pluginRootPath}/CHANGELOG.md`, 'utf8').resolves(changeLog);

    ensureFileVersionStub.withArgs(`${cacheDir}/${pluginName}/version`).resolves();
    writeJsonVersionStub.withArgs(`${cacheDir}/${pluginName}/version`, { version: pluginVersion }).resolves();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return the parsed changelog when the local version is different from the plugin version', async () => {
    readJsonVersionStub.withArgs(`${cacheDir}/${pluginName}/version`).resolves({ version: '0.0.1' });

    const result = await printChangeLog(cacheDir, pluginRootPath);
    expect(result).to.equal(expectedResult);
  });

  it('should return the parsed changelog when the local version does not exist', async () => {
    readJsonVersionStub.withArgs(`${cacheDir}/${pluginName}/version`).throws(new Error());

    const result = await printChangeLog(cacheDir, pluginRootPath);
    expect(result).to.equal(expectedResult);
  });

  it('should return undefined when the local version is the same as the plugin version', async () => {
    readJsonVersionStub.withArgs(`${cacheDir}/${pluginName}/version`).resolves({ version: pluginVersion });

    const result = await printChangeLog(cacheDir, pluginRootPath);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(result).to.be.undefined;
  });

  it('should handle errors and return undefined', async () => {
    readJsonPackageStub.withArgs(`${pluginRootPath}/package.json`).throws(new Error('File not found'));

    const result = await printChangeLog(cacheDir, pluginRootPath);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(result).to.be.undefined;
  });
});
