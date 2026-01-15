import { useState, useEffect } from 'react';

export function useLoadingState(initialDelay = 300) {
  const [isLoading, setIsLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay]);

  const stopLoading = () => {
    setIsLoading(false);
  };

  const startLoading = () => {
    setIsLoading(true);
    setShowSkeleton(true);
  };

  return {
    isLoading,
    showSkeleton,
    stopLoading,
    startLoading,
  };
}

// Hook for staggered loading animation
export function useStaggeredLoading(items: any[], delay = 100) {
  const [visibleItems, setVisibleItems] = useState<any[]>([]);

  useEffect(() => {
    setVisibleItems([]);
    
    items.forEach((item, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, item]);
      }, index * delay);
    });
  }, [items, delay]);

  return visibleItems;
}