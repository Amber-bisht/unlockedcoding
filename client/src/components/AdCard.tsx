import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Ad {
  _id: string;
  name: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  position: 'categories' | 'courses';
  order: number;
  isActive: boolean;
  clickCount: number;
  loggedInClickCount: number;
}

interface AdCardProps {
  ad: Ad;
  className?: string;
}

export function AdCard({ ad, className = '' }: AdCardProps) {
  const clickMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/ads/${ad._id}/click`);
      const data = await res.json();
      return data.redirectUrl;
    },
    onSuccess: (redirectUrl) => {
      // Open the ad link in a new tab
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    },
    onError: (error: any) => {
      console.error('Failed to track ad click:', error);
      // Still open the link even if tracking fails
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickMutation.mutate();
  };

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${className}`}
      onClick={handleClick}
    >
      <CardContent className="p-0 overflow-hidden">
        <div className="relative">
          <img
            src={ad.imageUrl}
            alt={ad.name}
            className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ExternalLink className="h-5 w-5 text-white drop-shadow-lg" />
          </div>
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs bg-black/70 text-white px-2 py-1 rounded">
              Advertisement
            </span>
          </div>
        </div>
        {/* Description section */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-3">
            {ad.name}
          </h3>
          <p className="text-muted-foreground mb-4 leading-relaxed">
            {ad.description || 'No description available'}
          </p>
          <div className="flex items-center text-primary hover:text-primary/80 font-semibold transition-colors">
            Learn more
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 