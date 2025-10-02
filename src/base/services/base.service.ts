/** biome-ignore-all lint/suspicious/noExplicitAny: any is required in this file */
import { InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Raw,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

import { User } from '@/modules/users/entities/user.entity';

import { PaginationDto, QueryDto } from '../dtos';
import { BaseEntity } from '../entities';

interface CustomFindManyOptions<Entity extends BaseEntity> extends FindManyOptions<Entity> {
  filters?: QueryDto & Record<string, any>;
}

export class BaseService<Entity extends BaseEntity> {
  protected logger: Logger;

  constructor(
    protected readonly repository: Repository<Entity>,
    logger: Logger
  ) {
    this.logger = logger;
  }

  async find(options: CustomFindManyOptions<Entity> = {}, currentUser?: User) {
    const preProcessedOptions = await this.preFind(options, currentUser);
    const data = await this.repository.find(preProcessedOptions);
    return this.postFind(data, preProcessedOptions, currentUser);
  }

  async findOne(options: FindManyOptions<Entity> = {}, currentUser?: User) {
    const preProcessedOptions = await this.preFindOne(options, currentUser);
    const data = await this.repository.findOne(preProcessedOptions);
    return this.postFindOne(data, preProcessedOptions, currentUser);
  }

  async count(options: CustomFindManyOptions<Entity> = {}, currentUser?: User) {
    const preProcessedOptions = await this.preCount(options, currentUser);
    return this.repository.count(preProcessedOptions);
  }

  async createOne(userId: string, createDto: DeepPartial<Entity>) {
    const doc = await this.preCreateOne(userId, createDto);
    const record = await this.repository.save(doc);
    return this.postCreateOne(record, createDto);
  }

  async create(userId: string, createDtos: DeepPartial<Entity>[]) {
    const docs = await this.preCreate(userId, createDtos);
    const records = await this.repository.save(docs);
    return this.postCreate(records, createDtos);
  }

  async update(userId: string, updateDto: DeepPartial<Entity>, options?: FindManyOptions<Entity>) {
    const oldRecords = (await this.find(options))!.data;
    if (oldRecords.length === 0) {
      throw new NotFoundException('Record(s) not found!');
    }

    const doc = await this.preUpdate(userId, updateDto, oldRecords, options);
    const newRecords = await this.repository.save(
      oldRecords.map(
        (record) => {
          const { updateTimestamp: _, ...recordData } = record;
          return {
            ...recordData,
            ...doc,
          } as DeepPartial<Entity>;
        },
        { reload: true }
      )
    );
    return this.postUpdate(newRecords, oldRecords, updateDto, options);
  }

  async softDelete(
    /**
     * The ID of the user who perform the delete operation
     */
    userId: string,
    options?: FindManyOptions<Entity>
  ) {
    await this.preSoftDelete(userId, options);
    const deletedRecords = await this.update(
      userId,
      {
        updateUserId: userId,
        deleteTimestamp: new Date(),
        deleteUserId: userId,
      } as DeepPartial<Entity>,
      options
    );
    return this.postSoftDelete(deletedRecords, options);
  }

  async restore(userId: string, options?: FindManyOptions<Entity>) {
    await this.preRestore(userId, options);
    const deletedRecords = await this.update(
      userId,
      {
        updateUserId: userId,
        deleteTimestamp: null,
        deleteUserId: null,
      } as DeepPartial<Entity>,
      options
    );
    return this.postRestore(deletedRecords, options);
  }

  /* ---------- Pre-processing functions ---------- */

  protected async preFind(
    options: CustomFindManyOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User
  ): Promise<CustomFindManyOptions<Entity>> {
    // TODO: Add WHERE, ORDER, LIMIT, OFFSET clause
    const { skip, take } = this.getPaginationProps(options);
    const order = this.getOrderProps(options);
    const where = this.getFilterProps(options);

    return {
      ...options,
      where,
      skip,
      take,
      order,
    };
  }

  protected async preFindOne(
    options: FindOneOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User
  ): Promise<FindOneOptions<Entity>> {
    return options;
  }

  protected async preCount(
    options: CustomFindManyOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User
  ): Promise<CustomFindManyOptions<Entity>> {
    const where = this.getFilterProps(options);
    return {
      ...options,
      where,
    };
  }

  protected async preCreateOne(userId: string, createDto: any): Promise<DeepPartial<Entity>> {
    return {
      ...createDto,
      createUserId: userId,
      updateUserId: userId,
    };
  }

  protected async preCreate(userId: string, createDtos: any[]): Promise<DeepPartial<Entity>[]> {
    return createDtos.map((dto) => ({
      ...dto,
      createUserId: userId,
      updateUserId: userId,
    }));
  }

  protected async preUpdate(
    userId: string,
    updateDto: any,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _oldRecords: Entity[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options?: FindManyOptions<Entity>
  ): Promise<QueryDeepPartialEntity<Entity>> {
    return {
      ...updateDto,
      updateUserId: userId,
    };
  }

  protected async preSoftDelete(
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _userId: string,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options?: FindManyOptions<Entity>
  ) {}

  protected async preRestore(
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _userId: string,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options?: FindManyOptions<Entity>
  ) {}

  /* ---------- Post-processing functions ---------- */

  protected async postFind(
    data: Entity[],
    options: CustomFindManyOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User
  ) {
    const { filters } = options;
    const { page: _, pageSize: __, order, ...filterKeys } = filters ?? {};

    return {
      data,
      metadata: {
        pagination: await this.getPaginationResponse(options),
        filters: filterKeys,
        order: (order ?? []).map((orderVal) => {
          const [field, direction] = orderVal.split(':');
          return { field, direction };
        }),
      },
    };
  }

  protected async postFindOne(
    data: Entity | null,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options: FindOneOptions<Entity>,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _currentUser?: User
  ) {
    return data;
  }

  protected async postCreateOne(
    record: Entity,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _createDto: any
  ) {
    return record;
  }

  protected postCreate(
    records: Entity[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _createDtos: any[]
  ) {
    return records;
  }

  protected async postUpdate(
    newRecords: Entity[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _oldRecords: Entity[],
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _updateDto: any,
    /**
     * This arg is not used in the base class,
     * but can be used in derived class
     */
    _options?: FindManyOptions<Entity>
  ) {
    return newRecords;
  }

  protected async postSoftDelete(deletedRecords: Entity[], _options?: FindManyOptions<Entity>) {
    return deletedRecords;
  }

  protected async postRestore(restoredRecords: Entity[], _options?: FindManyOptions<Entity>) {
    return restoredRecords;
  }

  private getPaginationProps(options: CustomFindManyOptions<Entity>) {
    const { filters } = options;
    const page = filters?.page || 1;
    const take = filters?.pageSize || 10;
    const skip = (page - 1) * take;
    return {
      take,
      skip,
    };
  }

  private getOrderProps(
    options: CustomFindManyOptions<Entity>
  ): FindOptionsOrder<Entity> | undefined {
    const { filters, order } = options;

    if (filters?.order) {
      return {
        ...order,
        ...Object.fromEntries(filters.order.map((o) => o.split(':'))),
      };
    }

    return order;
  }

  private getFilterProps(
    options: CustomFindManyOptions<Entity>
  ): FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[] | undefined {
    const { filters, where } = options;

    const { page: _, pageSize: __, order: ___, ...filterKeys } = filters ?? {};
    const additionalWhere = Object.fromEntries(
      Object.entries(filterKeys).map(([key, value]) => [
        key,
        Raw((alias) => `LOWER(CAST("${alias}" AS TEXT)) LIKE '%${String(value).toLowerCase()}%'`),
      ])
    ) as FindOptionsWhere<Entity>;

    if (Array.isArray(where)) {
      return [...where, additionalWhere];
    }

    return {
      ...where,
      ...additionalWhere,
    };
  }

  private async getPaginationResponse(
    options: CustomFindManyOptions<Entity>
  ): Promise<PaginationDto> {
    const { filters } = options;
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 10;
    try {
      const { take: _, skip: __, ...opts } = options;
      const total = await this.count(opts);
      const totalPage = Math.ceil(total / pageSize);

      return {
        currentPage: page,
        pageSize,
        total,
        totalPage,
        hasNextPage: page < totalPage,
        hasPreviousPage: page > 1,
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException((e as Error).message);
    }
  }
}
