import { EntityManager } from './entity-manager';
import { Entity } from './entity';
import { ModelORM } from './model-orm';

type EntityStatusProps = { [key: string]: any };

export interface EntityLink {
  entity: Entity;

  createModel(entityManager: EntityManager): ModelORM;
}

export interface EntitySync {
  entity: Entity;
  model: ModelORM;

  check(): boolean;
}

export abstract class XofttionEntitySync implements EntitySync {
  private _initialStatusProps: EntityStatusProps;

  constructor(public readonly entity: Entity, public readonly model: ModelORM) {
    this._initialStatusProps = this._createStatusProps(entity);
  }

  public check(): boolean {
    const isDirty = this._isDirty();

    if (isDirty) {
      this.sync();
    }

    return isDirty;
  }

  public abstract sync(): void;

  private _createStatusProps(entity: Entity): EntityStatusProps {
    const statusProps: { [key: string]: any } = {};

    Object.keys(entity).forEach((key) => {
      statusProps[key] = (entity as any)[key];
    });

    return statusProps;
  }

  private _isDirty(): boolean {
    const currentStatusProps = this._createStatusProps(this.entity);

    let isDirty = false;

    Object.keys(currentStatusProps).forEach((key) => {
      isDirty = isDirty || currentStatusProps[key] !== this._initialStatusProps[key];
    });

    return isDirty;
  }
}

export interface UnitOfWork {
  flush(): Promise<void>;
}
