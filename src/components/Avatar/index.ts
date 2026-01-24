import { Block, BlockProps } from '../../core/Block';

interface AvatarProps extends BlockProps {
  src?: string | null;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
  onChange?: (file: File) => void;
}

export class Avatar extends Block<AvatarProps> {
  private fileInput: HTMLInputElement | null = null;

  constructor(props: AvatarProps) {
    super('div', {
      ...props,
      events: {
        click: () => this._handleClick(),
      },
    });
  }

  protected init(): void {
    if (this.element) {
      this.element.className = `avatar avatar--${this.props.size || 'medium'}`;
      if (this.props.editable) {
        this.element.classList.add('avatar--editable');
      }
    }
  }

  private _handleClick(): void {
    if (!this.props.editable) return;

    if (!this.fileInput) {
      this.fileInput = document.createElement('input');
      this.fileInput.type = 'file';
      this.fileInput.name = 'avatar';
      this.fileInput.accept = 'image/*';
      this.fileInput.style.display = 'none';
      this.fileInput.addEventListener('change', (e) => this._handleFileChange(e));
      document.body.appendChild(this.fileInput);
    }

    this.fileInput.click();
  }

  private _handleFileChange(e: Event): void {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event): void => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          this._updateAvatar(result);

          if (this.props.onChange) {
            this.props.onChange(file);
          }
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset input для возможности выбрать тот же файл
    input.value = '';
  }

  private _updateAvatar(src: string): void {
    const imgEl = this.element?.querySelector<HTMLImageElement>('.avatar__image');
    const placeholderEl = this.element?.querySelector<HTMLElement>('.avatar__placeholder');

    if (imgEl) {
      imgEl.src = src;
      imgEl.style.display = 'block';
    } else if (this.element) {
      // Создаём img если его не было
      const img = document.createElement('img');
      img.className = 'avatar__image';
      img.src = src;
      img.alt = this.props.alt || 'Аватар';

      if (placeholderEl) {
        placeholderEl.style.display = 'none';
      }

      const wrapper = this.element.querySelector('.avatar__wrapper');
      if (wrapper) {
        wrapper.insertBefore(img, wrapper.firstChild);
      }
    }

    (this.props as { src?: string }).src = src;

    console.log('Аватар изменён');
  }

  public getSrc(): string | null {
    return this.props.src || null;
  }

  render(): string {
    const { src, alt = 'Аватар', editable } = this.props;

    const imageHtml = src
      ? `<img class="avatar__image" src="${src}" alt="${alt}">`
      : `<span class="avatar__placeholder"></span>`;

    const overlayHtml = editable
      ? `<div class="avatar__overlay">
          <span class="avatar__overlay-text">Изменить</span>
        </div>`
      : '';

    return `
      <div class="avatar__wrapper">
        ${imageHtml}
        ${overlayHtml}
      </div>
    `;
  }
}
