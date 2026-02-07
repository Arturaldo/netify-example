/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    // Порядок свойств (опционально, но полезно)
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,

    // Именование классов в kebab-case (можно отключить если используете BEM)
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message: 'Class names should follow BEM convention (block__element--modifier)',
      },
    ],

    // SCSS специфичные правила
    'scss/at-rule-no-unknown': true,
    'scss/dollar-variable-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',

    // Отключаем некоторые строгие правила
    'no-descending-specificity': null, // Иногда нужен каскад
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'], // Для CSS Modules
      },
    ],
  },
  ignoreFiles: ['node_modules/**', 'dist/**'],
};
