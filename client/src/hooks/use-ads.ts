import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Ad {
  _id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  position: 'categories' | 'courses';
  order: number;
  isActive: boolean;
  clickCount: number;
  loggedInClickCount: number;
}

export function useAds(position: 'categories' | 'courses') {
  return useQuery<Ad[]>({
    queryKey: [`/api/ads/${position}`],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/ads/${position}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 