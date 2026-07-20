export class LiveParseError extends Error {
  constructor(message: string, public readonly source?: string) {
    super(message);
    this.name = 'LiveParseError';
  }
}

export class LiveCompileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LiveCompileError';
  }
}

export class LiveRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LiveRuntimeError';
  }
}

export function isLiveError(e: unknown): e is Error {
  return e instanceof LiveParseError || e instanceof LiveCompileError || e instanceof LiveRuntimeError;
}
