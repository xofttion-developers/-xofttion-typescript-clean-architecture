import { ModelDirty } from './entity-sync';
import { BaseModel, ModelHidden } from './model';

export interface EntityDataSource {
  insert(model: BaseModel): Promise<void>;

  update(model: BaseModel, dirty: ModelDirty): Promise<void>;

  delete(model: BaseModel): Promise<void>;

  hidden(model: ModelHidden): Promise<void>;
}
