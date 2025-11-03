
import React, { useState, useRef } from 'react';
import { useTranslations } from '../lib/i18n';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { BrainIcon } from './icons/BrainIcon';
import { ApplicationWindowIcon } from './icons/ApplicationWindowIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { TruckIcon } from './icons/TruckIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { XIcon } from './icons/XIcon';

const Donate: React.FC = () => {
  const { t, language } = useTranslations();
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<'emailRequired' | 'invalidEmailFormat' | 'emailAlreadySubscribed' | 'subscriptionError' | 'networkError' | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // API base URL for backend communication
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

  const impacts = [
    { icon: BookOpenIcon, text: t('impact1') },
    { icon: BrainIcon, text: t('impact2') },
    { icon: SparklesIcon, text: t('impact6') },
    { icon: UserGroupIcon, text: t('impact4') },
    { icon: TruckIcon, text: t('impact5') },
    { icon: ApplicationWindowIcon, text: t('impact3') },
  ];
  
  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEmailError(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string || '').trim();

    // Client-side validation - only runs on submit
    if (!email) {
      setEmailError('emailRequired');
      setIsSubmitting(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError('invalidEmailFormat');
      setIsSubmitting(false);
      return;
    }

    try {
      // Send to backend API
      const response = await fetch(`${API_BASE_URL}/subscribe_email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success - show success modal
        setSubmittedEmail(email);
        setIsSignupModalOpen(true);
        setEmailError(null);
        formRef.current?.reset();
      } else if (result.isDuplicate) {
        // Duplicate email - use KEY not string
        setEmailError('emailAlreadySubscribed');
      } else {
        // Other error
        setEmailError('subscriptionError');
      }
    } catch (error) {
      console.error('Error subscribing email:', error);
      setEmailError('networkError');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Page Header */}
        <div className="mx-auto max-w-4xl lg:text-center">
          <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold leading-7 text-sevy-blue">{t('donateSubtitle')}</h2>
          <p className={`mt-2 text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
            {t('donateTitle')}
          </p>
          <p className="mt-6 text-xl sm:text-2xl xl:text-3xl leading-8 text-sevy-text-secondary">
            {t('donateParagraph1')}
          </p>
        </div>

        {/* Impact Section */}
        <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
          <h3 className={`text-center text-2xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-3xl xl:text-4xl`}>
            {t('donateImpactTitle')}
          </h3>
          <dl className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 text-center sm:grid-cols-2 lg:grid-cols-3">
            {impacts.map((item, index) => (
              <div key={index} className="flex flex-col items-center bg-white/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-sevy-pink to-sevy-blue">
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <dd className="mt-4 text-xl sm:text-2xl xl:text-3xl font-semibold text-sevy-text-secondary">{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        
        {/* How to Donate Section */}
        <div className="mx-auto mt-24 max-w-7xl sm:mt-32">
          <div className="mx-auto max-w-4xl lg:text-center">
            <h2 className={`text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
              {t('howToDonateTitle')}
            </h2>
          </div>
          <div className="isolate mt-16 grid grid-cols-1 items-start gap-y-16 lg:grid-cols-2 lg:gap-x-24">
            {/* Bank Transfer */}
            <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 lg:p-10 shadow-lg ring-1 ring-gray-900/10">
                <h3 className="text-2xl sm:text-3xl font-semibold text-sevy-text">{t('bankTransferTitle')}</h3>
                <p className="mt-4 text-center text-lg sm:text-xl xl:text-2xl text-sevy-text-secondary">{t('bankTransferDesc')}</p>
                <div className="mt-8">
                  <button
                    onClick={() => setIsBankModalOpen(true)}
                    className="rounded-md bg-sevy-blue px-5 py-3 text-lg font-semibold text-sevy-text shadow-lg hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevy-blue transition-all duration-300 transform hover:scale-105"
                  >
                    {t('viewBankInfo')}
                  </button>
                </div>
            </div>
            {/* Other Ways */}
            <div className="space-y-12">
                <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-900/10">
                    <h3 className="text-2xl sm:text-3xl font-semibold text-sevy-text">{t('otherWaysTitle')}</h3>
                    <p className="mt-4 text-lg sm:text-xl xl:text-2xl text-sevy-text-secondary">{t('otherWaysDesc1')}</p>
                </div>
                <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-900/10">
                    <h3 className="text-2xl sm:text-3xl font-semibold text-sevy-text">{t('newsletterTitle')}</h3>
                    <p className="mt-4 text-lg sm:text-xl xl:text-2xl text-sevy-text-secondary">{t('newsletterDesc')}</p>
                    <form ref={formRef} className="mt-6" onSubmit={handleNewsletterSubmit} noValidate>
                        <div className="flex gap-x-4">
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <input
                              id="email-address"
                              name="email"
                              type="email"
                              autoComplete="email"
                              disabled={isSubmitting}
                              className="min-w-0 flex-auto rounded-md border-gray-300 px-3.5 py-2 text-sevy-text shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sevy-blue text-base lg:text-lg xl:text-xl disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder={t('emailPlaceholder')}
                            />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="rounded-md bg-sevy-blue px-3.5 py-2.5 text-base lg:text-lg xl:text-xl font-semibold text-sevy-text shadow-sm hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevy-blue disabled:bg-sevy-blue/50 disabled:cursor-not-allowed"
                            >
                              {isSubmitting ? (t('submitting') || 'Submitting...') : t('signUp')}
                            </button>
                        </div>

                        {/* Error Message Display - Translate key during render */}
                        {emailError && (
                          <p className="mt-2 text-sm text-red-600">{t(emailError)}</p>
                        )}
                    </form>
                </div>
            </div>
          </div>
        </div>
      </div>

      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-labelledby="bank-info-modal-title" role="dialog" aria-modal="true" onClick={() => setIsBankModalOpen(false)}>
          <div className="relative w-full max-w-lg p-6 mx-4 bg-white rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
                <h2 id="bank-info-modal-title" className="text-2xl font-bold text-sevy-text">{t('bankTransferInfoTitle')}</h2>
                <button
                    type="button"
                    className="-m-2 p-2 rounded-full text-sevy-text-secondary hover:bg-gray-100 transition-colors"
                    onClick={() => setIsBankModalOpen(false)}
                    aria-label={t('close')}
                >
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="mt-6">
                <ul className="space-y-4 text-lg xl:text-xl text-sevy-text-secondary">
                    <li>
                        <span className="font-semibold text-sevy-text block">{t('accountName')}:</span>
                        <span>{t('accountNameValue')}</span>
                    </li>
                    <li>
                        <span className="font-semibold text-sevy-text block">{t('accountNumber')}:</span>
                        <span className="break-words font-mono tracking-wider">{t('accountNumberValue')}</span>
                    </li>
                    <li>
                        <span className="font-semibold text-sevy-text block">{t('bank')}:</span>
                        <span>{t('bankValue')}</span>
                    </li>
                </ul>
                <div className="mt-6 p-4 bg-yellow-50/80 border border-yellow-200/90 rounded-lg">
                    <p className="text-lg text-yellow-800">{t('bankTransferWarning')}</p>
                </div>
            </div>
            <div className="mt-8 text-right">
                <button
                    onClick={() => setIsBankModalOpen(false)}
                    className="rounded-md bg-sevy-pink px-4 py-2 text-lg font-semibold text-sevy-text shadow-sm hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevy-pink"
                >
                    {t('close')}
                </button>
            </div>
          </div>
        </div>
      )}
      
      {isSignupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-labelledby="signup-success-modal-title" role="dialog" aria-modal="true" onClick={() => setIsSignupModalOpen(false)}>
          <div className="relative w-full max-w-lg p-6 mx-4 bg-white rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
                <h2 id="signup-success-modal-title" className="text-2xl font-bold text-sevy-text">{t('newsletterSuccessTitle')}</h2>
                <button
                    type="button"
                    className="-m-2 p-2 rounded-full text-sevy-text-secondary hover:bg-gray-100 transition-colors"
                    onClick={() => setIsSignupModalOpen(false)}
                    aria-label={t('close')}
                >
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg xl:text-xl text-sevy-text-secondary">
                  {t('newsletterSuccessMessage')}
              </p>
              <p className="mt-2 text-lg xl:text-xl font-semibold text-sevy-text break-all">
                  {submittedEmail}
              </p>
            </div>
            <div className="mt-8 text-right">
                <button
                    onClick={() => setIsSignupModalOpen(false)}
                    className="rounded-md bg-sevy-pink px-4 py-2 text-lg font-semibold text-sevy-text shadow-sm hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevy-pink"
                >
                    {t('close')}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Donate;