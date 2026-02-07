import { render } from '../../core/Block';
import { Avatar } from '../../components/Avatar';
import { profileData } from './profileMockData';
import '../../assets/scss/collect.scss';
import './index.scss';

function renderProfileField(label: string, value: string): string {
  return `
    <div class="profile__row">
      <div class="profile__row-label">${label}</div>
      <div class="profile__row-value">${value}</div>
    </div>
  `;
}

const avatar = new Avatar({
  src: profileData.avatar,
  alt: `Аватар пользователя ${profileData.displayName}`,
  size: 'large',
  editable: true,
  onChange: (file) => {
    console.log('Выбран файл для аватара:', file.name);
  },
});

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.app');
  if (!app) return;

  const fieldsHtml = profileData.fields.map(f => renderProfileField(f.label, f.value)).join('');

  app.innerHTML = `
    <section class="profile">
      <aside class="profile__sidebar">
        <a href="../chat/index.html" class="profile__back-button">←</a>
      </aside>

      <main class="profile__content">
        <header class="profile__avatar-block">
          <div class="profile__avatar-container"></div>
          <div class="profile__name">${profileData.displayName}</div>
        </header>

        <section class="profile__info">
          ${fieldsHtml}
        </section>

        <footer class="profile__actions">
          <a href="./edit.html" class="profile__action-link">Изменить данные</a>
          <a href="./password.html" class="profile__action-link">Изменить пароль</a>
          <button class="profile__logout" type="button">Выйти</button>
        </footer>
      </main>
    </section>
  `;

  render('.profile__avatar-container', avatar);
});
