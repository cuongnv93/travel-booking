import { getRequestConfig } from 'next-intl/server';
import { LOCALES, DEFAULT_LOCALE } from './lib/constants';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !(LOCALES as readonly string[]).includes(locale)) {
    locale = DEFAULT_LOCALE;
  }

  let messages;
  try {
    messages = (await import(`./messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`./messages/${DEFAULT_LOCALE}.json`)).default;
  }

  return {
    locale,
    messages
  };
});
