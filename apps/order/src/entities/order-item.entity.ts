import {
  // AfterInsert,
  AfterLoad,
  // AfterUpdate,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import {
  OrderItemImportanceLevelEnum,
  OrderItemStatusEnum,
} from '../utils/constants';
import { File } from '@app/shared/types/file';
import { fetchFileById } from '@app/shared/utils/misc';

@Entity()
@Tree('closure-table')
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items)
  order: Relation<Order>;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'text',
    default: OrderItemStatusEnum.PENDING,
  })
  status: OrderItemStatusEnum;

  @Column({
    type: 'text',
    default: OrderItemImportanceLevelEnum.NECESSITY,
  })
  importanceLevel: OrderItemImportanceLevelEnum;

  @Column('simple-array', { default: [] })
  fileIds: string[];

  files: File[];

  @TreeParent()
  parent: OrderItem;

  @TreeChildren()
  children: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @AfterLoad()
  async loadFiles() {
    for (const fileId of this.fileIds) {
      const file = await fetchFileById(fileId);
      if (file) {
        this.files.push(file);
      }
    }
  }
}
