@jayree/changelog
===========================================

Parse a CHANGELOG.md file of a package and return the most recent entry.

## Install

```bash
npm install @jayree/changelog
````

## Usage

```js
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import printChangeLog from '@jayree/changelog';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pathToChangeLog = join(__dirname, '..', '..');
const cacheDir = this.config.cacheDir;

console.log(printChangeLog(cacheDir, pathToChangeLog));
```