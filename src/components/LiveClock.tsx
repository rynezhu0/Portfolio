'use client';

import { useState, useEffect } from 'react';

export default function LiveClock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Avoid hydration mismatch — render nothing on server
  if (!time) return <span className="font-mono text-[20px] text-text-secondary tracking-wide w-[80px]">&nbsp;</span>;

  return (
    <time
      className="font-mono text-[20px] text-text-secondary tracking-wide tabular-nums"
      aria-live="polite"
      aria-label={`Current time: ${time}`}
    >
      {time}
    </time>
  );
}
