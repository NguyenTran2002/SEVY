import React, { useState, useRef } from 'react';
import { useTranslations } from '../lib/i18n';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { CameraIcon } from './icons/CameraIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { XIcon } from './icons/XIcon';
import { DocumentArrowUpIcon } from './icons/DocumentArrowUpIcon';

const GetInvolved: React.FC = () => {
  const { t, language } = useTranslations();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: 'fullNameRequired';
    email?: 'emailRequired' | 'invalidEmailFormat';
    phoneNumber?: 'phoneNumberRequired';
    education?: 'educationRequired';
    division?: 'divisionRequired';
    resume?: 'resumeRequired' | 'fileSizeTooLarge' | 'invalidFileType' | 'applicationSubmitError' | 'networkError';
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    education: '',
    division: '',
  });

  // API base URL for backend communication
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

  const divisions = [
    { icon: BookOpenIcon, title: t('divisionEducationTitle'), desc: t('divisionEducationDesc') },
    { icon: CodeBracketIcon, title: t('divisionTechTitle'), desc: t('divisionTechDesc') },
    { icon: MegaphoneIcon, title: t('divisionPRTitle'), desc: t('divisionPRDesc') },
    { icon: CameraIcon, title: t('divisionMediaTitle'), desc: t('divisionMediaDesc') },
    { icon: ClipboardIcon, title: t('divisionLogisticsTitle'), desc: t('divisionLogisticsDesc') },
    { icon: UserPlusIcon, title: t('divisionHRTitle'), desc: t('divisionHRDesc') },
  ];

  const processSteps = [
    { title: t('applicationStep1Title'), desc: t('applicationStep1Desc') },
    { title: t('applicationStep2Title'), desc: t('applicationStep2Desc') },
    { title: t('applicationStep3Title'), desc: t('applicationStep3Desc') },
    { title: t('applicationStep4Title'), desc: t('applicationStep4Desc') },
    { 
      title: t('applicationStep5Title'), 
      desc: t('applicationStep5Desc'), 
      highlight: true, 
      specialRole: t('forEducators')
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setResumeFile(files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };
  
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Clear previous errors
    const errors: typeof fieldErrors = {};

    // Validate all fields on submit - store KEYS not translated strings
    if (!formData.fullName.trim()) {
      errors.fullName = 'fullNameRequired';
    }

    if (!formData.email.trim()) {
      errors.email = 'emailRequired';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'invalidEmailFormat';
      }
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'phoneNumberRequired';
    }

    if (!formData.education) {
      errors.education = 'educationRequired';
    }

    if (!formData.division) {
      errors.division = 'divisionRequired';
    }

    if (!resumeFile) {
      errors.resume = 'resumeRequired';
    } else {
      // Validate file size (5MB limit)
      if (resumeFile.size > 5 * 1024 * 1024) {
        errors.resume = 'fileSizeTooLarge';
      } else {
        // Validate file type
        const fileName = resumeFile.name.toLowerCase();
        const isValidType = fileName.endsWith('.pdf') || fileName.endsWith('.doc') || fileName.endsWith('.docx');
        if (!isValidType) {
          errors.resume = 'invalidFileType';
        }
      }
    }

    // If any errors exist, set them and stop submission
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    // Clear all errors if validation passed
    setFieldErrors({});

    try {
      // Create FormData object with all fields including resume file
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('phoneNumber', formData.phoneNumber);
      submitData.append('education', formData.education);
      submitData.append('division', formData.division);
      if (resumeFile) {
        submitData.append('resume', resumeFile);
      }

      // Send to backend API
      const response = await fetch(`${API_BASE_URL}/submit_application`, {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success - close form modal and show success modal
        setIsFormModalOpen(false);
        setIsSuccessModalOpen(true);
        // Reset form
        setFormData({
          fullName: '', email: '', phoneNumber: '', education: '', division: '',
        });
        setResumeFile(null);
        setFieldErrors({});
      } else {
        // Generic server error - use KEY not string
        setFieldErrors({ resume: 'applicationSubmitError' });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setFieldErrors({ resume: 'networkError' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.fullName && formData.email && formData.phoneNumber && formData.education && formData.division && resumeFile;

  const educationOptions = [
    t('educationOption1'),
    t('educationOption2'),
    t('educationOption3'),
    t('educationOption4'),
  ];
  
  const divisionOptions = [
    { value: 'Education', label: t('divisionEducationTitle') },
    { value: 'Technology', label: t('divisionTechTitle') },
    { value: 'Public Relations', label: t('divisionPRTitle') },
    { value: 'Media', label: t('divisionMediaTitle') },
    { value: 'Logistics', label: t('divisionLogisticsTitle') },
    { value: 'Human Resources', label: t('divisionHRTitle') },
    { value: 'Volunteer', label: t('volunteersTitle') }
  ];

  return (
    <>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Hero */}
          <div className="mx-auto max-w-4xl lg:text-center">
            <h2 className="text-lg sm:text-xl xl:text-2xl font-semibold leading-7 text-sevy-blue">{t('getInvolvedSubtitle')}</h2>
            <p className={`mt-2 text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
              {t('getInvolvedTitle')}
            </p>
            <p className="mt-6 text-xl sm:text-2xl xl:text-3xl leading-8 text-sevy-text-secondary">
              {t('getInvolvedParagraph')}
            </p>
          </div>

          {/* Divisions */}
          <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
              <div className="mx-auto max-w-4xl text-center">
                  <h3 className={`text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
                      {t('getInvolvedFindFit')}
                  </h3>
              </div>
              <dl className="mx-auto mt-12 grid max-w-none grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {divisions.map((division) => (
                  <div key={division.title} className="flex flex-col items-center text-center bg-white/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <dt className="flex flex-col items-center gap-y-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sevy-pink to-sevy-blue">
                              <division.icon className="h-7 w-7 text-white" aria-hidden="true" />
                          </div>
                          <span className="text-xl sm:text-2xl xl:text-3xl font-semibold text-sevy-text">{division.title}</span>
                      </dt>
                      <dd className="mt-1 flex flex-auto flex-col text-xl sm:text-2xl xl:text-3xl text-sevy-text-secondary">
                          <p className="flex-auto">{division.desc}</p>
                      </dd>
                  </div>
                  ))}
              </dl>
          </div>
          
          {/* Volunteers */}
          <div className="mx-auto mt-24 max-w-4xl text-center sm:mt-32">
              <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sevy-pink to-sevy-blue">
                      <UserGroupIcon className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
              </div>
              <h3 className={`mt-4 text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
                  {t('volunteersTitle')}
              </h3>
              <p className="mt-4 text-xl sm:text-2xl xl:text-3xl leading-8 text-sevy-text-secondary">
                  {t('volunteersDesc')}
              </p>
          </div>

          {/* Application Process */}
          <div className="mx-auto mt-24 max-w-7xl text-center sm:mt-32">
            <h3 className={`text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
              {t('applicationProcessTitle')}
            </h3>
            <div className="mt-12">
              <ol className="flex flex-wrap items-stretch justify-center gap-8">
                {processSteps.map((step: any, index) => (
                  <li
                    key={index}
                    className={`flex flex-col items-center rounded-2xl p-6 text-center max-w-sm sm:max-w-xs ${step.highlight ? 'bg-sevy-pink/10 ring-2 ring-sevy-pink/50' : ''}`}
                  >
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${step.highlight ? 'bg-sevy-pink' : 'bg-sevy-blue'} text-xl font-bold text-white`}>
                      {index + 1}
                    </div>
                    {step.specialRole && (
                      <p className="mt-4 text-sm font-bold uppercase tracking-wider text-sevy-pink">{step.specialRole}</p>
                    )}
                    <p className="mt-2 text-xl font-semibold text-sevy-text">{step.title}</p>
                    <p className="mt-1 text-lg text-sevy-text-secondary">{step.desc}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* CTA */}
          <div className="mx-auto mt-24 max-w-4xl rounded-3xl bg-white p-8 text-center shadow-lg ring-1 ring-gray-900/10 sm:mt-32">
              <h3 className={`text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl`}>
                  {t('getInvolvedCTATitle')}
              </h3>
              <div className="mt-8">
                  <button
                    onClick={() => {
                      setIsFormModalOpen(true);
                      setFieldErrors({}); // Clear any previous errors
                    }}
                    className="inline-block rounded-md bg-sevy-blue px-6 py-4 text-lg sm:text-xl xl:text-2xl font-semibold text-sevy-text shadow-lg hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevy-blue transition-all duration-300 transform hover:scale-105"
                  >
                    {t('getInvolvedCTAButton')}
                  </button>
              </div>
          </div>

        </div>
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-labelledby="application-form-title" role="dialog" aria-modal="true" onClick={() => { setIsFormModalOpen(false); setFieldErrors({}); }}>
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
                <h2 id="application-form-title" className="text-2xl font-bold text-sevy-text">{t('applicationFormTitle')}</h2>
                <button
                    type="button"
                    className="-m-2 p-2 rounded-full text-sevy-text-secondary hover:bg-gray-100 transition-colors"
                    onClick={() => { setIsFormModalOpen(false); setFieldErrors({}); }}
                    aria-label={t('close')}
                >
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <form onSubmit={handleFormSubmit} noValidate>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Full Name */}
                    <div>
                        <label htmlFor="fullName" className="block text-lg font-medium text-sevy-text">{t('fullNameLabel')}</label>
                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sevy-blue focus:ring-sevy-blue text-lg" placeholder={t('fullNamePlaceholder')} />
                        {fieldErrors.fullName && (
                          <p className="mt-1 text-sm text-red-600">{t(fieldErrors.fullName)}</p>
                        )}
                    </div>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-lg font-medium text-sevy-text">{t('emailLabel')}</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sevy-blue focus:ring-sevy-blue text-lg" placeholder="you@example.com" />
                        {fieldErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{t(fieldErrors.email)}</p>
                        )}
                    </div>
                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phoneNumber" className="block text-lg font-medium text-sevy-text">{t('phoneNumberLabel')}</label>
                        <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sevy-blue focus:ring-sevy-blue text-lg" placeholder="+1 (555) 123-4567" />
                        {fieldErrors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-600">{t(fieldErrors.phoneNumber)}</p>
                        )}
                    </div>
                    {/* Education Level */}
                    <div>
                        <label htmlFor="education" className="block text-lg font-medium text-sevy-text">{t('educationLevelLabel')}</label>
                        <select id="education" name="education" value={formData.education} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sevy-blue focus:ring-sevy-blue text-lg">
                            <option value="" disabled>{t('selectAnOption')}</option>
                            {educationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        {fieldErrors.education && (
                          <p className="mt-1 text-sm text-red-600">{t(fieldErrors.education)}</p>
                        )}
                    </div>
                    {/* Division of Interest */}
                    <div>
                        <label htmlFor="division" className="block text-lg font-medium text-sevy-text">{t('divisionOfInterestLabel')}</label>
                        <select id="division" name="division" value={formData.division} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sevy-blue focus:ring-sevy-blue text-lg">
                            <option value="" disabled>{t('selectAnOption')}</option>
                            {divisionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        {fieldErrors.division && (
                          <p className="mt-1 text-sm text-red-600">{t(fieldErrors.division)}</p>
                        )}
                    </div>
                    {/* Resume Upload */}
                    <div>
                        <label className="block text-lg font-medium text-sevy-text">{t('resumeLabel')}</label>
                        <div
                            onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`mt-1 flex cursor-pointer justify-center rounded-lg border-2 border-dashed px-6 pb-6 pt-5 transition-colors hover:border-sevy-blue hover:bg-sevy-blue/5 ${isDragging ? 'border-sevy-blue bg-sevy-blue/10' : 'border-gray-300'}`}
                        >
                            <div className="text-center">
                                <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="mt-4 flex text-lg text-gray-600">
                                    <p className="pl-1">{t('resumeDragDrop')}</p>
                                </div>
                                <p className="text-base text-gray-500">{t('resumeAcceptedFiles')}</p>
                                <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files)} accept=".pdf,.doc,.docx" />
                            </div>
                        </div>
                        {resumeFile && (
                            <div className="mt-2 flex items-center justify-between rounded-md bg-gray-50 p-2 text-lg">
                                <span className="truncate font-medium text-sevy-text">{resumeFile.name}</span>
                                <button type="button" onClick={() => setResumeFile(null)} className="ml-4 text-sevy-pink-dark hover:text-sevy-pink" aria-label={t('removeFile')}>
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                        {fieldErrors.resume && (
                          <p className="mt-1 text-sm text-red-600">{t(fieldErrors.resume)}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end p-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="rounded-md bg-sevy-blue px-5 py-3 text-lg font-semibold text-sevy-text shadow-lg hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevy-blue transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-sevy-blue/50 disabled:scale-100 disabled:shadow-md"
                    >
                        {isSubmitting ? t('submitting') || 'Submitting...' : t('submitApplication')}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-labelledby="success-modal-title" role="dialog" aria-modal="true" onClick={() => setIsSuccessModalOpen(false)}>
          <div className="relative w-full max-w-lg p-6 mx-4 bg-white rounded-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
                <h2 id="success-modal-title" className="text-2xl font-bold text-sevy-text">{t('applicationSuccessTitle')}</h2>
                <button type="button" className="-m-2 p-2 rounded-full text-sevy-text-secondary hover:bg-gray-100 transition-colors" onClick={() => setIsSuccessModalOpen(false)} aria-label={t('close')}>
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="mt-6 text-center">
              <p className="text-lg xl:text-xl text-sevy-text-secondary">
                  {t('applicationSuccessMessage')}
              </p>
            </div>
            <div className="mt-8 text-right">
                <button
                    onClick={() => setIsSuccessModalOpen(false)}
                    className="rounded-md bg-sevy-pink px-4 py-2 text-lg font-semibold text-sevy-text shadow-sm hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sevy-pink"
                >
                    {t('close')}
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GetInvolved;