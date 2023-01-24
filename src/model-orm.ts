export interface BaseModelORM {
  id: number;
}

export interface ModelORMCreated extends BaseModelORM {
  createdAt?: Date;
}

export interface ModelORMUpdated extends ModelORMCreated {
  updatedAt?: Date;
}

export interface ModelORMDestroyed extends ModelORMCreated {
  destroy: boolean;
  destroyedAt?: Date;
}

export interface ModelORM extends BaseModelORM {
  createdAt?: Date;
  updatedAt?: Date;
  destroy: boolean;
  destroyedAt?: Date;
}
