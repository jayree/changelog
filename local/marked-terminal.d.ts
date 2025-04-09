export interface RendererOptions {
  code: (str: string) => string;
  blockquote: (str: string) => string;
  html: (str: string) => string;
  heading: (str: string) => string;
  firstHeading: (str: string) => string;
  hr: (str: string) => string;
  listitem: (str: string) => string;
  list: (body: string, ordered: boolean, indent: string) => string;
  table: (str: string) => string;
  paragraph: (str: string) => string;
  strong: (str: string) => string;
  em: (str: string) => string;
  codespan: (str: string) => string;
  del: (str: string) => string;
  link: (str: string) => string;
  href: (str: string) => string;
  text: (str: any) => string;
  unescape: boolean;
  emoji: boolean;
  width: number;
  showSectionPrefix: boolean;
  reflowText: boolean;
  tab: number | string;
  tableOptions: Record<string, any>;
  image?: (href: string, title?: string, text?: string) => string;
}
export interface HighlightOptions {
  [key: string]: any;
}
export interface MarkedTerminalExtension {
  renderer: Record<string, (...args: any[]) => string>;
  useNewRenderer: boolean;
}
export declare class Renderer {
  o: RendererOptions;
  tab: string;
  tableSettings: Record<string, any>;
  emoji: (text: string) => string;
  unescape: (text: string) => string;
  highlightOptions: HighlightOptions;
  transform: (text: string) => string;
  options: any;
  parser: any;
  constructor(options: Partial<RendererOptions>, highlightOptions?: HighlightOptions);
  static textLength(str: string): number;
  space(): string;
  text(
    text:
      | string
      | {
          tokens?: any[];
          text?: string;
        },
  ): string;
  code(
    code:
      | string
      | {
          text: string;
          lang?: string;
          escaped?: boolean;
        },
    lang?: string,
    escaped?: boolean,
  ): string;
  blockquote(
    quote:
      | string
      | {
          tokens: any[];
          text?: string;
        },
  ): string;
  html(
    html:
      | string
      | {
          text: string;
        },
  ): string;
  heading(
    text:
      | string
      | {
          depth: number;
          tokens: any[];
        },
    level?: number,
  ): string;
  hr(): string;
  list(
    body:
      | string
      | {
          start: number;
          loose: boolean;
          ordered: boolean;
          items: any[];
        },
    ordered?: boolean,
  ): string;
  listitem(
    text:
      | string
      | {
          task?: boolean;
          checked?: boolean;
          loose?: boolean;
          tokens: any[];
        },
  ): string;
  checkbox(
    checked:
      | boolean
      | {
          checked: boolean;
        },
  ): string;
  paragraph(
    text:
      | string
      | {
          tokens: any[];
        },
  ): string;
  table(
    header:
      | string
      | {
          header: any[];
          rows: any[];
        },
    body?: string,
  ): string;
  tablerow(
    content:
      | string
      | {
          text: string;
        },
  ): string;
  tablecell(
    content:
      | string
      | {
          tokens: any[];
        },
  ): string;
  strong(
    text:
      | string
      | {
          tokens: any[];
        },
  ): string;
  em(
    text:
      | string
      | {
          tokens: any[];
        },
  ): string;
  codespan(
    text:
      | string
      | {
          text: string;
        },
  ): string;
  br(): string;
  del(
    text:
      | string
      | {
          tokens: any[];
        },
  ): string;
  link(
    href:
      | string
      | {
          href: string;
          title?: string;
          tokens: any[];
        },
    title?: string,
    text?: string,
  ): string;
  image(
    href:
      | string
      | {
          href: string;
          title?: string;
          text: string;
        },
    title?: string,
    text?: string,
  ): string;
}
export declare function markedTerminal(
  options?: Partial<RendererOptions>,
  highlightOptions?: HighlightOptions,
): MarkedTerminalExtension;
