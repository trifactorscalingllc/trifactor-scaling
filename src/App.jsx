import React, { useEffect, useState, useRef } from 'react';
import { ArrowUpRight, Code, Presentation, Rocket, Layers, Play, CheckCircle2, Star, ExternalLink, Menu, X } from 'lucide-react';

// --- Animations ---

const GlobalBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let nodes = [];
    let animationFrameId;

    const createNodes = () => {
      nodes = [];
      const numNodes = window.innerWidth > 768 ? 60 : 30; // responsive
      for (let i = 0; i < numNodes; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      nodes.forEach((n, i) => {
        n.x += n.vx;
        n.y += n.vy;

        // Wrap around
        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? '#ff4500' : (i % 3 === 1 ? '#007bff' : 'rgba(255, 255, 255, 0.3)');
        ctx.fill();

        // Connect nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            let strokeColor = '255, 255, 255';
            if (i % 3 === 0) strokeColor = '255, 69, 0'; // Orange/Red
            else if (i % 3 === 1) strokeColor = '0, 123, 255'; // Blue
            ctx.strokeStyle = `rgba(${strokeColor}, ${0.15 - dist / 800})`;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    createNodes();
    draw();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      createNodes();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, overflow: 'hidden', pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', opacity: 0.5, position: 'relative', zIndex: 1 }} />
    </div>
  );
};

const WebDevAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let animationFrameId;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.05;

      const yOffset = Math.sin(time) * 10;
      const bw = 180;
      const bh = 110;
      const bx = (width - bw) / 2;
      const by = (height - bh) / 2 + yOffset;

      // Draw floating browser window
      ctx.fillStyle = 'rgba(15, 15, 15, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      // Browser Header bar
      ctx.beginPath();
      ctx.moveTo(bx, by + 24);
      ctx.lineTo(bx + bw, by + 24);
      ctx.stroke();

      // Browser Dots
      const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
      dotColors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(bx + 15 + i * 12, by + 12, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Simple wireframe code lines inside
      ctx.fillStyle = 'rgba(0, 123, 255, 0.6)';
      ctx.fillRect(bx + 20, by + 40, 80, 8);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(bx + 20, by + 56, 120, 6);
      ctx.fillRect(bx + 20, by + 68, 100, 6);
      ctx.fillRect(bx + 20, by + 80, 60, 6);

      // Glow effect underneath
      ctx.shadowColor = 'rgba(0, 123, 255, 0.3)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 20;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '140px', display: 'block', marginBottom: '1.5rem' }} />;
};

const TargetingAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let animationFrameId;

    let particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: width / 2 - 50 + Math.random() * 100,
        y: height / 2 - 80 - Math.random() * 100,
        speed: 1 + Math.random() * 2,
        size: Math.random() * 2 + 1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw Funnel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';

      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 30);
      ctx.lineTo(cx + 60, cy - 30);
      ctx.lineTo(cx + 15, cy + 20);
      ctx.lineTo(cx + 15, cy + 50);
      ctx.lineTo(cx - 15, cy + 50);
      ctx.lineTo(cx - 15, cy + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw falling particles
      particles.forEach(p => {
        p.y += p.speed;

        // Funnel constriction
        if (p.y > cy - 30 && p.y < cy + 20) {
          p.x += (cx - p.x) * 0.06;
        }

        // Reset
        if (p.y > cy + 60) {
          p.y = cy - 60 - Math.random() * 60;
          p.x = cx - 50 + Math.random() * 100;
        }

        ctx.fillStyle = p.y > cy + 20 ? '#ff4500' : 'rgba(255,255,255,0.6)';
        ctx.shadowColor = p.y > cy + 20 ? 'rgba(255, 69, 0, 0.5)' : 'transparent';
        ctx.shadowBlur = p.y > cy + 20 ? 10 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '140px', display: 'block', marginBottom: '1.5rem' }} />;
};

const BrandAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let animationFrameId;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      const cx = width / 2;
      const cy = height / 2;

      const scale = 1 + Math.sin(time * 2) * 0.15;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.5);
      ctx.scale(scale, scale);

      ctx.shadowColor = 'rgba(0, 123, 255, 0.5)';
      ctx.shadowBlur = 25;

      // Draw Star/Diamond
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        ctx.lineTo(0, -35);
        ctx.lineTo(8, -8);
        ctx.rotate(Math.PI / 2);
      }
      ctx.closePath();

      ctx.fillStyle = 'rgba(0, 123, 255, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#007bff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Outer ring
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '140px', display: 'block', marginBottom: '1.5rem' }} />;
};


// --- Main Components ---
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

const App = () => {
  useScrollReveal();
  return (
    <>
      <GlobalBackground />
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <PortfolioSection />
        <TestimonialsSection />
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="logo-text" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="TriFactor Scaling Logo" style={{ height: '40px', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.2))' }} />
        </div>

        <nav className="nav desktop-nav">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#reviews">Reviews</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-cta">
          <a href="#contact" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Start a Project</a>
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <a href="#work" onClick={() => setMobileMenuOpen(false)}>Work</a>
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#reviews" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
        </div>
      )}
    </header>
  );
};

const HeroSection = () => (
  <section className="hero">
    <div className="glow-blur glow-left-orange" style={{ position: 'absolute', top: '-10%', left: '-10%', zIndex: 0 }}></div>
    <div className="glow-blur glow-right-blue" style={{ position: 'absolute', top: '10%', right: '-10%', zIndex: 0 }}></div>
    <div className="container hero-content animate-fade-up delay-100">

      <h1 className="display-title">
        Build a Brand<br />
        <span className="text-secondary">That Scales.</span>
      </h1>

      <p className="hero-description" style={{ fontSize: '1.2rem', color: 'var(--text-primary)', textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>
        Grow your business without the stress. We build the websites and marketing systems that do the heavy lifting for you.
      </p>

      <div className="hero-actions">
        <a href="#contact" className="btn btn-primary" style={{ fontSize: '1rem', background: '#0a0a0a' }}>
          Get Started - Free
        </a>
        <a href="#work" className="btn btn-secondary">
          View Pricing
        </a>
      </div>
    </div>

    {/* Trust Bar */}
    <div className="container" style={{ position: 'relative', zIndex: 10, marginTop: '3rem' }}>
      <div className="trust-bar animate-fade-up delay-200">
        <div className="trust-item">
          <h4>50+</h4>
          <p>Projects Delivered</p>
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <h4>3x</h4>
          <p>Average ROI</p>
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <h4>100%</h4>
          <p>Client Satisfaction</p>
        </div>
      </div>
    </div>
  </section>
);

const ServicesSection = () => {
  const services = [
    {
      num: "01.",
      title: "Web Development",
      desc: "Fast, reliable, and built to convert. Your digital foundation starts here.",
      icon: <Code size={24} />,
      col: "col-8",
      animation: <WebDevAnimation />
    },
    {
      num: "02.",
      title: "Sales Funnels",
      desc: "Turn clicks into clients. We build automated paths that drive real revenue.",
      icon: <Rocket size={24} />,
      col: "col-4",
      animation: <TargetingAnimation />
    },
    {
      num: "03.",
      title: "Brand Strategy",
      desc: "A clear message and a premium look. Stand out from the crowd instantly.",
      icon: <Presentation size={24} />,
      col: "col-12",
      animation: <BrandAnimation />
    }
  ];

  return (
    <section id="services" className="section">
      <div className="container">
        <div style={{ marginBottom: '4rem' }}>
          <h2 className="section-title animate-fade-up">What We Do</h2>
        </div>

        <div className="bento-grid animate-fade-up delay-100">
          {services.map((svc, idx) => (
            <div key={idx} className="bento-card col-4 fusion-service-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div className="fusion-card-graphic" style={{
                background: 'linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(5,5,5,1) 100%)',
                borderRadius: '12px',
                padding: '2rem 1rem',
                marginBottom: '2rem',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Subtle internal glows mimicking image 4 */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(0,123,255,0.2) 0%, transparent 70%)', filter: 'blur(30px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(255,69,0,0.2) 0%, transparent 70%)', filter: 'blur(30px)' }}></div>
                <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                  {svc.animation}
                </div>
              </div>
              <h3 style={{ display: 'flex', gap: '0.5rem', fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '600', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {svc.num[1]} {/* gets '1' from '01.' */}
                </span>
                {svc.title}
              </h3>
              <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{svc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PortfolioSection = () => {
  const projects = [
    { num: "01.", title: "Cut By Dack", tags: "Web Design | Premium barbershop experience", link: "https://cutbydack.com" },
    { num: "02.", title: "Lead Compass", tags: "Web App | B2B lead generation platform", link: "https://leadcompass.pro" },
    { num: "03.", title: "Mectrix Media", tags: "Branding | Digital agency rebrand", link: "https://mectrixmedia.com" }
  ];

  return (
    <section id="work" className="section" style={{ borderTop: '1px solid var(--border-color)', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}>
      <div className="container">
        <h2 className="section-title animate-fade-up" style={{ marginBottom: '4rem' }}>Selected Work</h2>

        <div className="bento-grid">
          {projects.map((p, idx) => (
            <div key={idx} className="portfolio-item col-4 animate-fade-up">
              <div className="portfolio-content" style={{ marginBottom: '1rem', flex: 1 }}>
                <span className="text-secondary portfolio-num">{p.num}</span>
                <div>
                  <h3 className="portfolio-title">{p.title}</h3>
                  <p className="text-secondary portfolio-tags">{p.tags}</p>
                </div>
              </div>
              <div className="browser-mockup">
                <div className="browser-header">
                  <div className="browser-dot" style={{ background: '#ff5f56' }}></div>
                  <div className="browser-dot" style={{ background: '#ffbd2e' }}></div>
                  <div className="browser-dot" style={{ background: '#27c93f' }}></div>
                </div>
                <div className="iframe-container">
                  <iframe src={p.link} title={p.title} loading="lazy" scrolling="no"></iframe>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const reviews = [
    {
      quote: "Evan and Gavin helped me turn my product into a real brand. I can't thank them enough for the help they gave!",
      author: "Aiden A.",
      company: "Lumina Sphere"
    },
    {
      quote: "I reached out to Evan to build our website. I was very impressed with the pricing and how simple the process was with his team. The website is absolutely amazing! We will be using their website building services again in the future. Thanks, Evan, for the great experience. We look forward to working with you all again!",
      author: "Jordan",
      company: "Mectrix Media"
    },
    {
      quote: "Great service. Scaled my brand up from nothing \uD83E\uDEE1", // Salute emoji
      author: "Vultus Worldwide",
      company: ""
    }
  ];

  return (
    <section id="reviews" className="section">
      <div className="container">
        <h2 className="section-title text-center animate-fade-up" style={{ marginBottom: '4rem' }}>What They Say</h2>

        <div className="bento-grid">
          {reviews.map((r, i) => (
            <div key={i} className={`bento-card col-4 testimonial-card animate-fade-up delay-${(i % 3 + 1) * 100}`}>
              <div style={{ color: '#007bff', marginBottom: '1.5rem', display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} fill="currentColor" />)}
              </div>
              <p style={{ fontSize: '1rem', fontStyle: 'italic', marginBottom: '2rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>"{r.quote}"</p>

              <div className="testimonial-header">
                <div className="avatar"></div>
                <div>
                  <div style={{ fontWeight: 500 }}>{r.author}</div>
                  {r.company && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.company}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="glow-blur glow-left-orange" style={{ top: '30%', opacity: 0.5 }}></div>
    </section>
  );
};

const AboutSection = () => (
  <section id="about" className="section" style={{ position: 'relative' }}>
    <div className="container" style={{ position: 'relative', zIndex: 2 }}>
      <div className="bento-card col-12 animated-edge animate-fade-up delay-200" style={{ padding: '5rem 3rem' }}>
        <h3 className="text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem', marginBottom: '1rem' }}>Who We Are</h3>
        <h2 className="display-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1.5rem' }}>Engineered for <span style={{ background: 'linear-gradient(90deg, #ff4500, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Success.</span></h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '800px', lineHeight: 1.7 }}>
          TriFactor Scaling is all about clear communication and getting the job done right. We build digital setups meant to last and grow over time. We focus on what actually works, skipping the fluff to deliver systems that bring you consistent, reliable results.
        </p>
      </div>
    </div>
    <div className="glow-blur glow-right-blue" style={{ top: '10%', opacity: 0.6 }}></div>
  </section>
);

const CTASection = () => (
  <section id="contact" className="section text-center" style={{ position: 'relative' }}>
    <div className="container" style={{ position: 'relative', zIndex: 2 }}>
      <div className="bento-card col-12 animate-fade-up delay-100" style={{ padding: '6rem 2rem', border: 'none', background: 'transparent', boxShadow: 'none' }}>
        <h2 className="display-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem' }}>Let's Build Something<br /><span style={{ background: 'linear-gradient(90deg, #007bff, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Extraordinary</span></h2>
        <p className="text-secondary" style={{ margin: '0 auto 3rem', fontSize: '1.2rem', maxWidth: '600px' }}>Book a free strategy chat to see how we can speed up your growth.</p>

        <div className="animate-fade-up delay-300" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', background: 'linear-gradient(90deg, #ff4500, #007bff)', border: 'none', color: '#fff', boxShadow: '0 10px 30px rgba(0, 123, 255, 0.3)' }}>
            Initialize Workflow
          </button>
          <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Free 30-minute systemic review • No commitment required
          </span>
        </div>
      </div>
    </div>
    <div className="glow-blur glow-left-orange" style={{ width: '800px', height: '800px', bottom: '-20%', left: '50%', transform: 'translateX(-50%)', opacity: 0.3 }}></div>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <div className="logo-text" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="TriFactor Scaling Logo" style={{ height: '48px', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.1))' }} />
          </div>
          <p className="text-secondary" style={{ maxWidth: '300px', fontSize: '1.1rem' }}>Build a Brand That Scales.</p>
        </div>

        <div>
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#reviews">Reviews</a>
            <a href="#about">About</a>
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Contact</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <p>Allentown, PA</p>
            <a href="mailto:contact@trifactorscaling.com">contact@trifactorscaling.com</a>
            <a href="tel:4848602177">(484) 860-2177</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>
        <p>&copy; 2026 TriFactor Scaling LLC. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default App;
