
import React from 'react';
import { useTranslations } from '../lib/i18n';

const OurTeam: React.FC = () => {
  const { t, language } = useTranslations();

  const teamMembers = [
    {
      name: t('teamMember1Name'),
      role: t('teamMember1Role'),
      imageUrl: 'https://storage.googleapis.com/sevyai-images/team/tran-nhat-cat-nguyen.jpg',
    },
    {
      name: t('teamMember2Name'),
      role: t('teamMember2Role'),
      imageUrl: 'https://storage.googleapis.com/sevyai-images/team/mau-thuy-lam.jpg',
    },
    {
      name: t('teamMember3Name'),
      role: t('teamMember3Role'),
      imageUrl: 'https://storage.googleapis.com/sevyai-images/team/tran-nhat-nguyen.jpg',
    },
  ];

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl lg:text-center">
          <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold leading-7 text-sevy-blue">{t('ourTeamSubtitle')}</h2>
          <p className={`mt-2 text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
            {t('ourTeamTitle')}
          </p>
          <p className="mt-6 text-xl sm:text-2xl xl:text-3xl leading-8 text-sevy-text-secondary">
            {t('ourTeamParagraph')}
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-5xl">
          <ul className="grid grid-cols-1 gap-x-12 gap-y-16 text-center sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member, index) => (
              <li key={index} className="flex flex-col items-center group">
                <div className="w-full aspect-[2/3] rounded-2xl overflow-hidden mb-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <img
                    src={member.imageUrl}
                    alt={`Portrait of ${member.name}`}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xl sm:text-2xl xl:text-3xl font-semibold leading-7 text-sevy-text whitespace-nowrap">{member.name}</h3>
                <p className="text-xl sm:text-2xl xl:text-3xl leading-7 text-sevy-pink font-semibold">{member.role}</p>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mx-auto mt-24 max-w-7xl text-center sm:mt-32">
            <h3 className={`text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
                {t('teamPhotoTitle')}
            </h3>
            <img
              src="https://storage.googleapis.com/sevyai-images/team/team-photo.jpg"
              alt={t('teamPhotoTitle')}
              className="mt-8 w-full aspect-[3/2] rounded-2xl object-cover shadow-lg"
              loading="lazy"
            />
        </div>

      </div>
    </div>
  );
};

export default OurTeam;