import Debug from 'debug';
import type { Logger } from '@salesforce/core';
export default function printChangeLog(cacheDir: string, pluginRootPath: string, loggerOrDebug?: Logger | Debug.Debugger): Promise<string | undefined>;
