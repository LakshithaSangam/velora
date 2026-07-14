declare module "node-webvtt" {
  interface Cue {
    identifier: string;
    start: number;
    end: number;
    text: string;
    styles: string;
  }

  interface ParseResult {
    valid: boolean;
    strict: boolean;
    cues: Cue[];
    errors: unknown[];
  }

  export function parse(input: string, options?: { meta?: boolean; strict?: boolean }): ParseResult;
}
