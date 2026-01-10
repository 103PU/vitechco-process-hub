import { useState, useEffect } from 'react';

export function useGridColumns() {
  const [columns, setColumns] = useState(4); // Default to desktop to minimize layout shift

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) { // sm
        setColumns(1);
      } else if (width < 1024) { // lg
        setColumns(2);
      } else {
        setColumns(4);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return columns;
}