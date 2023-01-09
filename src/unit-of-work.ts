import { EntityManager } from './entity-manager';
import { Entity } from './entity';
import { ModelORM } from './model-orm';

export type ModelDirty = { [key: string]: any };

export abstract class EntityLink {
  constructor(public readonly entity: Entity) {}

  public abstract createModel(entityManager: EntityManager): ModelORM;
}

export abstract class EntitySync {
  private _firstStatus: ModelDirty;

  constructor(public readonly entity: Entity, public readonly model: ModelORM) {
    this._firstStatus = this._createStatus(model);
  }

  public abstract sync(): void;

  public verify(): ModelDirty | undefined {
    this.sync();

    return this._getDirty();
  }

  private _createStatus(model: ModelORM): ModelDirty {
    const modelStatus: ModelDirty = {};

    Object.keys(model).forEach((key) => {
      modelStatus[key] = (model as any)[key];
    });

    return modelStatus;
  }

  private _getDirty(): ModelDirty | undefined {
    const currentStatus = this._createStatus(this.model);

    const modelDirty: ModelDirty = {};

    let dirty = false;

    Object.keys(currentStatus).forEach((key) => {
      if (currentStatus[key] !== this._firstStatus[key]) {
        dirty = true;
        modelDirty[key] = currentStatus[key];
      }
    });

    return dirty ? modelDirty : undefined;
  }
}

export interface UnitOfWork {
  flush(): Promise<void>;
}
