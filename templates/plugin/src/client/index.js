/** Client half: compose the UI and register it on a slot. */
import * as React from 'react';
import { createTranslator, registerLocale } from './i18n.js';
import css from './style.css';

const h = React.createElement;

function createEntry(translate) {
  function ExampleEntry() {
    return h('span', { className: 'dshex_anchor', title: translate('title') }, translate('pill', { count: 1 }));
  }
  ExampleEntry.displayName = 'ExampleEntry';
  return ExampleEntry;
}

export const inject = ['slots', 'locale'];

export function apply(ctx) {
  registerLocale(ctx);

  ctx.effect(() => {
    const tag = document.createElement('style');
    tag.dataset.plugin = '@dawn0608/dsh-example';
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  }, 'example: styles');

  const translate = createTranslator(ctx);
  const Entry = createEntry(translate);

  ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
    name: 'conversation.composer.dock',
    id: 'example',
    order: 10,
  }, Entry));
}
