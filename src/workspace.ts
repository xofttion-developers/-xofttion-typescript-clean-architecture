export interface Workspace {
  flush(): Promise<void>;

  flushAsync(): Promise<void>;
}
