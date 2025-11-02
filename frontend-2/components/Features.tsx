

import React from 'react';
import { SchoolIcon } from './icons/SchoolIcon';
import { ChatBotIcon } from './icons/ChatBotIcon';
import { useTranslations } from '../lib/i18n';

const Features: React.FC = () => {
  const { t, language } = useTranslations();

  const features = [
    {
      key: 'in-person-classes',
      name: t('feature1Name'),
      description: t('feature1Desc'),
      icon: SchoolIcon,
    },
    {
      key: 'sevy-ai',
      name: t('feature2Name'),
      description: t('feature2Desc'),
      icon: ChatBotIcon,
    },
  ]

  return (
    <div id="our-approach" className="py-24 sm:py-32 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Approach Section */}
        <div>
            <div className="mx-auto max-w-4xl lg:text-center">
            <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold leading-7 text-sevy-pink">{t('ourApproach')}</h2>
            <p className={`mt-2 text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
                {t('comprehensiveEducation')}
            </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16 lg:gap-x-24">
                {features.map((feature) => (
                <div key={feature.key} className="relative pl-16 group">
                    <dt className="text-xl sm:text-2xl xl:text-3xl font-semibold leading-7 text-sevy-text">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sevy-pink to-sevy-blue">
                        <feature.icon className={`h-6 w-6 text-white transition-transform duration-300 ease-in-out ${
                          feature.key === 'in-person-classes'
                            ? 'group-hover:scale-110 group-hover:-rotate-3'
                            : 'group-hover:scale-110 group-hover:rotate-3'
                        }`} aria-hidden="true" />
                    </div>
                    {feature.name}
                    </dt>
                    <dd className="mt-2 text-xl sm:text-2xl xl:text-3xl leading-7 text-sevy-text-secondary">{feature.description}</dd>
                </div>
                ))}
            </dl>
            </div>
        </div>

        {/* Vision Section */}
        <div className="mx-auto mt-24 max-w-4xl text-center sm:mt-32">
          <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold leading-7 text-sevy-blue">{t('ourVision')}</h2>
          <p className={`mt-2 text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
            {t('fundamentalRight')}
          </p>
          <p className="mt-6 text-xl sm:text-2xl xl:text-3xl leading-8 text-sevy-text-secondary">
            {t('visionParagraph')}
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default Features;