import '../../assets/scss/collect.scss';
import './index.scss';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('.app');
  if (!app) return;

  app.innerHTML = `
    <div class="error-page">
      <div class="error-page__code">404</div>
      <div class="error-page__text">Не туда попали</div>
      <a href="../chat/index.html" class="error-page__link">Назад к чатам</a>
    </div>
  `;
});
