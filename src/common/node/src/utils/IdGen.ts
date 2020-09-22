export class IdGen {
  private static validChars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._';
  public static SeparatorChar = '-';

  static encode(str: string, validChars: string = IdGen.validChars) {
    const charLength: bigint = BigInt(validChars.length);

    let values: number[] = str.split('').map(ch => {
      const entry = validChars.indexOf(ch);
      if (entry === -1) {
        return validChars.length + 10;
      } else if (entry < 10) {
        return validChars.length + entry;
      } else {
        return entry;
      }
    });

    let id = BigInt(values.join(''));
    let generated = '';

    while (id) {
      const idx = Number(id % charLength);
      generated += validChars[idx];
      id = id / charLength;
    }

    return generated;
  }

  static decode(str: string, validChars: string = IdGen.validChars) {
    let original = '';
    let final = 0n;
    const charLength: bigint = BigInt(validChars.length);

    for (let i = str.length - 1; i >= 0; i--) {
      const idx = validChars.indexOf(str[i]);
      final = final * charLength + BigInt(idx);
    }

    let originalId = final.toString();
    for (let i = 0; i < originalId.length; i += 2) {
      const current = parseInt(originalId[i] + originalId[i + 1]);
      if (current === validChars.length + 10) {
        // Separator
        original += IdGen.SeparatorChar;
      } else {
        original += validChars[current % validChars.length];
      }
    }

    return original;
  }
}
