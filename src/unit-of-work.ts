import { EntityManager } from './entity-manager';
import { Entity } from './entity';
import { BaseModelORM } from './model-orm';

export type ModelDirty = { [key: string]: any };

export abstract class EntityLink {
  constructor(public readonly entity: Entity) {}

  public abstract createModel(manager: EntityManager): BaseModelORM;
}

export abstract class EntitySync {
  private _firstStatus: ModelDirty;

  constructor(public readonly entity: Entity, public readonly model: BaseModelORM) {
    this._firstStatus = this._createStatus(model);
  }

  public abstract sync(): void;

  public verify(): ModelDirty | undefined {
    this.sync();

    return this.getDirty();
  }

  private _createStatus(model: BaseModelORM): ModelDirty {
    const modelStatus: ModelDirty = {};

    Object.keys(model).forEach((key) => {
      modelStatus[key] = (model as any)[key];
    });

    return modelStatus;
  }

  private getDirty(): ModelDirty | undefined {
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
