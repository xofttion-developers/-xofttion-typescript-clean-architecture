import { ModelORM } from './model-orm';

export interface AbstractEntityDataSource {
  insert(model: ModelORM): Promise<void>;

  update(model: ModelORM): Promise<void>;

  delete(model: ModelORM): Promise<void>;
}
