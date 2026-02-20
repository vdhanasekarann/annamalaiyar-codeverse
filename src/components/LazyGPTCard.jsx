import React from 'react';
import GPTCard from './GPTCard';

export default function LazyGPTCard(props) {
  const ref = React.useRef();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  if (!visible) {
    // Render skeleton placeholder matching card dimensions
    return (
      <div ref={ref} className="glass-card skeleton p-6 w-full h-full min-h-[540px]">
        <div className="w-full h-full flex flex-col">
          <div className="h-10 w-24 rounded-md mb-3 skeleton" />
          <div className="flex-1">
            <div className="h-24 w-full rounded-md mb-2 skeleton" />
            <div className="h-3 w-3/4 rounded-md mt-2 skeleton" />
            <div className="h-3 w-1/2 rounded-md mt-2 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  return <GPTCard {...props} />;
}
