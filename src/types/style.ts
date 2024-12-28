export type Unit = "px" | "em";
export type UnitProp = `${number}${Unit}` | 0;
export type SpacingProp =
  | UnitProp
  | `${UnitProp} ${UnitProp}`
  | `${UnitProp} ${UnitProp} ${UnitProp}`
  | `${UnitProp} ${UnitProp} ${UnitProp} ${UnitProp}`;
