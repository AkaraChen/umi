import { yParser } from '@umijs/utils';
import kleur from 'kleur';
import { join } from 'path';
import { Checker } from './checker';
import { event, getLogStatistics, ready } from './logger';
import { prepare } from './prepare';
import { Runner as ConfigRunner } from './runner/config';
import { Runner as EslintRunner } from './runner/eslintrc';
import { Runner as JavaScriptRunner } from './runner/javascript';
import { Runner as PackageJSONRunner } from './runner/packageJSON';
import { Context } from './types';

export default async () => {
  const args = yParser(process.argv);
  const cwd = args.cwd ? join(process.cwd(), args.cwd) : process.cwd();

  event(kleur.magenta('Prepare...'));

  const context: Context = await prepare({
    cwd,
    pattern: 'src/**/*.{js,jsx,ts,tsx}',
    args,
  });

  event(kleur.magenta('Check project validate...'));
  await new Checker({ cwd, context }).run();
  ready('Validated.');

  event(kleur.magenta('Modify config...'));
  new ConfigRunner({ cwd, context }).run();

  event(kleur.magenta('Modify eslintrc...'));
  new EslintRunner({ cwd, context }).run();

  event(kleur.magenta('Modify js files...'));
  new JavaScriptRunner({ cwd, context }).run();

  // event(kleur.magenta('Modify css files...'));
  // new CSSRunner({ cwd, context }).run();

  // After js files modified, we may need to modify package.json
  event(kleur.magenta('Modify package.json...'));
  new PackageJSONRunner({ cwd, context }).run();
  event(kleur.magenta('logStatistics...'));
  const warnInfo = kleur.yellow(`warn: ${getLogStatistics().warn.length}`);
  const tips = `${
    getLogStatistics().warn.length !== 0
      ? `\n${getLogStatistics().warn.join('\n')}\n请处理警告信息在运行`
      : ''
  }`;
  const logStatistics = `${warnInfo + tips}`;
  console.log(logStatistics);

  // TODOS: 清除 .umi-* 缓存文件
  // TODOS: 清除 node_modules
};
