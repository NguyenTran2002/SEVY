
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../lib/i18n';

const AnimatedNumber: React.FC<{ target: number; isInView: boolean }> = ({ target, isInView }) => {
  const [count, setCount] = useState(0);
  const duration = 2000; // 2-second animation

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease-out cubic function for a smooth slowdown
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(easedProgress * target);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target); // Ensure it ends on the exact target
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [target, isInView]);

  return <>{count.toLocaleString()}</>;
};

const Stats: React.FC = () => {
  const { t, language } = useTranslations();
  const statsRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target); // Animate only once
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the component is visible
      }
    );

    const currentRef = statsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const stats = [
    { key: 'students', name: t('statsStudents'), value: '2,500+' },
    { key: 'ai', name: t('statsAIQuestions'), value: '10,000+' },
    { key: 'educators', name: t('statsEducators'), value: '15+' },
  ];

  return (
    <div className="py-24 sm:py-32" ref={statsRef}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
             <h2 className={`text-3xl font-bold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-4xl xl:text-5xl mb-16`}>
              {t('statsTitle')}
            </h2>
        </div>
        <dl className="grid grid-cols-1 gap-x-12 gap-y-16 text-center lg:grid-cols-3">
          {stats.map((stat) => {
            const numericValue = parseInt(stat.value.replace(/,/g, '').replace('+', ''));
            const suffix = stat.value.endsWith('+') ? '+' : '';
            return (
              <div key={stat.key} className="mx-auto flex max-w-xs flex-col gap-y-4">
                <dt className="text-xl sm:text-2xl xl:text-3xl leading-7 text-sevy-text-secondary">{stat.name}</dt>
                <dd className={`order-first text-5xl font-extrabold ${language === 'vi' ? 'tracking-tight' : ''} text-sevy-text sm:text-6xl xl:text-7xl`}>
                  <span className="bg-gradient-to-r from-sevy-pink to-sevy-blue bg-clip-text text-transparent">
                    <AnimatedNumber target={numericValue} isInView={isInView} />
                    {isInView && suffix}
                  </span>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
};

export default Stats;