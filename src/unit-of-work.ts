import { EntityManager } from './entity-manager';
import { Entity } from './entity';
import { ModelORM } from './model-orm';

type EntityShot = { [key: string]: any };

export abstract class EntityLink {
  constructor(public readonly entity: Entity) {}

  abstract createModel(entityManager: EntityManager): ModelORM;
}

export abstract class EntitySync {
  private _initialShot: EntityShot;

  constructor(public readonly entity: Entity, public readonly model: ModelORM) {
    this._initialShot = this._createShot(entity);
  }

  public abstract sync(): void;

  public check(): boolean {
    const isDirty = this._isDirty();

    if (isDirty) {
      this.sync();
    }

    return isDirty;
  }

  private _createShot(entity: Entity): EntityShot {
    const entityShot: { [key: string]: any } = {};

    Object.keys(entity).forEach((key) => {
      entityShot[key] = (entity as any)[key];
    });

    return entityShot;
  }

  private _isDirty(): boolean {
    const currentShot = this._createShot(this.entity);

    let isDirty = false;

    Object.keys(currentShot).forEach((key) => {
      isDirty = isDirty || currentShot[key] !== this._initialShot[key];
    });

    return isDirty;
  }
}

export interface UnitOfWork {
  flush(): Promise<void>;
}
