export interface AbstractEntityDatabase {
  connect(): Promise<void>;

  disconnect(full?: boolean): Promise<void>;

  transaction(): Promise<void>;

  commit(): Promise<void>;

  rollback(): Promise<void>;
}
