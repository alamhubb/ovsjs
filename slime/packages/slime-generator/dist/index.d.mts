import "slime-ast/src/SlimeESTree.ts";
import "subhuti/src/struct/SubhutiMatchToken.ts";

//#region src/SlimeCodeMapping.d.ts
declare class SlimeCodeLocation {
  type: string;
  line: number;
  value: string;
  column: number;
  length: number;
  index: number;
}
declare class SlimeCodeMapping {
  source: SlimeCodeLocation;
  generate: SlimeCodeLocation;
}
interface SlimeGeneratorResult {
  code: string;
  mapping: SlimeCodeMapping[];
}
//#endregion
export { SlimeCodeLocation, SlimeGeneratorResult };