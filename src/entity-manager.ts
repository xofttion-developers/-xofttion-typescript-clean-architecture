import { Optional } from '@xofttion/utils';
import { from, firstValueFrom, zip } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { EntityDataSource } from './datasource';
import { Entity } from './entity';
import { BaseModelORM } from './model-orm';
import { EntityLink, EntitySync } from './unit-of-work';

export class EntityManager {
  private relations: Map<string, BaseModelORM>;

  private links: EntityLink[] = [];

  private syncs: EntitySync[] = [];

  private destroys: BaseModelORM[] = [];

  constructor(private dataSource: EntityDataSource) {
    this.relations = new Map<string, BaseModelORM>();
  }

  public persist(link: EntityLink): void {
    this.links.push(link);
  }

  public sync(sync: EntitySync): void {
    this.syncs.push(sync);

    this.relation(sync.entity, sync.model);
  }

  public destroy(entity: Entity): void {
    this.select(entity).present((model) => {
      this.destroys.push(model);
    });
  }

  public relation(entity: Entity, model: BaseModelORM): void {
    this.relations.set(entity.uuid, model);
  }

  public select(entity: Entity): Optional<BaseModelORM> {
    return Optional.build(this.relations.get(entity.uuid));
  }

  public flush(): Promise<void[]> {
    return firstValueFrom(
      zip(this.persistAll(), this.syncAll(), this.destroyAll()).pipe(
        tap(() => {
          this.dispose();
        })
      )
    );
  }

  public dispose(): void {
    this.relations.clear();

    this.links = [];
    this.syncs = [];
    this.destroys = [];
  }

  private persistAll(): Promise<void> {
    return firstValueFrom(
      from(this.links).pipe(
        map((link) => {
          const model = link.createModel(this);

          this.dataSource.insert(model).then(() => {
            this.relation(link.entity, model);
          });
        })
      )
    );
  }

  private syncAll(): Promise<void> {
    return firstValueFrom(
      from(this.syncs).pipe(
        map((sync) => {
          const dirty = sync.verify();

          if (dirty) {
            this.dataSource.update(sync.model, dirty);
          }
        })
      )
    );
  }

  private destroyAll(): Promise<void> {
    return firstValueFrom(
      from(this.destroys).pipe(
        map((destroy) => {
          this.dataSource.delete(destroy);
        })
      )
    );
  }
}
