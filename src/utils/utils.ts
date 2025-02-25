/* eslint-disable */
export function invariant(condition: boolean, errClass: any): void;
export function invariant(condition: boolean, errClass: any, opts?: any): void;
export function invariant(condition: boolean, errClass: any, opts?: any): void {
  if (!condition) {
    if (opts) {
      throw new errClass(opts);
    } else {
      throw new errClass();
    }
  }
}
