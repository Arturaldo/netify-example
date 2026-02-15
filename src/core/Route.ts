import { Block } from './Block';

export class Route {
  private _pathname: string;
  private _blockClass: new () => Block;
  private _block: Block | null;
  private _props: { rootQuery: string };

  constructor(pathname: string, view: new () => Block, props: { rootQuery: string }) {
    this._pathname = pathname;
    this._blockClass = view;
    this._block = null;
    this._props = props;
  }

  match(pathname: string): boolean {
    return pathname === this._pathname;
  }

  render(): void {
    this._block = new this._blockClass();
    const root = document.querySelector(this._props.rootQuery);

    if (root) {
      root.innerHTML = '';
      const content = this._block.getContent();
      if (content) {
        root.appendChild(content);
      }
      this._block.dispatchComponentDidMount();
    }
  }

  leave(): void {
    if (this._block) {
      this._block.hide();
    }
  }

  get pathname(): string {
    return this._pathname;
  }
}
