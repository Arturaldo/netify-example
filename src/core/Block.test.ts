import { describe, it, expect } from 'vitest';
import { Block, BlockProps } from './Block';

interface TextBlockProps extends BlockProps {
  text?: string;
}

class TextBlock extends Block<TextBlockProps> {
  constructor(props: TextBlockProps = {}) {
    super('div', props);
  }

  protected render(): string {
    return `<p>${this.props.text ?? ''}</p>`;
  }
}

interface CounterBlockProps extends BlockProps {
  count?: number;
}

class CounterBlock extends Block<CounterBlockProps> {
  constructor(props: CounterBlockProps = {}) {
    super('span', props);
  }

  protected render(): string {
    return `${this.props.count ?? 0}`;
  }
}

interface TemplateBlockProps extends BlockProps {
  message?: string;
  username?: string;
}

class TemplateBlock extends Block<TemplateBlockProps> {
  constructor(props: TemplateBlockProps = {}) {
    super('section', props);
  }

  protected render(): DocumentFragment {
    return this.compile(
      '<div class="msg"><span>{{message}}</span><b>{{username}}</b></div>',
      { message: this.props.message, username: this.props.username },
    );
  }
}

describe('Block', () => {
  describe('Конструктор', () => {
    it('создаёт DOM-элемент с указанным тегом', () => {
      const block = new TextBlock();
      expect(block.getContent()?.tagName.toLowerCase()).toBe('div');
    });

    it('создаёт элемент <span> при указании тега span', () => {
      const counter = new CounterBlock({ count: 0 });
      expect(counter.getContent()?.tagName.toLowerCase()).toBe('span');
    });

    it('getContent() возвращает HTMLElement', () => {
      const block = new TextBlock({ text: 'hi' });
      expect(block.getContent()).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Props & рендер', () => {
    it('отражает переданный prop в рендере', () => {
      const block = new TextBlock({ text: 'hello' });
      expect(block.getContent()?.innerHTML).toContain('hello');
    });

    it('setProps() обновляет рендер', () => {
      const block = new CounterBlock({ count: 0 });
      block.setProps({ count: 5 });
      expect(block.getContent()?.innerHTML).toContain('5');
    });

    it('setProps() не падает при передаче undefined', () => {
      const block = new TextBlock({ text: 'a' });
      expect(() =>
        block.setProps(undefined as unknown as Partial<TextBlockProps>),
      ).not.toThrow();
    });

    it('innerHTML обновляется после setProps()', () => {
      const block = new TextBlock({ text: 'before' });
      block.setProps({ text: 'after' });
      expect(block.getContent()?.innerHTML).toContain('after');
      expect(block.getContent()?.innerHTML).not.toContain('before');
    });
  });

  describe('show() / hide()', () => {
    it('show() устанавливает display: block', () => {
      const block = new TextBlock();
      block.hide();
      block.show();
      expect(block.getContent()?.style.display).toBe('block');
    });

    it('hide() устанавливает display: none', () => {
      const block = new TextBlock();
      block.hide();
      expect(block.getContent()?.style.display).toBe('none');
    });
  });

  describe('События', () => {
    it('привязывает обработчик click к элементу', () => {
      let clicked = false;
      const block = new TextBlock({
        text: 'btn',
        events: {
          click: () => {
            clicked = true;
          },
        },
      });
      block.getContent()?.dispatchEvent(new MouseEvent('click'));
      expect(clicked).toBe(true);
    });

    it('обработчик вызывается с объектом события', () => {
      let received: Event | null = null;
      const block = new TextBlock({
        text: 'btn',
        events: {
          click: (e: Event) => {
            received = e;
          },
        },
      });
      block.getContent()?.dispatchEvent(new MouseEvent('click'));
      expect(received).toBeInstanceOf(MouseEvent);
    });

    it('после re-render обработчик не накапливается', () => {
      let count = 0;
      const block = new TextBlock({
        text: 'a',
        events: { click: () => count++ },
      });
      block.setProps({ text: 'b' });
      block.getContent()?.dispatchEvent(new MouseEvent('click'));
      expect(count).toBe(1);
    });
  });

  describe('Proxy защита props', () => {
    it('удаление prop бросает ошибку', () => {
      const block = new TextBlock({ text: 'x' });
      const props = (block as unknown as { props: Record<string, unknown> }).props;
      expect(() => {
        delete props['text'];
      }).toThrow('Нет доступа');
    });
  });
});

describe('Шаблонизатор (Handlebars)', () => {
  describe('compile()', () => {
    it('подставляет переменные в шаблон', () => {
      const block = new TemplateBlock({ message: 'Привет', username: 'Иван' });
      const html = block.getContent()?.innerHTML;
      expect(html).toContain('Привет');
      expect(html).toContain('Иван');
    });

    it('не падает при отсутствующих переменных', () => {
      const block = new TemplateBlock({});
      expect(block.getContent()?.querySelector('.msg')).not.toBeNull();
    });

    it('обновляет шаблон при изменении props', () => {
      const block = new TemplateBlock({ message: 'old' });
      block.setProps({ message: 'new' });
      expect(block.getContent()?.innerHTML).toContain('new');
      expect(block.getContent()?.innerHTML).not.toContain('old');
    });

    it('данные в шаблоне попадают в DOM-элементы', () => {
      const block = new TemplateBlock({ message: 'test-msg' });
      const span = block.getContent()?.querySelector('span');
      expect(span?.textContent).toBe('test-msg');
    });

    it('экранирует HTML-символы', () => {
      const block = new TemplateBlock({ message: '<script>alert(1)</script>' });
      expect(block.getContent()?.innerHTML).not.toContain('<script>');
    });
  });

  describe('Дочерние компоненты', () => {
    it('встраивает дочерний Block в шаблон родителя', () => {
      interface ParentProps extends BlockProps {
        child?: Block;
      }

      class ParentBlock extends Block<ParentProps> {
        constructor(props: ParentProps) {
          super('div', props);
        }

        protected render(): DocumentFragment {
          return this.compile('{{{child}}}', {});
        }
      }

      const child = new TextBlock({ text: 'child-content' });
      const parent = new ParentBlock({ child });
      expect(parent.getContent()?.innerHTML).toContain('child-content');
    });
  });
});
