export interface IngestResult {
  rawText: string;
  title: string;
  sourceMeta: Record<string, unknown>;
}

export interface SourceAdapterInput {
  url?: string;
  fileBuffer?: Buffer;
  fileName?: string;
  pastedText?: string;
}

export interface SourceAdapter {
  ingest(input: SourceAdapterInput): Promise<IngestResult>;
}
