import { Plugin } from './plugin';

export class Input extends Plugin {
  filePath: string;

  constructor(filePath: string) {
    super();
    this.filePath = filePath;
  }

  getCommand() {
    return `-i "${this.filePath}"`;
  }
}
