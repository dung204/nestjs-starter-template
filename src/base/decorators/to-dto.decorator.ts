import { Type } from '@nestjs/common';

export function ToDTO<Dto extends Type>(dto: Dto): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata('ToDTO', [target, dto], target);
  };
}
