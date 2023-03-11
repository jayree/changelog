@jayree/changelog
===========================================

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

printChangeLog(this.config.cacheDir, join(__dirname, '..', '..'));
```