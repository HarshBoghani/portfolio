'use client';

import { useEffect } from 'react';
import axios from 'axios';

interface ViewIncrementerProps {
  projectId: string;
}

export default function ViewIncrementer({ projectId }: ViewIncrementerProps) {
  useEffect(() => {
    const incrementView = async () => {
      try {
        const response = await axios.post('/api/increment', { id: projectId });

        // Emit custom event to notify ProjectClient of the view increment
        if (response.data.views) {
          const event = new CustomEvent('viewIncremented', {
            detail: {
              projectId,
              newViews: response.data.views,
            },
          });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error('Error incrementing view:', error);
      }
    };

    // Small delay to ensure the component is mounted and ready
    const timer = setTimeout(incrementView, 500);

    return () => clearTimeout(timer);
  }, [projectId]);

  // This component renders nothing
  return null;
}
