

import React from 'react';
import { useTranslations } from '../lib/i18n';
import { MailIcon } from './icons/MailIcon';
import { FacebookIcon } from './icons/FacebookIcon';

const Contact: React.FC = () => {
  const { t, language } = useTranslations();

  const contactLinks = [
    {
      key: 'email',
      name: t('email'),
      value: 'director@sevyai.com',
      href: 'mailto:director@sevyai.com',
      icon: MailIcon,
    },
    {
      key: 'facebook',
      name: t('facebook'),
      value: 'facebook.com/sevynonprofit',
      href: 'https://facebook.com/sevynonprofit',
      icon: FacebookIcon,
    },
  ];

  return (
    <div id="contact" className="py-24 sm:py-32 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl lg:text-center">
          <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold leading-7 text-sevy-blue">{t('contactSubtitle')}</h2>
          <p className={`mt-2 text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
            {t('contactTitle')}
          </p>
          <p className="mt-6 text-xl sm:text-2xl xl:text-3xl leading-8 text-sevy-text-secondary">
            {t('contactParagraph')}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl">
          <dl className="grid grid-cols-1 justify-items-start gap-y-12 sm:grid-cols-2 sm:gap-x-24 sm:justify-items-stretch">
            {contactLinks.map((link) => (
              <div key={link.key} className="flex items-start gap-x-4">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-sevy-pink to-sevy-blue">
                  <link.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <dt className="text-xl sm:text-2xl xl:text-3xl font-semibold leading-7 text-sevy-text">
                    {link.name}
                  </dt>
                  <dd className="mt-1 text-xl sm:text-2xl xl:text-3xl leading-7 text-sevy-text-secondary">
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-sevy-pink transition-colors duration-300 break-words">
                      {link.value}
                    </a>
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Contact;