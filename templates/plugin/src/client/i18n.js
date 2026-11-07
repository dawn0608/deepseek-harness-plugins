/** Client dictionaries and the locale-service binding for the plugin UI. */

export const NS = 'example';

export const DICTS = {
  zh: {
    pill: '示例 {count}',
    title: '示例插件',
  },
};

DICTS.en = {
  pill: 'Example {count}',
  title: 'Example plugin',
};

/** Interpolate `{name}` placeholders without depending on the locale service. */
export function format(template, params) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) =>
    params && Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match);
}

/** Register both dictionaries under the plugin namespace; safe when locale is unavailable. */
export function registerLocale(ctx) {
  return ctx.effect(() => {
    try {
      return ctx.locale.register(NS, DICTS);
    } catch (error) {
      return () => {};
    }
  }, 'example: dictionaries');
}

/** Resolve the active language through the locale service, falling back to English. */
export function createTranslator(ctx) {
  let bound;
  try {
    bound = ctx.locale.bind(NS);
  } catch (error) {
    bound = null;
  }
  const fallback = () => {
    let active = 'en';
    try {
      active = ctx.locale.getSnapshot().active || 'en';
    } catch (error) {
      active = 'en';
    }
    return String(active).toLowerCase().startsWith('zh') ? DICTS.zh : DICTS.en;
  };
  return (key, params) => {
    let text;
    if (bound !== null) {
      try {
        text = bound(key, params);
      } catch (error) {
        text = undefined;
      }
    }
    if (typeof text !== 'string' || text === key) {
      const dict = fallback();
      text = format(dict[key] !== undefined ? dict[key] : DICTS.en[key], params);
    }
    return text;
  };
}
