import { EntityManager } from './entity-manager';
import { Entity } from './entity';
import { BaseModel, ModelUpdated } from './model';

export type ModelDirty = { [key: string]: any };

export abstract class EntityLink<E extends Entity, M extends BaseModel> {
  constructor(public readonly entity: E) {}

  public abstract createModel(manager: EntityManager): M;
}

export abstract class EntitySync<E extends Entity, M extends BaseModel> {
  private firstStatus: ModelDirty;

  constructor(public readonly entity: E, public readonly model: M) {
    this.firstStatus = this.mapModel(model);
  }

  public abstract sync(): void;

  public verify(): ModelDirty | undefined {
    this.sync();

    return this.getDirty();
  }

  private mapModel(model: M): ModelDirty {
    const dirty: ModelDirty = {};

    Object.keys(model).forEach((key) => {
      dirty[key] = (model as any)[key];
    });

    return dirty;
  }

  private getDirty(): ModelDirty | undefined {
    const currentStatus = this.mapModel(this.model);

    const modelDirty: ModelDirty = {};

    let dirty = false;

    Object.keys(currentStatus).forEach((key) => {
      if (currentStatus[key] !== this.firstStatus[key]) {
        dirty = true;
        modelDirty[key] = currentStatus[key];
      }
    });

    if (isUpdated(this.model)) {
      modelDirty['updatedAt'] = new Date();
    }

    return dirty ? modelDirty : undefined;
  }
}

export interface UnitOfWork {
  flush(): Promise<void>;

  flushAsync(): Promise<void>;
}

function isUpdated(model: any): model is ModelUpdated {
  return 'updatedAt' in model;
}
