export enum SubhutiCreateTokenGroupType {
  skip = 'skip'
}

export class SubhutiCreateToken {
  name: string;
  pattern?: RegExp;
  isKeyword?: boolean;
  group?: string;
  value?: string;
  categories?: any;

  constructor(ovsToken: SubhutiCreateToken) {
    this.name = ovsToken.name;
    this.pattern = ovsToken.pattern
    if (ovsToken.value) {
      this.value = ovsToken.value
    } else {
      this.value = emptyValue
    }
    this.isKeyword = false;
    this.group = ovsToken.group;
  }
}

export const emptyValue = 'Error:CannotUseValue'

export function createToken(osvToken: SubhutiCreateToken) {
  return new SubhutiCreateToken(osvToken);
}

export function createKeywordToken(name: string, pattern: string): SubhutiCreateToken {
  const token = new SubhutiCreateToken({name: name, pattern: new RegExp(pattern), value: pattern});
  token.isKeyword = true;
  return token;
}

export function createRegToken(name: string, pattern: RegExp) {
  const token = new SubhutiCreateToken({name: name, pattern: pattern, value: pattern.source});
  return token;
}

export function createValueRegToken(name: string, pattern: RegExp, value: string, group?: string) {
  const token = new SubhutiCreateToken({name: name, pattern: pattern, value: value, group: group});
  return token;
}

export function createEmptyValueRegToken(name: string, pattern: RegExp) {
  const token = new SubhutiCreateToken({name: name, pattern: pattern});
  return token;
}
