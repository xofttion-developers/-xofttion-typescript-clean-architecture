import { BaseModel, ModelHidden } from './model';
import { ModelDirty } from './unit-of-work';

export interface EntityDataSource {
  insert(model: BaseModel): Promise<void>;

  update(model: BaseModel, dirty: ModelDirty): Promise<void>;

  delete(model: BaseModel): Promise<void>;

  hidden(model: ModelHidden): Promise<void>;
}
