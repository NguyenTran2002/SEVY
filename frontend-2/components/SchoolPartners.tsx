

import React from 'react';
import { useTranslations } from '../lib/i18n';

const SchoolPartners: React.FC = () => {
  const { t, language } = useTranslations();
  
  // ===================================================================
  // !!! WARNING: DEVELOPMENT ONLY !!!
  // ===================================================================
  // This API key is hardcoded for development and demonstration purposes.
  // It is VISIBLE in the client-side code and is NOT secure.
  // Before deploying to production, this key MUST be removed and
  // replaced with a secure method of handling API keys, such as
  // using environment variables on a server-side proxy or a cloud function.
  // Leaking this key in production can lead to unauthorized use and
  // significant charges on your Google Cloud account.
  // ===================================================================
  const apiKey = 'AIzaSyCSg6r1MsZAJOCbBSQrKfSNUk5MQ9POIAU';

  const partners = [
    {
      key: 'dao-tu',
      name: t('school1Name'),
      address: t('school1Address'),
      // Using the Vietnamese name and location for a more precise map query.
      embedQuery: 'Trường THCS Đạo Tú, Tam Dương, Vĩnh Phúc, Vietnam',
      since: 2025,
    },
    {
      key: 'huong-dao',
      name: t('school2Name'),
      address: t('school2Address'),
      embedQuery: 'Trường THCS Hướng Đạo, Tam Dương, Vĩnh Phúc, Vietnam',
      since: 2024,
    },
  ];

  // Sort partners by the 'since' year, oldest partnership first
  partners.sort((a, b) => a.since - b.since);

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl lg:text-center">
          <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold leading-7 text-sevy-blue">{t('schoolPartnersSubtitle')}</h2>
          <p className={`mt-2 text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
            {t('schoolPartnersTitle')}
          </p>
          <p className="mt-6 text-xl sm:text-2xl xl:text-3xl leading-8 text-sevy-text-secondary whitespace-pre-wrap">
            {t('schoolPartnersParagraph')}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-2 lg:gap-x-16">
            {partners.map((partner) => {
              const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(partner.embedQuery)}`;
              return (
                <div key={partner.key} className="flex flex-col bg-white/90 p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div>
                    <h3 className="text-2xl sm:text-3xl xl:text-4xl font-semibold text-sevy-text">{partner.name}</h3>
                    <p className="mt-1 text-lg sm:text-xl xl:text-2xl text-sevy-text-secondary">{partner.address}</p>
                    <p className="mt-2 text-lg sm:text-xl xl:text-2xl font-semibold text-sevy-blue">{t('schoolPartnerSince')} {partner.since}</p>
                  </div>
                  
                  <div className="mt-4 h-80 rounded-lg overflow-hidden shadow-inner border border-gray-200/80">
                    <iframe
                      title={`${partner.name} Map`}
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SchoolPartners;