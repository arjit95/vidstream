import { Plugin } from './plugin';

export class Output extends Plugin {
  filePath: string;

  constructor(filePath: string) {
    super();
    this.filePath = filePath;
  }

  getCommand() {
    return `"${this.filePath}"`;
  }

  clone() {
    return new Output(this.filePath);
  }
}

module.exports = Output;
