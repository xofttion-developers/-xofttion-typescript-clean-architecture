export interface UnitOfWork {
  flush(): Promise<void>;

  flushAsync(): Promise<void>;
}
