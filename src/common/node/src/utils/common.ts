import Hashids from 'hashids';

const idGen = new Hashids(process.env.SECRET_ID_GEN_TOKEN);

export class Common {
  static generateUniqueId(data: string): string {
    const buffer = data.split('').map((_, idx) => data.charCodeAt(idx));
    return idGen.encode(buffer);
  }

  static decodeUniqueId(data: string): string {
    const buffer: Array<number> = idGen.decode(data) as Array<number>;
    return buffer.reduce((acc: string, val) => {
      return acc + String.fromCharCode(val);
    }, '');
  }
}
