'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface CompetitionSettings {
  startDateTime: string;
  endDateTime: string;
  soundEnabled: boolean;
}

export default function CompetitionCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [competitionStatus, setCompetitionStatus] = useState<'before' | 'active' | 'ended'>('before');
  const [competitionSettings, setCompetitionSettings] = useState<CompetitionSettings | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load competition settings from localStorage as fallback
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('competitionSettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setCompetitionSettings(parsed);
        } catch (error) {
          console.error('Error loading competition settings:', error);
        }
      }
    }
  }, []);

  // Also listen for Firebase settings updates
  useEffect(() => {
    // This will be handled by the FirestoreSyncProvider automatically
    // The settings will be updated via the storage event listener below
  }, []);

  useEffect(() => {
    if (!competitionSettings?.startDateTime) return;

    let mounted = true;
    
    const timer = setInterval(() => {
      if (!mounted) return;
      
      const now = new Date();
      const startTime = new Date(competitionSettings.startDateTime);
      const endTime = new Date(competitionSettings.endDateTime);

      if (now.getTime() < startTime.getTime()) {
        // Before competition
        setCompetitionStatus('before');
        const distance = startTime.getTime() - now.getTime();
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else if (now.getTime() >= startTime.getTime() && now.getTime() <= endTime.getTime()) {
        // During competition
        setCompetitionStatus('active');
        const distance = endTime.getTime() - now.getTime();
        
        if (distance <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          const days = 0; // During competition, no days
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
        }
      } else {
        // After competition
        setCompetitionStatus('ended');
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [competitionSettings]);

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'competitionSettings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setCompetitionSettings(parsed);
        } catch (error) {
          console.error('Error parsing competition settings:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!mounted || !competitionSettings) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <Timer className="w-4 h-4 text-coral-600" />
        <span className="font-mono text-gray-700 dark:text-gray-300">
          --:--:--
        </span>
        <span className="text-xs text-gray-500">chargement...</span>
      </div>
    );
  }

  const getStatusText = () => {
    switch (competitionStatus) {
      case 'before':
        return 'avant début';
      case 'active':
        return 'temps restant';
      case 'ended':
        return 'terminée';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (competitionStatus) {
      case 'before':
        return 'text-blue-600';
      case 'active':
        return 'text-green-600';
      case 'ended':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (competitionStatus === 'ended') {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full" />
        <span className="text-sm font-semibold text-red-600">COMPÉTITION TERMINÉE</span>
      </div>
    );
  }

  if (competitionStatus === 'active') {
    // During competition - show green circle with countdown to end
    return (
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <span className="font-mono text-gray-700 dark:text-gray-300">
          {formatTimeDisplay()}
        </span>
        <span className="text-xs text-green-600 font-semibold">
          COMPÉTITION ACTIVE
        </span>
      </div>
    );
  }

  // Format time display based on duration
  const formatTimeDisplay = () => {
    if (competitionStatus === 'before') {
      // Before start - check if >= 24 hours
      const totalHours = timeLeft.days * 24 + timeLeft.hours;
      if (totalHours >= 24) {
        return `${timeLeft.days}j ${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
      } else {
        return `${String(totalHours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
      }
    } else {
      // During competition - only show HH:MM:SS
      return `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;
    }
  };
  return (
    <div className="flex items-center space-x-2 text-sm">
      <Timer className="w-4 h-4 text-coral-600" />
      <span className="font-mono text-gray-700 dark:text-gray-300">
        {formatTimeDisplay()}
      </span>
      <span className={`text-xs ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
}