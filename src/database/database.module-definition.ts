import { ConfigurableModuleBuilder } from '@nestjs/common';
import { DatabaseOptions } from './database-options';

export const DATABASE_TOKEN_TEMPL = 'DATABASE_TOKEN_TEMPL';

export const {
  ConfigurableModuleClass: ConfigurableDatabaseModule,
  MODULE_OPTIONS_TOKEN: DATABASE_OPTIONS,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<DatabaseOptions>()
  .setClassMethodName('forRoot')
  .setExtras(
    {
      dbName: 'consent',
    },
    (definition, extras) => {
      const newDef = { ...definition };
      console.log(newDef);
      console.log(extras);
      console.log('-----\n\n');
      return newDef;
    },
  )
  .build();
