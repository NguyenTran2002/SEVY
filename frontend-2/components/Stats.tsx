
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from '../lib/i18n';

// API configuration - empty string uses relative URLs for local dev (proxied)
// In production, set VITE_BACKEND_URL to full backend URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

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

interface StatsData {
  students_taught: number;
  sevy_ai_answers: number;
  sevy_educators_number: number;
}

const Stats: React.FC = () => {
  const { t, language } = useTranslations();
  const statsRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_all_numbers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: StatsData = await response.json();
        setStatsData(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep statsData as null, will use fallback values
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

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

  // Use API data if available, otherwise fallback to hardcoded values
  const stats = [
    {
      key: 'students',
      name: t('statsStudents'),
      value: statsData ? `${statsData.students_taught.toLocaleString()}+` : '2,500+'
    },
    {
      key: 'ai',
      name: t('statsAIQuestions'),
      value: statsData ? `${statsData.sevy_ai_answers.toLocaleString()}+` : '10,000+'
    },
    {
      key: 'educators',
      name: t('statsEducators'),
      value: statsData ? `${statsData.sevy_educators_number}+` : '15+'
    },
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