import { IsString, ValidationOptions, ValidationArguments, registerDecorator } from "class-validator";

export function EndsWith(suffix: string, validationOptions?: ValidationOptions) {
    return function (object: Record<string, any>, propertyName: string) {
      registerDecorator({
        name: 'endsWith',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
          validate(value: any, args: ValidationArguments) {
            if (typeof value !== 'string') {
              return false;
            }
            
            return value.endsWith(suffix);
          },
          defaultMessage(args: ValidationArguments) {
            return `${args.property} must end with "${suffix}"`;
          },
        },
      });
    };
  }


export class fetchS3FolderContentDto {
    // @IsString()
    // bucket : string;

    @IsString()
    @EndsWith('/', { message : `key must end with /` })
    key : string;
}