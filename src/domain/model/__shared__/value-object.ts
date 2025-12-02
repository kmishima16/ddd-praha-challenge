export abstract class ValueObject<T extends Record<string, unknown>> {
  public readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze({ ...props }); // 不変性の確保
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
