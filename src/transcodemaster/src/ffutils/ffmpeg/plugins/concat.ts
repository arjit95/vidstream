import { Plugin } from './plugin';

export class Concat extends Plugin {
  metadata: string;

  constructor(metadata: string) {
    super();
    this.metadata = metadata;
  }

  getCommand() {
    return `-f concat -safe 0 -i ${this.metadata} -c copy`;
  }
}
