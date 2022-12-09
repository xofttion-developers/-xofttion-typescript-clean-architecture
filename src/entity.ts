export class Entity {
  constructor(protected _uuid: string) {}

  public get uuid(): string {
    return this._uuid;
  }
}
