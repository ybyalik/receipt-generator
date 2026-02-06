import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import Testimonials from '../components/Testimonials';
import { FiArrowRight, FiArrowUpRight, FiCheck, FiLayout, FiEdit3, FiDownload } from 'react-icons/fi';

/* ───────────────────────────────────────────
   Animated counter hook for metrics section
   ─────────────────────────────────────────── */
function useCounter(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return count;
}

const Home: NextPage = () => {
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((s) => new Set(s).add(e.target.id));
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    Object.values(refs.current).forEach((r) => r && obs.observe(r));
    return () => obs.disconnect();
  }, []);

  const r = (id: string) => (el: HTMLElement | null) => { refs.current[id] = el; };
  const v = (id: string) => visible.has(id);

  // Animated counters for metrics
  const metricsVisible = v('metrics');
  const countReceipts = useCounter(50, 1400, metricsVisible);
  const countTemplates = useCounter(100, 1400, metricsVisible);
  const countRating = useCounter(49, 1400, metricsVisible); // 4.9 × 10
  const countSpeed = useCounter(30, 1400, metricsVisible);

  return (
    <Layout>
      <Head>
        <title>Receipt Generator - Create Professional Receipts Instantly</title>
        <meta name="description" content="Create professional receipts in seconds with our online receipt generator. Choose from customizable templates, add your details, and download high-quality receipts instantly." />
        <meta property="og:title" content="Receipt Generator - Create Professional Receipts Instantly" />
        <meta property="og:description" content="Create professional receipts in seconds with our online receipt generator. Choose from customizable templates and download instantly." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://receiptgenerator.net/" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        .font-display { font-family: 'DM Serif Display', serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes typewriter {
          0% { width: 0; }
          50% { width: 100%; }
          90% { width: 100%; }
          100% { width: 0; }
        }
      `}</style>

      {/* ════════════════════════════════════════
          HERO — Full-width, editorial layout
         ════════════════════════════════════════ */}
      <section className="bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-28 pb-0">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
            <p className="font-body font-medium tracking-wide uppercase text-sm mb-5" style={{ color: '#6b7280' }}>
              The receipt tool for modern business
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] mb-6" style={{ color: '#111827' }}>
              Receipts, created in&nbsp;seconds
            </h1>
            <p className="font-body text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: '#6b7280' }}>
              100+ industry templates. Full customization. AI-powered scanning.
              The fastest way to generate professional receipts — free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/templates"
                className="font-body inline-flex items-center gap-2.5 px-8 py-4 font-medium rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base"
                style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
              >
                Start creating — it&apos;s free
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ai"
                className="font-body inline-flex items-center gap-2 px-8 py-4 font-medium rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-base"
                style={{ color: '#4b5563' }}
              >
                Try AI Generator
                <FiArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Full-width product screenshot */}
          <div className="relative mx-auto max-w-5xl">
            <div className="relative rounded-t-2xl overflow-hidden border border-gray-200 border-b-0 shadow-2xl" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)' }}>
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                </div>
                <div className="flex-1 mx-8">
                  <div className="bg-white rounded-md px-4 py-1.5 text-xs font-body border border-gray-200 max-w-md mx-auto text-center" style={{ color: '#9ca3af' }}>
                    receiptgenerator.net/templates
                  </div>
                </div>
              </div>
              <img
                src="https://receipt-generator-net.s3.us-east-1.amazonaws.com/features/templates.webp"
                alt="Receipt Generator — Templates Dashboard"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          METRICS — editorial number strip
         ════════════════════════════════════════ */}
      <section className="bg-white border-y" style={{ borderColor: '#e5e7eb' }}>
        <div
          id="metrics"
          ref={r('metrics')}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-wrap justify-center lg:justify-between items-baseline py-12 lg:py-16 gap-y-8">
            {[
              { value: `${countReceipts}K`, accent: '+', label: 'receipts generated' },
              { value: `${countTemplates}`, accent: '+', label: 'templates' },
              { value: `${(countRating / 10).toFixed(1)}`, accent: '★', label: 'user rating' },
              { value: `${countSpeed}`, accent: 's', label: 'to create', prefix: '<' },
            ].map((metric, i) => (
              <div
                key={metric.label}
                className={`flex items-baseline gap-x-6 transition-all duration-700 ${metricsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Subtle dot separator — hidden on first */}
                {i > 0 && (
                  <span
                    className="hidden lg:block w-1 h-1 rounded-full flex-shrink-0 -ml-3"
                    style={{ backgroundColor: '#d1d5db' }}
                  />
                )}
                <div className="text-center px-4 sm:px-6 lg:px-2">
                  <div className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] leading-none tracking-tight" style={{ color: '#111827' }}>
                    {metric.prefix && (
                      <span style={{ color: '#0d9488' }}>{metric.prefix}</span>
                    )}
                    {metric.value}
                    <span className="font-body text-lg sm:text-xl font-medium ml-0.5" style={{ color: '#0d9488' }}>
                      {metric.accent}
                    </span>
                  </div>
                  <div
                    className="font-body text-[11px] sm:text-xs uppercase tracking-[0.15em] mt-2"
                    style={{ color: '#6b7280' }}
                  >
                    {metric.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BENTO FEATURE GRID — asymmetric layout
         ════════════════════════════════════════ */}
      <section className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            id="feat-h"
            ref={r('feat-h')}
            className={`max-w-2xl mb-16 transition-all duration-700 ${v('feat-h') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className="font-body font-medium tracking-wide uppercase text-sm mb-3" style={{ color: '#6b7280' }}>Capabilities</p>
            <h2 className="font-display text-4xl sm:text-5xl leading-tight mb-4" style={{ color: '#111827' }}>
              Built for speed,<br />designed for clarity
            </h2>
            <p className="font-body text-lg leading-relaxed" style={{ color: '#6b7280' }}>
              Every feature exists to get you from blank page to finished receipt as fast as possible.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1 — Templates, spans 2 cols */}
            <div
              id="b1" ref={r('b1')}
              className={`lg:col-span-2 group rounded-2xl p-8 lg:p-10 border border-gray-200 hover:border-gray-300 transition-all duration-500 ${v('b1') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ backgroundColor: '#fffbf5' }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-body text-xl font-bold mb-2" style={{ color: '#111827' }}>100+ Industry Templates</h3>
                  <p className="font-body leading-relaxed max-w-lg" style={{ color: '#6b7280' }}>
                    Restaurants, retail stores, auto repair shops, gas stations, hotels, medical offices —
                    we have a template built for your industry, pre-formatted and ready to customize.
                  </p>
                </div>
                <Link href="/templates" className="flex-shrink-0 ml-6 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-teal-600 transition-all" style={{ color: '#9ca3af' }}>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <img
                  src="https://receipt-generator-net.s3.us-east-1.amazonaws.com/features/templates.webp"
                  alt="Templates library"
                  className="w-full h-auto block"
                />
              </div>
            </div>

            {/* Card 2 — Full Customization — mini receipt mockup */}
            <div
              id="b2" ref={r('b2')}
              className={`group rounded-2xl p-6 lg:p-7 border border-gray-200 hover:border-gray-300 transition-all duration-500 flex flex-col ${v('b2') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: '80ms', backgroundColor: '#fffbf5' }}
            >
              <h3 className="font-body text-xl font-bold mb-3" style={{ color: '#111827' }}>Full Customization</h3>
              {/* Mini thermal receipt */}
              <div
                className="rounded-lg flex-1 mx-auto w-full"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: '13px',
                  color: '#000',
                  backgroundColor: '#fff',
                  padding: '28px 22px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '1.5px' }}>THE GOLDEN FORK</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>123 Main Street, Austin TX</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>Tel: (555) 123-4567</div>
                </div>
                <div style={{ borderTop: '1px dashed #bbb', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666', marginBottom: '10px' }}>
                  <span>Server: Rebecca</span>
                  <span>Table: 12</span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  {[
                    ['2x Grilled Salmon', '$42.00'],
                    ['1x Caesar Salad', '$12.00'],
                    ['2x House Wine', '$18.00'],
                    ['1x Tiramisu', '$9.00'],
                  ].map(([item, price]) => (
                    <div key={item} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span>{item}</span>
                      <span>{price}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px dashed #bbb', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span>Subtotal</span>
                  <span>$81.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: '#666' }}>
                  <span>Tax (8.25%)</span>
                  <span>$6.68</span>
                </div>
                <div style={{ borderTop: '1px solid #999', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                  <span>TOTAL</span>
                  <span>$87.68</span>
                </div>
                <div style={{ borderTop: '1px dashed #bbb', margin: '10px 0' }} />
                <div style={{ fontSize: '11px', color: '#666' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Visa</span>
                    <span>**** 4242</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>02/06/2026</span>
                    <span>7:32 PM</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '11px', color: '#999', marginTop: '14px' }}>
                  Thank you for dining with us!
                </div>
              </div>
              <p className="font-body text-xs mt-3 text-center" style={{ color: '#9ca3af' }}>
                Edit every field — fully customizable
              </p>
            </div>

            {/* Card 3 — Instant Generation with animated stopwatch visual */}
            <div
              id="b3" ref={r('b3')}
              className={`group rounded-2xl p-6 lg:p-7 border border-gray-200 hover:border-gray-300 transition-all duration-500 ${v('b3') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: '160ms', backgroundColor: '#fffbf5' }}
            >
              {/* Animated timer visual */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative w-24 h-24">
                  {/* Outer ring */}
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="42" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                    <circle
                      cx="48" cy="48" r="42" fill="none" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={v('b3') ? '0' : `${2 * Math.PI * 42}`}
                      style={{
                        stroke: '#0d9488',
                        transition: 'stroke-dashoffset 2s ease-out',
                      }}
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-2xl leading-none" style={{ color: '#0d9488' }}>&lt;30</span>
                    <span className="font-body text-xs font-medium" style={{ color: '#6b7280' }}>seconds</span>
                  </div>
                </div>
              </div>
              <h3 className="font-body text-xl font-bold mb-2" style={{ color: '#111827' }}>Instant Generation</h3>
              <p className="font-body text-sm leading-relaxed" style={{ color: '#6b7280' }}>
                Live preview updates as you type. See exactly what you&apos;ll get — then download a print-ready PNG in one click.
              </p>
              {/* Mini progress steps */}
              <div className="mt-4 flex items-center gap-1.5">
                {['Type', 'Preview', 'Download'].map((step, i) => (
                  <div key={step} className="flex items-center gap-1.5">
                    <div
                      className="font-body text-xs px-2 py-1 rounded-md font-medium"
                      style={{
                        backgroundColor: v('b3') ? '#0d9488' : '#f3f4f6',
                        color: v('b3') ? '#ffffff' : '#9ca3af',
                        transition: `all 0.5s ease ${0.3 + i * 0.3}s`,
                      }}
                    >
                      {step}
                    </div>
                    {i < 2 && (
                      <FiArrowRight className="w-3 h-3" style={{ color: '#d1d5db' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4 — AI, spans 2 cols */}
            <div
              id="b4" ref={r('b4')}
              className={`lg:col-span-2 group rounded-2xl p-8 lg:p-10 border border-gray-200 hover:border-gray-300 transition-all duration-500 ${v('b4') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: '240ms', background: 'linear-gradient(135deg, #fff7ed 0%, #fffbf5 100%)' }}
            >
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="font-body inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md mb-4" style={{ backgroundColor: '#0d9488', color: '#ffffff' }}>
                    AI-Powered
                  </div>
                  <h3 className="font-body text-xl font-bold mb-3" style={{ color: '#111827' }}>Upload a receipt, get an editable copy</h3>
                  <p className="font-body leading-relaxed mb-6" style={{ color: '#6b7280' }}>
                    Take a photo of any receipt. Our AI identifies the store, extracts details, matches a template, and pre-fills everything. Just review and download.
                  </p>
                  <Link href="/ai" className="font-body inline-flex items-center gap-2 font-semibold transition-colors" style={{ color: '#0d9488' }}>
                    Try AI Generator
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src="https://receipt-generator-net.s3.us-east-1.amazonaws.com/features/ai-generator.webp"
                    alt="AI receipt generator"
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS — with visual icons
         ════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fffbf5', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }} className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            id="how-h"
            ref={r('how-h')}
            className={`text-center mb-20 transition-all duration-700 ${v('how-h') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className="font-body font-medium tracking-wide uppercase text-sm mb-3" style={{ color: '#6b7280' }}>How it works</p>
            <h2 className="font-display text-4xl sm:text-5xl leading-tight" style={{ color: '#111827' }}>
              Three steps, one minute
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-gray-200 rounded-2xl overflow-hidden">
            {[
              {
                id: 'hw1',
                num: '01',
                icon: FiLayout,
                title: 'Pick a template',
                desc: 'Browse 100+ industry-specific templates. Each one is pre-formatted with the right fields, layout, and structure.',
              },
              {
                id: 'hw2',
                num: '02',
                icon: FiEdit3,
                title: 'Add your details',
                desc: 'Fill in business info, line items, prices, and tax. See changes live as you type with instant preview.',
              },
              {
                id: 'hw3',
                num: '03',
                icon: FiDownload,
                title: 'Download',
                desc: 'Export a high-quality PNG file. Print it, email it, or save it for your records. Done.',
              },
            ].map((step, i) => (
              <div
                key={step.id}
                id={step.id}
                ref={r(step.id)}
                className={`bg-white p-8 lg:p-12 transition-all duration-700 ${v(step.id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#f0fdfa' }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: '#0d9488' }} />
                  </div>
                  <div className="font-display text-5xl leading-none" style={{ color: '#e5e7eb' }}>{step.num}</div>
                </div>
                <h3 className="font-body text-xl font-bold mb-3" style={{ color: '#111827' }}>{step.title}</h3>
                <p className="font-body leading-relaxed" style={{ color: '#6b7280' }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div
            id="how-c"
            ref={r('how-c')}
            className={`text-center mt-14 transition-all duration-700 ${v('how-c') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <Link
              href="/templates"
              className="font-body inline-flex items-center gap-2.5 px-8 py-4 font-medium rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
            >
              Create your first receipt
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIAL — large pull quote
         ════════════════════════════════════════ */}
      <section className="bg-white py-24 lg:py-32">
        <div
          id="testi"
          ref={r('testi')}
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${v('testi') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <div className="text-center">
            <div className="font-display text-8xl leading-none mb-2 select-none" style={{ color: '#e5e7eb' }}>&ldquo;</div>
            <blockquote className="font-display text-2xl sm:text-3xl lg:text-4xl leading-snug mb-8" style={{ color: '#1f2937' }}>
              Receipt Generator saved me hours of work. I needed to recreate receipts for expense reports and this tool made it incredibly simple.
            </blockquote>
            <div className="font-body">
              <span className="font-bold" style={{ color: '#111827' }}>Sarah Chen</span>
              <span className="mx-2" style={{ color: '#d1d5db' }}>·</span>
              <span style={{ color: '#6b7280' }}>Small Business Owner</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PRICING — clean two-column
         ════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fffbf5', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }} className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            id="pr-h"
            ref={r('pr-h')}
            className={`text-center mb-16 transition-all duration-700 ${v('pr-h') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <p className="font-body font-medium tracking-wide uppercase text-sm mb-3" style={{ color: '#6b7280' }}>Pricing</p>
            <h2 className="font-display text-4xl sm:text-5xl leading-tight mb-4" style={{ color: '#111827' }}>
              Free to start, simple to upgrade
            </h2>
            <p className="font-body text-lg" style={{ color: '#6b7280' }}>No hidden fees. Cancel anytime.</p>
          </div>

          <div
            id="pr-c"
            ref={r('pr-c')}
            className={`grid md:grid-cols-2 gap-6 max-w-3xl mx-auto transition-all duration-700 ${v('pr-c') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {/* Free */}
            <div className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-200">
              <div className="font-body text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#6b7280' }}>Free</div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-display text-5xl" style={{ color: '#111827' }}>$0</span>
                <span className="font-body" style={{ color: '#6b7280' }}>/forever</span>
              </div>
              <ul className="font-body space-y-3.5 mb-10 text-[0.95rem]">
                {[
                  { t: 'All 100+ templates', on: true },
                  { t: 'Full customization', on: true },
                  { t: 'Live preview', on: true },
                  { t: 'Watermarked exports', on: false },
                ].map((i) => (
                  <li key={i.t} className="flex items-center gap-3">
                    <FiCheck className="w-4 h-4 flex-shrink-0" style={{ color: i.on ? '#0d9488' : '#d1d5db' }} />
                    <span style={{ color: i.on ? '#374151' : '#d1d5db' }}>{i.t}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/templates"
                className="font-body block w-full text-center py-3.5 border border-gray-200 font-medium rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all"
                style={{ color: '#374151' }}
              >
                Get started free
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-2xl p-8 lg:p-10 border-2 relative shadow-lg" style={{ borderColor: '#0d9488' }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="font-body text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide" style={{ backgroundColor: '#0d9488', color: '#ffffff' }}>
                  Recommended
                </span>
              </div>
              <div className="font-body text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#0d9488' }}>Premium</div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="font-display text-5xl" style={{ color: '#111827' }}>$9.99</span>
                <span className="font-body" style={{ color: '#6b7280' }}>/month</span>
              </div>
              <ul className="font-body space-y-3.5 mb-10 text-[0.95rem]">
                {['Everything in Free', 'No watermarks', 'Priority support', 'Save unlimited templates'].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <FiCheck className="w-4 h-4 flex-shrink-0" style={{ color: '#0d9488' }} />
                    <span style={{ color: '#374151' }}>{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="font-body block w-full text-center py-3.5 font-medium rounded-full transition-all shadow-md"
                style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
              >
                Get Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
         ════════════════════════════════════════ */}
      <Testimonials />

      {/* ════════════════════════════════════════
          FINAL CTA
         ════════════════════════════════════════ */}
      <section className="bg-white py-24 lg:py-32">
        <div
          id="cta"
          ref={r('cta')}
          className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${v('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h2 className="font-display text-4xl sm:text-5xl leading-tight mb-5" style={{ color: '#111827' }}>
            Ready to get started?
          </h2>
          <p className="font-body text-lg mb-10 max-w-xl mx-auto" style={{ color: '#6b7280' }}>
            Join 50,000+ users. Create your first receipt in under 30 seconds — no account required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/templates"
              className="font-body inline-flex items-center gap-2.5 px-8 py-4 font-medium rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-base"
              style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
            >
              Browse templates
              <FiArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/ai"
              className="font-body inline-flex items-center gap-2 px-8 py-4 font-medium rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-base"
              style={{ color: '#4b5563' }}
            >
              Try AI Generator
              <FiArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
