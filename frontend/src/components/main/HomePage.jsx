import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import './HomePage.css'

/* ============================================
   STATIC DATA
   ============================================ */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Models',   href: '#models' },
  { label: 'Pricing',  href: '#pricing' },
  { label: 'Docs',     href: '#docs' },
  { label: 'Blog',     href: '#blog' }
]

const STATS = [
  { num: '50K+',   label: 'Active Developers', icon: '👥' },
  { num: '2.4B+',  label: 'Tokens Processed', icon: '⚡' },
  { num: '99.9%',  label: 'Uptime SLA', icon: '🛡️' },
  { num: '<100ms', label: 'Avg Response', icon: '🚀' }
]

const FEATURES = [
  {
    icon: '🧠',
    title: 'Advanced Reasoning',
    desc: 'Multi-step logical thinking that breaks down complex problems into clear, accurate solutions.',
    color: 'purple'
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'Stream responses in milliseconds. Our optimized inference engine delivers sub-100ms latency.',
    color: 'cyan'
  },
  {
    icon: '🎨',
    title: 'Creative Generation',
    desc: 'Generate images, code, copy, and music. One API, infinite creative possibilities.',
    color: 'pink'
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    desc: 'SOC 2 Type II compliant with end-to-end encryption and zero data retention policy.',
    color: 'blue'
  },
  {
    icon: '🌐',
    title: '100+ Languages',
    desc: 'Native-level fluency across 100+ languages with cultural context awareness.',
    color: 'green'
  },
  {
    icon: '🛠️',
    title: 'Developer First',
    desc: 'Clean REST API, TypeScript SDK, comprehensive docs, and instant code examples.',
    color: 'orange'
  }
]

const MODELS = [
  {
    name: 'SuperAssist Ultra',
    badge: 'Most Powerful',
    badgeClass: 'badge-purple',
    desc: 'Our flagship model with PhD-level reasoning across all domains.',
    speed: 95,
    intelligence: 100,
    cost: 5
  },
  {
    name: 'SuperAssist Pro',
    badge: 'Balanced',
    badgeClass: 'badge-blue',
    desc: 'Optimal balance of intelligence, speed, and cost for production workloads.',
    speed: 98,
    intelligence: 90,
    cost: 3
  },
  {
    name: 'SuperAssist Lite',
    badge: 'Fastest',
    badgeClass: 'badge-cyan',
    desc: 'Ultra-fast responses for chat, classification, and real-time applications.',
    speed: 100,
    intelligence: 75,
    cost: 1
  },
  {
    name: 'SuperAssist Vision',
    badge: 'Multimodal',
    badgeClass: 'badge-pink',
    desc: 'Native image and video understanding with state-of-the-art accuracy.',
    speed: 88,
    intelligence: 92,
    cost: 4
  }
]

const USE_CASES = [
  { icon: '💬', title: 'Conversational AI',   desc: 'Chatbots & assistants' },
  { icon: '📝', title: 'Content Creation',    desc: 'Articles, blogs, copy' },
  { icon: '💻', title: 'Code Generation',     desc: 'Build apps 10× faster' },
  { icon: '📊', title: 'Data Analysis',       desc: 'Insights from any data' },
  { icon: '🖼️', title: 'Image Generation',    desc: 'Studio-quality visuals' },
  { icon: '🎙️', title: 'Speech & Audio',      desc: 'Natural voice synthesis' },
  { icon: '🔍', title: 'Semantic Search',     desc: 'Find anything instantly' },
  { icon: '🤖', title: 'Autonomous Agents',   desc: 'Multi-step task automation' }
]

const TESTIMONIALS = [
  {
    quote: "SuperAssist transformed our product. We shipped features 10× faster and our users love the conversational experience. The API is rock solid.",
    author: "Sarah Chen",
    role: "CTO at Vercel-style startup",
    avatar: "SC",
    rating: 5
  },
  {
    quote: "The reasoning capabilities are unmatched. SuperAssist Ultra solved problems that took our team weeks in under a minute. Truly magical technology.",
    author: "Marcus Rodriguez",
    role: "Lead Engineer at Fortune 500",
    avatar: "MR",
    rating: 5
  },
  {
    quote: "We replaced three different AI vendors with SuperAssist. Better quality, simpler API, and 60% cost reduction. No-brainer migration.",
    author: "Emily Watson",
    role: "Founder, AI Startup",
    avatar: "EW",
    rating: 5
  }
]

const PRICING = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for exploring and small projects',
    features: [
      '1,000 API requests / month',
      'Access to SuperAssist Lite',
      'Community support',
      'Basic documentation',
      'Standard rate limits'
    ],
    cta: 'Start Free',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/ month',
    desc: 'For professional developers and teams',
    features: [
      '100,000 API requests / month',
      'Access to all models',
      'Priority support',
      'Advanced analytics',
      'Custom fine-tuning',
      'Team collaboration',
      '99.9% uptime SLA'
    ],
    cta: 'Start 14-day Trial',
    highlighted: true,
    badge: 'Most Popular'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large-scale mission-critical deployments',
    features: [
      'Unlimited API requests',
      'Dedicated infrastructure',
      '24/7 dedicated support',
      'Custom model training',
      'On-premise deployment',
      'Advanced security',
      'SLA guarantees',
      'Personal account manager'
    ],
    cta: 'Contact Sales',
    highlighted: false
  }
]

const FOOTER_LINKS = {
  Product:   ['Features', 'Pricing', 'Models', 'API', 'Changelog'],
  Resources: ['Documentation', 'Tutorials', 'Blog', 'Community', 'Status'],
  Company:   ['About', 'Careers', 'Press', 'Contact', 'Partners'],
  Legal:     ['Privacy', 'Terms', 'Security', 'Compliance', 'Cookies']
}

/* ============================================
   SUB-COMPONENTS
   ============================================ */

function Logo({ size = 'normal' }) {
  return (
    <div className={`nx-logo nx-logo-${size}`}>
      <div className="nx-logo-mark">
        <div className="nx-logo-glow" />
        <svg viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%"   stopColor="#a78bfa" />
              <stop offset="50%"  stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path d="M16 2L4 9v14l12 7 12-7V9L16 2z"
                stroke="url(#lg)" strokeWidth="2" fill="rgba(139,92,246,0.1)" />
          <circle cx="16" cy="16" r="4" fill="url(#lg)" />
          <circle cx="16" cy="16" r="7" stroke="url(#lg)" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>
      <span className="nx-logo-text">SuperAssist</span>
    </div>
  )
}

function ParticleField({ count = 35 }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * -25,
      opacity: Math.random() * 0.5 + 0.2
    }))
  )
  return (
    <div className="nx-particles" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="nx-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  )
}

function CodeDemo() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const fullCode = `import { SuperAssist } from '@superassist/sdk'

const ai = new SuperAssist({ apiKey: 'your-key' })

const response = await ai.chat({
  model: 'superassist-ultra',
  messages: [
    { role: 'system', content: 'You are a helpful AI.' },
    { role: 'user',   content: 'Explain quantum computing' }
  ],
  stream: true
})

for await (const chunk of response) {
  process.stdout.write(chunk.content)
}`
  const [step, setStep] = useState('typing')

  useEffect(() => {
    let timeout
    if (step === 'typing') {
      if (text.length < fullCode.length) {
        timeout = setTimeout(() => {
          setText(fullCode.slice(0, text.length + 1))
        }, 15)
      } else {
        timeout = setTimeout(() => setStep('pausing'), 2000)
      }
    } else if (step === 'pausing') {
      timeout = setTimeout(() => setStep('deleting'), 1000)
    } else if (step === 'deleting') {
      if (text.length > 0) {
        timeout = setTimeout(() => {
          setText(fullCode.slice(0, text.length - 1))
        }, 5)
      } else {
        setStep('typing')
      }
    }
    return () => clearTimeout(timeout)
  }, [text, step])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  return (
    <div className="nx-code-window">
      <div className="nx-code-header">
        <div className="nx-code-dots">
          <span /><span /><span />
        </div>
        <div className="nx-code-tabs">
          <span className="nx-code-tab active">app.js</span>
          <span className="nx-code-tab">api.py</span>
          <span className="nx-code-tab">config.json</span>
        </div>
        <button className={`nx-code-copy ${copied ? 'copied' : ''}`} onClick={handleCopy} aria-label="Copy code">
          {copied ? (
            <>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="nx-code-body">
        <pre className="nx-code-pre">
          <code className="nx-code-content">
            {text}
            <span className="nx-cursor">|</span>
          </code>
        </pre>
      </div>
      <div className="nx-code-status">
        <span className="nx-status-dot" />
        <span>Connected to SuperAssist Ultra</span>
        <span className="nx-status-sep">•</span>
        <span>Streaming response</span>
      </div>
    </div>
  )
}

/* ============================================
   MAIN COMPONENT
   ============================================ */

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [billingCycle, setBillingCycle] = useState('monthly')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.nx-reveal').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="nx-home">
      {/* ============ BACKGROUND ============ */}
      <div className="nx-bg" aria-hidden="true">
        <div className="nx-mesh" />
        <div className="nx-grid" />
        <div className="nx-orb nx-orb-1" />
        <div className="nx-orb nx-orb-2" />
        <div className="nx-orb nx-orb-3" />
        <ParticleField />
      </div>

      {/* ============ NAVBAR ============ */}
      <nav className={`nx-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nx-nav-container">
          <Link to="/" className="nx-nav-brand">
            <Logo />
          </Link>

          <ul className="nx-nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          <div className="nx-nav-actions">
            <Link to="/signin" className="nx-btn nx-btn-ghost nx-btn-sm">Sign In</Link>
            <Link to="/signup" className="nx-btn nx-btn-primary nx-btn-sm">
              <span>Get Started Free</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <button
              className={`nx-nav-toggle ${mobileOpen ? 'active' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        <div
          className={`nx-nav-mobile ${mobileOpen ? 'open' : ''}`}
          onClick={(e) => e.target === e.currentTarget && setMobileOpen(false)}
        >
          <div className="nx-nav-mobile-inner">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="nx-nav-mobile-actions">
              <Link to="/signin" className="nx-btn nx-btn-ghost" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/signup" className="nx-btn nx-btn-primary" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="nx-hero">
        <div className="nx-hero-content nx-reveal">
          <div className="nx-hero-badge">
            <span className="nx-badge-dot" />
            <span>Now with SuperAssist Ultra — PhD-level reasoning</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>

          <h1 className="nx-hero-title">
            Build the future with{' '}
            <span className="nx-gradient-text">intelligent AI</span>
          </h1>

          <p className="nx-hero-subtitle">
            The most powerful AI platform for developers. State-of-the-art models,
            lightning-fast inference, and an API that just works. From prototype
            to production in minutes.
          </p>

          <div className="nx-hero-actions">
            <Link to="/signup" className="nx-btn nx-btn-primary nx-btn-lg">
              <span>Start Building Free</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <a href="#docs" className="nx-btn nx-btn-outline nx-btn-lg">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span>Watch Demo</span>
            </a>
          </div>

          <div className="nx-hero-trust">
            <span className="nx-trust-label">Trusted by teams at</span>
            <div className="nx-hero-logos">
              {['Google', 'Microsoft', 'Meta', 'Stripe', 'Shopify', 'Vercel'].map((c) => (
                <span key={c} className="nx-trust-logo">{c}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="nx-hero-visual nx-reveal">
          <div className="nx-hero-glow" />
          <CodeDemo />
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="nx-stats nx-reveal">
        <div className="nx-stats-container">
          {STATS.map((stat, i) => (
            <div className="nx-stat" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="nx-stat-icon">{stat.icon}</span>
              <div className="nx-stat-content">
                <span className="nx-stat-num">{stat.num}</span>
                <span className="nx-stat-label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="nx-section" id="features">
        <div className="nx-section-header nx-reveal">
          <span className="nx-section-eyebrow">Why SuperAssist</span>
          <h2 className="nx-section-title">
            Everything you need to build{' '}
            <span className="nx-gradient-text">AI-native products</span>
          </h2>
          <p className="nx-section-sub">
            A complete platform for modern AI development. From inference to
            fine-tuning, we've got you covered.
          </p>
        </div>

        <div className="nx-features-grid">
          {FEATURES.map((f, i) => (
            <div
              className={`nx-feature-card nx-feature-${f.color} nx-reveal`}
              key={i}
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <div className="nx-feature-icon">{f.icon}</div>
              <h3 className="nx-feature-title">{f.title}</h3>
              <p className="nx-feature-desc">{f.desc}</p>
              <div className="nx-feature-glow" />
            </div>
          ))}
        </div>
      </section>

      {/* ============ MODELS ============ */}
      <section className="nx-section nx-models-section" id="models">
        <div className="nx-section-header nx-reveal">
          <span className="nx-section-eyebrow">Model Family</span>
          <h2 className="nx-section-title">
            Choose the right model for{' '}
            <span className="nx-gradient-text">every task</span>
          </h2>
          <p className="nx-section-sub">
            From ultra-fast chat to deep reasoning, our model family powers
            every use case.
          </p>
        </div>

        <div className="nx-models-grid">
          {MODELS.map((model, i) => (
            <div className="nx-model-card nx-reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="nx-model-header">
                <h3>{model.name}</h3>
                <span className={`nx-badge ${model.badgeClass}`}>{model.badge}</span>
              </div>
              <p className="nx-model-desc">{model.desc}</p>
              <div className="nx-model-stats">
                <div className="nx-model-stat">
                  <div className="nx-model-stat-label">
                    <span>Speed</span>
                    <span>{model.speed}%</span>
                  </div>
                  <div className="nx-model-bar">
                    <div className="nx-model-bar-fill" style={{ width: `${model.speed}%` }} />
                  </div>
                </div>
                <div className="nx-model-stat">
                  <div className="nx-model-stat-label">
                    <span>Intelligence</span>
                    <span>{model.intelligence}%</span>
                  </div>
                  <div className="nx-model-bar">
                    <div className="nx-model-bar-fill" style={{ width: `${model.intelligence}%` }} />
                  </div>
                </div>
                <div className="nx-model-stat">
                  <div className="nx-model-stat-label">
                    <span>Cost Efficiency</span>
                    <span>{model.cost}/5</span>
                  </div>
                  <div className="nx-model-bar">
                    <div className="nx-model-bar-fill" style={{ width: `${(model.cost / 5) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ USE CASES ============ */}
      <section className="nx-section">
        <div className="nx-section-header nx-reveal">
          <span className="nx-section-eyebrow">Use Cases</span>
          <h2 className="nx-section-title">
            One platform,{' '}
            <span className="nx-gradient-text">endless possibilities</span>
          </h2>
        </div>

        <div className="nx-usecases-grid">
          {USE_CASES.map((u, i) => (
            <div className="nx-usecase nx-reveal" key={i} style={{ transitionDelay: `${i * 0.04}s` }}>
              <div className="nx-usecase-icon">{u.icon}</div>
              <h4>{u.title}</h4>
              <p>{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="nx-section" id="testimonials">
        <div className="nx-section-header nx-reveal">
          <span className="nx-section-eyebrow">Loved by developers</span>
          <h2 className="nx-section-title">
            What our <span className="nx-gradient-text">community says</span>
          </h2>
        </div>

        <div className="nx-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="nx-testimonial nx-reveal" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="nx-testimonial-stars">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j}>★</span>
                ))}
              </div>
              <p className="nx-testimonial-quote">"{t.quote}"</p>
              <div className="nx-testimonial-author">
                <div className="nx-testimonial-avatar">{t.avatar}</div>
                <div>
                  <strong>{t.author}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="nx-section" id="pricing">
        <div className="nx-section-header nx-reveal">
          <span className="nx-section-eyebrow">Pricing</span>
          <h2 className="nx-section-title">
            Simple, <span className="nx-gradient-text">transparent pricing</span>
          </h2>
          <p className="nx-section-sub">
            Start free, scale infinitely. No hidden fees, no surprises.
          </p>

          <div className="nx-billing-toggle">
            <button
              className={billingCycle === 'monthly' ? 'active' : ''}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={billingCycle === 'yearly' ? 'active' : ''}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly
              <span className="nx-save-badge">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="nx-pricing-grid">
          {PRICING.map((plan, i) => (
            <div
              className={`nx-pricing-card ${plan.highlighted ? 'highlighted' : ''} nx-reveal`}
              key={i}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              {plan.badge && <span className="nx-pricing-badge">{plan.badge}</span>}
              <h3 className="nx-pricing-name">{plan.name}</h3>
              <div className="nx-pricing-price">
                <span className="nx-price-amount">
                  {billingCycle === 'yearly' && plan.price === '$49' ? '$39' : plan.price}
                </span>
                <span className="nx-price-period">{plan.period}</span>
              </div>
              <p className="nx-pricing-desc">{plan.desc}</p>
              <ul className="nx-pricing-features">
                {plan.features.map((f, j) => (
                  <li key={j}>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.cta === 'Contact Sales' ? '/contact' : '/signup'}
                className={`nx-btn ${plan.highlighted ? 'nx-btn-primary' : 'nx-btn-outline'} nx-btn-full`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="nx-cta-section nx-reveal">
        <div className="nx-cta-card">
          <div className="nx-cta-glow" />
          <h2>Ready to build the future?</h2>
          <p>Join 50,000+ developers building with SuperAssist. Get started in seconds.</p>
          <div className="nx-cta-actions">
            <Link to="/signup" className="nx-btn nx-btn-primary nx-btn-lg">
              <span>Get Started Free</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <a href="#contact" className="nx-btn nx-btn-ghost nx-btn-lg">Talk to Sales</a>
          </div>
          <p className="nx-cta-note">No credit card required • Free tier available</p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="nx-footer">
        <div className="nx-footer-container">
          <div className="nx-footer-brand">
            <Logo />
            <p>The most powerful AI platform for modern developers. Build, ship, and scale with confidence.</p>
            <div className="nx-footer-socials">
              {[
                { name: 'Twitter', icon: '𝕏' },
                { name: 'GitHub', icon: '⌨' },
                { name: 'Discord', icon: '💬' },
                { name: 'LinkedIn', icon: 'in' }
              ].map((s) => (
                <a href="#" key={s.name} className="nx-social-link" aria-label={s.name}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div className="nx-footer-col" key={category}>
              <h4>{category}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link}><a href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="nx-footer-bottom">
          <p>© 2025 SuperAssist. All rights reserved.</p>
          <p>Crafted with 💜 for the AI community</p>
        </div>
      </footer>
    </div>
  )
}