import { Plugin } from './plugin';

export class Splitter extends Plugin {
  start: number;
  end: number;

  constructor(start: number, end: number) {
    super();
    this.start = start;
    this.end = end;
  }

  getCommand() {
    return `-ss ${this.start} -to ${this.end}`;
  }
}

export class SplitterWrapper {
  splitDuration: number;
  totalDuration: number;

  constructor(splitDuration: number, totalDuration: number) {
    this.splitDuration = splitDuration;
    this.totalDuration = totalDuration;
  }

  getTotalParts(): number {
    const remainder = this.totalDuration % this.splitDuration;
    if (remainder < 0.5) {
      return Math.floor(this.totalDuration / this.splitDuration);
    }

    return Math.ceil(this.totalDuration / this.splitDuration);
  }

  getPartAtIndex(idx: number): Splitter {
    const total = this.getTotalParts();
    const start = this.splitDuration * idx;
    let end = start + this.splitDuration;

    if (total === idx + 1) {
      const remaining = this.totalDuration % this.splitDuration;

      if (end > this.totalDuration) {
        end = start + remaining;
      } else if (end < this.totalDuration) {
        end += remaining;
      }
    }

    return new Splitter(start, end);
  }
}
