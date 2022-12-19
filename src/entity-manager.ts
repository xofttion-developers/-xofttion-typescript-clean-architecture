import { Optional } from '@xofttion/utils';
import { AbstractEntityDataSource } from './datasource';
import { Entity } from './entity';
import { ModelORM } from './model-orm';
import { AbstractEntityLink, AbstractEntitySync } from './unit-of-work';

export interface AbstractEntityManager {
  persist(link: AbstractEntityLink): void;

  sync(sync: AbstractEntitySync): void;

  destroy(entity: Entity): void;

  relation(entity: Entity, model: ModelORM): void;

  select(entity: Entity): Optional<ModelORM>;

  flush(): Promise<void>;

  dispose(): void;
}

export class EntityManager implements AbstractEntityManager {
  private _relations: Map<string, ModelORM>;

  private _links: AbstractEntityLink[] = [];

  private _syncs: AbstractEntitySync[] = [];

  private _destroys: ModelORM[] = [];

  constructor(private _entityDataSource: AbstractEntityDataSource) {
    this._relations = new Map<string, ModelORM>();
  }

  public persist(link: AbstractEntityLink): void {
    this._links.push(link);
  }

  public sync(sync: AbstractEntitySync): void {
    this._syncs.push(sync);

    this.relation(sync.entity, sync.model);
  }

  public destroy(entity: Entity): void {
    const optional = this.select(entity);

    if (optional.isPresent()) {
      this._destroys.push(optional.get());
    }
  }

  public relation(entity: Entity, model: ModelORM): void {
    this._relations.set(entity.uuid, model);
  }

  public select(entity: Entity): Optional<ModelORM> {
    return Optional.build(this._relations.get(entity.uuid));
  }

  public async flush(): Promise<void> {
    await this._persistAll();
    await this._syncAll();
    await this._destroyAll();

    this.dispose(); // Reboot
  }

  public dispose(): void {
    this._relations.clear();

    this._links = [];
    this._syncs = [];
    this._destroys = [];
  }

  private async _persistAll(): Promise<void> {
    for (const link of this._links) {
      const model = link.createModel(this);

      await this._entityDataSource.insert(model);

      this.relation(link.entity, model);
    }
  }

  private async _syncAll(): Promise<void> {
    for (const sync of this._syncs) {
      const requiredSync = sync.check();

      if (requiredSync) {
        await this._entityDataSource.update(sync.model);
      }
    }
  }

  private async _destroyAll(): Promise<void> {
    for (const modelDestroy of this._destroys) {
      await this._entityDataSource.delete(modelDestroy);
    }
  }
}
