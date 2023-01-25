import { Optional } from '@xofttion/utils';
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

  public async flush(): Promise<void> {
    await this.persistAll();
    await this.syncAll();
    await this.destroyAll();

    this.dispose();
  }

  public dispose(): void {
    this.relations.clear();

    this.links = [];
    this.syncs = [];
    this.destroys = [];
  }

  private async persistAll(): Promise<void> {
    for (const link of this.links) {
      const model = link.createModel(this);

      await this.dataSource.insert(model);

      this.relation(link.entity, model);
    }
  }

  private async syncAll(): Promise<void> {
    for (const sync of this.syncs) {
      const dirty = sync.verify();

      if (dirty) {
        await this.dataSource.update(sync.model, dirty);
      }
    }
  }

  private async destroyAll(): Promise<void> {
    for (const destroy of this.destroys) {
      await this.dataSource.delete(destroy);
    }
  }
}
