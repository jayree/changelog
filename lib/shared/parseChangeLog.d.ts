import { marked } from 'marked';
declare const parseChangeLog: (notes: string, version: string, currentVersion: string) => {
    tokens: marked.Token[];
    version: string;
};
export { parseChangeLog };
