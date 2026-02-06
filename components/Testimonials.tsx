import { useEffect, useRef, useState } from 'react';
import { FiStar } from 'react-icons/fi';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Small Business Owner',
    text: 'I needed professional receipts for my bakery fast. This tool saved me hours compared to designing them from scratch.',
    rating: 5,
  },
  {
    name: 'James T.',
    role: 'Freelance Consultant',
    text: 'The AI generator is incredible — I uploaded a photo of an old receipt and had a perfect template in seconds.',
    rating: 5,
  },
  {
    name: 'Linda K.',
    role: 'Restaurant Manager',
    text: 'We switched from a $50/month POS receipt printer service. This does everything we need at a fraction of the cost.',
    rating: 5,
  },
  {
    name: 'Mike R.',
    role: 'Accountant',
    text: 'PDF export was a game-changer for expense reports. My clients love how clean the receipts look.',
    rating: 5,
  },
  {
    name: 'Priya D.',
    role: 'Etsy Shop Owner',
    text: 'The customization options are fantastic. I matched the receipts to my brand colors and it looks so professional.',
    rating: 4,
  },
  {
    name: 'Carlos G.',
    role: 'Food Truck Owner',
    text: 'Set up my receipt template during lunch break. Dead simple and the result looks just like what the big chains use.',
    rating: 5,
  },
  {
    name: 'Emma W.',
    role: 'Event Planner',
    text: 'I generate donation receipts for charity events. The template library had exactly what I needed on day one.',
    rating: 5,
  },
  {
    name: 'David L.',
    role: 'Auto Repair Shop',
    text: 'Our customers love getting itemized receipts now. The auto-calculate feature catches math errors before we do.',
    rating: 5,
  },
  {
    name: 'Aisha N.',
    role: 'Bookkeeper',
    text: 'Replaced a clunky desktop app with this. The fact that it works from any browser is a huge plus for my workflow.',
    rating: 4,
  },
];

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    if (!isVisible || !scrollRef.current) return;
    const el = scrollRef.current;
    let raf: number;
    let pos = 0;
    const speed = 0.4; // px per frame

    const tick = () => {
      pos += speed;
      // Reset when we've scrolled past the first set
      if (pos >= el.scrollWidth / 2) {
        pos = 0;
      }
      el.scrollLeft = pos;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    // Pause on hover
    const pause = () => cancelAnimationFrame(raf);
    const resume = () => { raf = requestAnimationFrame(tick); };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
    };
  }, [isVisible]);

  // Duplicate testimonials for infinite scroll effect
  const items = [...testimonials, ...testimonials];

  return (
    <section ref={sectionRef} className="bg-white py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div
          className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h2 className="font-display text-3xl sm:text-4xl mb-4" style={{ color: '#111827' }}>
            Loved by 50,000+ users
          </h2>
          <p className="font-body text-lg max-w-xl mx-auto" style={{ color: '#6b7280' }}>
            See what businesses are saying about ReceiptGen
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((t, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-80 bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, si) => (
                <FiStar
                  key={si}
                  className="w-4 h-4"
                  style={{
                    color: si < t.rating ? '#f59e0b' : '#e5e7eb',
                    fill: si < t.rating ? '#f59e0b' : 'none',
                  }}
                />
              ))}
            </div>

            {/* Quote */}
            <p className="font-body text-sm leading-relaxed mb-4" style={{ color: '#374151' }}>
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Author */}
            <div>
              <p className="font-body text-sm font-semibold" style={{ color: '#111827' }}>{t.name}</p>
              <p className="font-body text-xs" style={{ color: '#9ca3af' }}>{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
