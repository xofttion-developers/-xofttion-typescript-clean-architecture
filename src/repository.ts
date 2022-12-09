import { Optional } from '@xofttion/utils';
import { Entity } from './entity';

export interface Repository<T extends Entity> {
  persist(entity: T): Promise<void>;

  findByUuid(uuid: string): Promise<Optional<T>>;

  findAll(): Promise<T[]>;

  destroy(entity: T): Promise<void>;
}
