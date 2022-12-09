import { EntityManager } from './entity-manager';
import { Entity } from './entity';
import { ModelORM } from './model-orm';

export interface EntityLink {
  entity: Entity;

  createModel(entityManager: EntityManager): ModelORM;
}

export interface EntitySync {
  entity: Entity;
  model: ModelORM;

  check(): boolean;
}

export interface UnitOfWork {
  flush(): Promise<void>;
}
