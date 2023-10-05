import { Token } from 'marked';
declare const parseChangeLog: (notes: string, version: string, currentVersion: string) => {
    tokens: Token[];
    version: string;
};
export { parseChangeLog };
