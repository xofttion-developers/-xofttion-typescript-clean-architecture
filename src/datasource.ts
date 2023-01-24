import { BaseModelORM } from './model-orm';
import { ModelDirty } from './unit-of-work';

export interface EntityDataSource {
  insert(model: BaseModelORM): Promise<void>;

  update(model: BaseModelORM, dirty: ModelDirty): Promise<void>;

  delete(model: BaseModelORM): Promise<void>;
}
