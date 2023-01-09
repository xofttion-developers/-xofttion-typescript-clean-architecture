import { ModelORM } from './model-orm';
import { ModelDirty } from './unit-of-work';

export interface EntityDataSource {
  insert(model: ModelORM): Promise<void>;

  update(model: ModelORM, dirty: ModelDirty): Promise<void>;

  delete(model: ModelORM): Promise<void>;
}
