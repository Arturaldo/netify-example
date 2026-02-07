import Handlebars from 'handlebars';
import { EventBus } from './EventBus';

export type BlockEvent = MouseEvent | KeyboardEvent | FocusEvent | InputEvent | SubmitEvent | Event;

export interface BlockProps {
  [key: string]: unknown;
  events?: Record<string, (e: BlockEvent) => void>;
}

export type BlockChildren = Record<string, Block | Block[]>;

export abstract class Block<P extends BlockProps = BlockProps> {
  static EVENTS = {
    INIT: 'init',
    FLOW_CDM: 'flow:component-did-mount',
    FLOW_CDU: 'flow:component-did-update',
    FLOW_RENDER: 'flow:render',
  } as const;

  private _element: HTMLElement | null = null;
  private _meta: { tagName: string; props: P };

  protected props: P;
  protected children: BlockChildren;
  private _eventBus: EventBus;

  constructor(tagName: string = 'div', propsWithChildren: P & { children?: BlockChildren } = {} as P) {
    this._eventBus = new EventBus();

    const { children, ...props } = this._getChildrenAndProps(propsWithChildren);

    this._meta = {
      tagName,
      props: props as unknown as P,
    };

    this.children = children;
    this.props = this._makePropsProxy(props as unknown as P);

    this._registerEvents(this._eventBus);
    this._eventBus.emit(Block.EVENTS.INIT);
  }

  protected eventBus(): EventBus {
    return this._eventBus;
  }

  private _getChildrenAndProps(propsWithChildren: P & { children?: BlockChildren }): { children: BlockChildren } & P {
    const children: BlockChildren = {};
    const props: Record<string, unknown> = {};

    Object.entries(propsWithChildren).forEach(([key, value]) => {
      if (value instanceof Block) {
        children[key] = value;
      } else if (Array.isArray(value) && value.every((v) => v instanceof Block)) {
        children[key] = value;
      } else {
        props[key] = value;
      }
    });

    return { children, ...props } as { children: BlockChildren } & P;
  }

  private _registerEvents(eventBus: EventBus): void {
    eventBus.on(Block.EVENTS.INIT, this._init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this));
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  private _createResources(): void {
    const { tagName } = this._meta;
    this._element = document.createElement(tagName);
  }

  private _init(): void {
    this._createResources();
    this.init();
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  protected init(): void {}

  private _componentDidMount(): void {
    this.componentDidMount();

    Object.values(this.children).forEach((child) => {
      if (Array.isArray(child)) {
        child.forEach((c) => c.dispatchComponentDidMount());
      } else {
        child.dispatchComponentDidMount();
      }
    });
  }

  protected componentDidMount(): void {}

  public dispatchComponentDidMount(): void {
    this.eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  private _componentDidUpdate(oldProps: P, newProps: P): void {
    const response = this.componentDidUpdate(oldProps, newProps);
    if (!response) {
      return;
    }
    this._render();
  }

  protected componentDidUpdate(_oldProps: P, _newProps: P): boolean {
    return true;
  }

  public setProps = (nextProps: Partial<P>): void => {
    if (!nextProps) {
      return;
    }

    Object.assign(this.props, nextProps);
  };

  public get element(): HTMLElement | null {
    return this._element;
  }

  private _render(): void {
    const block = this.render();

    this._removeEvents();

    if (this._element) {
      this._element.innerHTML = '';

      if (typeof block === 'string') {
        this._element.innerHTML = block;
      } else if (block instanceof DocumentFragment) {
        this._element.appendChild(block);
      } else if (block instanceof HTMLElement) {
        this._element.appendChild(block);
      }
    }

    this._addEvents();
  }

  protected compile(template: string, context: Record<string, unknown> = {}): DocumentFragment {
    const propsAndStubs: Record<string, unknown> = { ...context };

    Object.entries(this.children).forEach(([key, child]) => {
      if (Array.isArray(child)) {
        propsAndStubs[key] = child
          .map((c) => `<div data-id="${c._id}"></div>`)
          .join('');
      } else {
        propsAndStubs[key] = `<div data-id="${child._id}"></div>`;
      }
    });

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate(propsAndStubs);

    const fragment = document.createElement('template');
    fragment.innerHTML = html;

    Object.values(this.children).forEach((child) => {
      if (Array.isArray(child)) {
        child.forEach((c) => {
          const stub = fragment.content.querySelector(`[data-id="${c._id}"]`);
          if (stub && c.getContent()) {
            stub.replaceWith(c.getContent()!);
          }
        });
      } else {
        const stub = fragment.content.querySelector(`[data-id="${child._id}"]`);
        if (stub && child.getContent()) {
          stub.replaceWith(child.getContent()!);
        }
      }
    });

    return fragment.content;
  }

  private _id = Math.random().toString(36).substring(2, 9);

  protected abstract render(): string | HTMLElement | DocumentFragment;

  private _addEvents(): void {
    const { events = {} } = this.props;

    Object.keys(events).forEach((eventName) => {
      this._element?.addEventListener(eventName, events[eventName]);
    });
  }

  private _removeEvents(): void {
    const { events = {} } = this.props;

    Object.keys(events).forEach((eventName) => {
      this._element?.removeEventListener(eventName, events[eventName]);
    });
  }

  public getContent(): HTMLElement | null {
    return this.element;
  }

  private _makePropsProxy(props: P): P {
    return new Proxy(props, {
      get: (target, prop: string): unknown => {
        const value = target[prop as keyof P];
        return typeof value === 'function' ? value.bind(target) : value;
      },
      set: (target, prop: string, value: unknown): boolean => {
        const oldTarget = { ...target };
        (target as Record<string, unknown>)[prop] = value;

        this._eventBus.emit(Block.EVENTS.FLOW_CDU, oldTarget, target);
        return true;
      },
      deleteProperty: (): never => {
        throw new Error('Нет доступа');
      },
    });
  }

  public show(): void {
    const content = this.getContent();
    if (content) {
      content.style.display = 'block';
    }
  }

  public hide(): void {
    const content = this.getContent();
    if (content) {
      content.style.display = 'none';
    }
  }
}

export function render(query: string, block: Block): HTMLElement | null {
  const root = document.querySelector<HTMLElement>(query);
  if (root && block.getContent()) {
    root.appendChild(block.getContent()!);
    block.dispatchComponentDidMount();
  }
  return root;
}
