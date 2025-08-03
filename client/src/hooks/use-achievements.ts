import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

interface Achievement {
  _id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AchievementStats {
  totalAchievements: number;
  unlockedCount: number;
  totalPoints: number;
  achievements: Achievement[];
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAchievements = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/achievements/user', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      
      const data = await response.json();
      setAchievements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/achievements/stats', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch achievement stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching achievement stats:', err);
    }
  };

  const checkProfileCompletion = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/achievements/check-profile', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to check profile completion');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh achievements if new one was awarded
        await fetchAchievements();
        await fetchStats();
        return data;
      }
      
      return data;
    } catch (err) {
      console.error('Error checking profile completion:', err);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchStats();
    }
  }, [user]);

  return {
    achievements,
    stats,
    loading,
    error,
    fetchAchievements,
    fetchStats,
    checkProfileCompletion
  };
} 