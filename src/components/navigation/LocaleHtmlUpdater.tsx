'use client';

import { useEffect } from 'react';

interface LocaleHtmlUpdaterProps {
  locale: string;
  direction?: 'ltr' | 'rtl';
}

export function LocaleHtmlUpdater({
  locale,
  direction = 'ltr',
}: LocaleHtmlUpdaterProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  return null;
}

