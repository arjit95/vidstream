export class Helpers {
  static mergeCommandObj(obj: { [key: string]: string }) {
    return Object.keys(obj).reduce((acc, com) => {
      return `${acc} -${com} ${obj[com]}`;
    }, '');
  }
}
