import { Optional, promisesZip } from '@xofttion/utils';
import { EntityDataSource } from './datasource';
import { Entity } from './entity';
import { EntityLink } from './entity-link';
import { EntitySync, ModelDirty } from './entity-sync';
import { Procedure } from './procedure';
import { BaseModel, ModelHidden } from './model';

type BaseEntityLink = EntityLink<Entity, BaseModel>;
type BaseEntitySync = EntitySync<Entity, BaseModel>;

type SyncPromise = {
  dirty: ModelDirty;
  model: BaseModel;
};

export abstract class EntityManager {
  abstract persist(link: BaseEntityLink): void;

  abstract sync(sync: BaseEntitySync): void;

  abstract destroy(entity: Entity): void;

  abstract procedure(procedure: Procedure): void;

  abstract relation(entity: Entity, model: BaseModel): void;

  abstract select<T extends BaseModel>(entity: Entity): Optional<T>;

  abstract flush(): Promise<void>;

  abstract flushAsync(): Promise<void>;

  abstract dispose(): void;
}

export class XofttionEntityManager implements EntityManager {
  private relations: Map<string, BaseModel>;

  private links: BaseEntityLink[] = [];

  private syncs: BaseEntitySync[] = [];

  private destroys: BaseModel[] = [];

  private hiddens: ModelHidden[] = [];

  private procedures: Procedure[] = [];

  constructor(private source: EntityDataSource) {
    this.relations = new Map<string, BaseModel>();
  }

  public persist(link: BaseEntityLink): void {
    this.links.push(link);
  }

  public sync(sync: BaseEntitySync): void {
    if (sync.bindable) {
      this.relation(sync.entity, sync.model);
    }

    this.syncs.push(sync);
  }

  public destroy(entity: Entity): void {
    this.select(entity).present((model) => {
      isHidden(model) ? this.hiddens.push(model) : this.destroys.push(model);
    });
  }

  public procedure(procedure: Procedure): void {
    this.procedures.push(procedure);
  }

  public relation(entity: Entity, model: BaseModel): void {
    this.relations.set(entity.uuid, model);
  }

  public select<T extends BaseModel>(entity: Entity): Optional<T> {
    return Optional.build(
      this.relations.has(entity.uuid)
        ? (this.relations.get(entity.uuid) as T)
        : undefined
    );
  }

  public flush(): Promise<void> {
    return promisesZip([
      () => this.persistAll(),
      () => this.syncAll(),
      () => this.hiddenAll(),
      () => this.destroyAll(),
      () => this.procedureAll()
    ])
      .then(() => Promise.resolve())
      .finally(() => {
        this.dispose();
      });
  }

  public async flushAsync(): Promise<void> {
    await this.persistAll();
    await this.syncAll();
    await this.hiddenAll();
    await this.destroyAll();
    await this.procedureAll();

    this.dispose();
  }

  public dispose(): void {
    this.relations.clear();

    this.links = [];
    this.syncs = [];
    this.destroys = [];
    this.hiddens = [];
    this.procedures = [];
  }

  private persistAll(): Promise<void[]> {
    return Promise.all(
      this.links.map((link) => {
        const result = link.createModel(this);

        return (result instanceof Promise ? result : Promise.resolve(result)).then(
          (model) => {
            if (link.bindable) {
              this.relation(link.entity, model);
            }

            return this.source.insert(model);
          }
        );
      })
    );
  }

  private syncAll(): Promise<void[]> {
    return Promise.all(
      this.syncs
        .filter((sync) => !this.destroys.includes(sync.model))
        .reduce((syncs, sync) => {
          const dirty = sync.verify();

          if (dirty) {
            syncs.push({ model: sync.model, dirty });
          }

          return syncs;
        }, [] as SyncPromise[])
        .map(({ model, dirty }) => this.source.update(model, dirty))
    );
  }

  private destroyAll(): Promise<void[]> {
    return Promise.all(this.destroys.map((destroy) => this.source.delete(destroy)));
  }

  private hiddenAll(): Promise<void[]> {
    return Promise.all(this.hiddens.map((hidden) => this.source.hidden(hidden)));
  }

  private procedureAll(): Promise<void[]> {
    return Promise.all(
      this.procedures.map((procedure) => this.source.procedure(procedure))
    );
  }
}

function isHidden(model: any): model is ModelHidden {
  return 'hidden' in model && 'hiddenAt' in model;
}
