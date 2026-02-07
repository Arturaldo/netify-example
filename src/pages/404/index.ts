import '../../assets/scss/collect.scss';
import './index.scss';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.app');
  if (!app) return;

  app.innerHTML = `
    <main class="error-page">
      <h1 class="error-page__code">404</h1>
      <p class="error-page__text">Не туда попали</p>
      <a href="../chat/index.html" class="error-page__link">Назад к чатам</a>
    </main>
  `;
});
