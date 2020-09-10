import path from 'path';
import { Executor } from '@me/common/utils/executor';
import { Plugin } from './plugins/plugin';
import * as Plugins from './plugins';

export class FFMpeg {
  execPath: string;
  plugins: Array<Plugin>;
  splittedPlugins: Array<Array<Plugin>>;
  outputFiles: Array<string>;
  command: string;
  static Plugins: { [key: string]: Plugin };

  constructor(execPath: string) {
    this.plugins = [];
    this.outputFiles = [];
    this.execPath = execPath;
    this.command = '';
    this.splittedPlugins = [];
  }

  addPlugin(instance: Plugin) {
    if (!(instance instanceof Plugin)) {
      throw new Error('Please provide an instance of plugin');
    }

    this.plugins.push(instance);
    return this;
  }

  addSplitter(instance: Plugins.SplitterWrapper) {
    const arr = [];
    const len = instance.getTotalParts();
    const inputIdx = this.plugins.findIndex(
      plugin => plugin instanceof Plugins.Input
    );

    for (let i = 0; i < len; i++) {
      const splitterInstance = instance.getPartAtIndex(i);
      const tempArr = [...this.plugins];
      tempArr.splice(inputIdx, 0, splitterInstance);

      const outputIdx = tempArr.findIndex(
        plugin => plugin instanceof Plugins.Output
      );
      if (outputIdx < 0) {
        throw new Error('Splitter needs an output to work');
      }

      let outputPlugin: Plugins.Output = tempArr[outputIdx] as Plugins.Output;
      outputPlugin = outputPlugin.clone();

      const filePath = outputPlugin.filePath.substring(
        outputPlugin.filePath.lastIndexOf('/')
      );
      const extname = path.extname(filePath);

      const parts = outputPlugin.filePath.split('/');
      parts[parts.length - 1] =
        path.basename(filePath, extname) + `_${i}` + extname;

      outputPlugin.filePath = parts.join('/');
      this.outputFiles.push(outputPlugin.filePath);
      tempArr[outputIdx] = outputPlugin;

      arr.push(tempArr);
    }

    this.splittedPlugins = arr;
    this.plugins = this.splittedPlugins[0];
    return this;
  }

  static newBuilder(execPath: string) {
    return new FFMpeg(execPath);
  }

  _build(plugins: Array<Plugin>) {
    return plugins.reduce((acc, plugin) => {
      return acc + ' ' + plugin.getCommand();
    }, '');
  }

  build() {
    let plugins: Array<Array<Plugin>> = this.splittedPlugins.length
      ? this.splittedPlugins
      : [this.plugins];

    for (let plugin of plugins) {
      this.command += this.execPath + this._build(plugin) + '\n';
    }

    return this;
  }

  async exec() {
    if (!this.command) {
      throw new Error('Please call .build() before calling exec');
    }

    let commands = this.command.split('\n').filter(c => !!c);
    for (let command of commands) {
      await Executor.exec(command);
    }
  }
}
