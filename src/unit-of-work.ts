import { EntityManager } from './entity-manager';
import { Entity } from './entity';
import { BaseModel, ModelUpdated } from './model';

function isUpdated(model: any): model is ModelUpdated {
  return 'updatedAt' in model;
}

export type ModelDirty = { [key: string]: any };

export abstract class EntityLink {
  constructor(public readonly entity: Entity) {}

  public abstract createModel(manager: EntityManager): BaseModel;
}

export abstract class EntitySync {
  private firstStatus: ModelDirty;

  constructor(public readonly entity: Entity, public readonly model: BaseModel) {
    this.firstStatus = this.mapModel(model);
  }

  public abstract sync(): void;

  public verify(): ModelDirty | undefined {
    this.sync();

    return this.getDirty();
  }

  private mapModel(model: BaseModel): ModelDirty {
    const dirty: ModelDirty = {};

    Object.keys(model).forEach((key) => {
      dirty[key] = (model as any)[key];
    });

    return dirty;
  }

  private getDirty(): ModelDirty | undefined {
    const currentStatus = this.mapModel(this.model);

    const dirty: ModelDirty = {};

    let isDirty = false;

    Object.keys(currentStatus).forEach((key) => {
      if (currentStatus[key] !== this.firstStatus[key]) {
        isDirty = true;
        dirty[key] = currentStatus[key];
      }
    });

    if (isUpdated(this.model)) {
      dirty['updatedAt'] = new Date();
    }

    return isDirty ? dirty : undefined;
  }
}

export interface UnitOfWork {
  flush(): Promise<void>;
}
