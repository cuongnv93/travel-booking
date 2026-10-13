'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined' && pathname) {
      const seg = pathname.split('/')[1];
      if (['vi', 'en', 'zh', 'ko', 'ja'].includes(seg)) {
        document.documentElement.lang = seg;
      }
    }

    setVisible(true);
    setProgress(10);
    const t1 = setTimeout(() => setProgress(40), 80);
    const t2 = setTimeout(() => setProgress(70), 200);
    const t3 = setTimeout(() => setProgress(90), 400);
    let t5: NodeJS.Timeout | undefined;
    const t4 = setTimeout(() => {
      setProgress(100);
      t5 = setTimeout(() => { setVisible(false); setProgress(0); }, 300);
    }, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (t5) clearTimeout(t5);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(59,130,246,0.6)]"
      style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
    />
  );
}
