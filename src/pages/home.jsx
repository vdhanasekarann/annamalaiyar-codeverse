import { useState } from "react";
import "../website.css";
import Logo from "../assets/Logo.svg"; // or your logo.png if you prefer
import EnquiryForm from "../components/EnquiryForm";
import { useEffect } from "react";

export default function Home() {
  const [active, setActive] = useState("web");

useEffect(() => {
  const onScroll = () => {
    const s = window.scrollY || window.pageYOffset;
    // Move slow layer subtly
    const slow = document.getElementById("wave-slow");
    const fast = document.getElementById("wave-fast");
    if (slow) slow.style.transform = `translateY(${s * -0.03}px)`;
    if (fast) fast.style.transform = `translateY(${s * -0.06}px)`;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);

  const handleNavClick = (id) => {
    setActive(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openContact = () => handleNavClick("contact");
  const openPricing = () => handleNavClick("pricing");

  const handleEnquirySubmit = async (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const payload = {
    name: form.get("name"),
    email: form.get("email"),
    projectType: form.get("projectType"),
    budget: form.get("budget"),
    details: form.get("details"),
  };

  try {
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed");

    alert("✅ Thank you! We received your enquiry.");
    e.target.reset();
  } catch (err) {
    alert("❌ Failed to send enquiry. Please try again.");
    console.error(err);
  }
};

  return (
    <>
      {/* HEADER */}
      <header className="header">
  <div className="logo-box">
    <img src={Logo} className="logo-img" alt="CodeVerse Logo" />
  </div>
  <div className="company-info">
    <h1>Annamalaiyar CodeVerse</h1>
    <p>Innovating Digital Solutions that Transform Business</p>
  </div>
</header>
      {/* HERO BANNER */}
      <section className="hero-banner">
          <div className="banner-svg-wrapper" aria-hidden="true" role="img">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Annamalaiyar CodeVerse cyber wave background">
  <defs>
    <linearGradient id="gNeon" x1="0" x2="1">
      <stop offset="0" stop-color="#7be3ff"/>
      <stop offset="1" stop-color="#7b6bff"/>
    </linearGradient>
    <linearGradient id="gNeon2" x1="0" x2="1">
      <stop offset="0" stop-color="#2aa7ff"/>
      <stop offset="1" stop-color="#7b6bff"/>
    </linearGradient>
    <filter id="blurSmall">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="#070916"/>

  # starfield
  <g opacity="0.18" fill="#9fcfff">
    <circle cx="120" cy="80" r="1.2"/>
    <circle cx="180" cy="200" r="1"/>
    <circle cx="300" cy="120" r="1.6"/>
    <circle cx="500" cy="80" r="1"/>
    <circle cx="900" cy="160" r="1.2"/>
    <circle cx="1400" cy="40" r="1.4"/>
  </g>

  # moving neon strands group 1 (parallax layer - slow)
  <g id="wave-slow" transform="translate(0,120)">
    <path d="M-50 160 C150 40, 350 40, 550 160 C750 280, 950 280, 1150 160 C1350 40, 1550 40, 1750 160"
      fill="none" stroke="url(#gNeon)" stroke-width="2.8" stroke-linecap="round" opacity="0.85" filter="url(#blurSmall)"/>
    <g stroke="url(#gNeon)" stroke-width="1.6" stroke-linecap="round">
      <path d="M120 200 L140 180 L200 180 L220 160"/>
      <path d="M420 200 L460 160 L520 160 L560 120"/>
      <path d="M820 200 L860 160 L920 160 L980 120"/>
    </g>
    <g fill="#dff9ff">
      <circle cx="200" cy="160" r="4"/>
      <circle cx="520" cy="120" r="3.5"/>
      <circle cx="860" cy="160" r="4"/>
      <circle cx="1200" cy="120" r="3.5"/>
    </g>
  </g>

  # moving neon strands group 2 (parallax layer - fast)
  <g id="wave-fast" transform="translate(0,160)">
    <path d="M-50 200 C150 80, 350 80, 550 200 C750 320, 950 320, 1150 200 C1350 80, 1550 80, 1750 200"
      fill="none" stroke="url(#gNeon2)" stroke-width="1.8" stroke-linecap="round" opacity="0.65"/>
  </g>

  # faint grid overlay
  <g opacity="0.04" stroke="#9bb7d9" stroke-width="1">
    <path d="M0 0 L1600 0"/>
    <path d="M0 40 L1600 40"/>
    <path d="M0 80 L1600 80"/>
  </g>

  # brain mesh foreground
  <g transform="translate(980,40) scale(1.1)" opacity="0.95">
    <path d="M120 40 C140 10, 200 10, 240 40 C280 70, 280 120, 240 150 C200 180, 140 180, 120 150 C100 120, 100 70, 120 40 Z"
      fill="url(#gNeon)" opacity="0.08"/>
    <g stroke="url(#gNeon)" stroke-width="1.6" fill="none">
      <path d="M70 80 C90 60, 130 60, 150 80"/>
      <path d="M150 80 C170 100, 170 130, 150 150"/>
      <path d="M70 80 C50 100, 50 130, 70 150"/>
    </g>
  </g>

  # center overlay glow
  <radialGradient id="centerGlow" cx="50%" cy="45%">
    <stop offset="0" stop-color="#7be3ff" stop-opacity="0.18"/>
    <stop offset="1" stop-color="#7b6bff" stop-opacity="0"/>
  </radialGradient>
  <circle cx="400" cy="260" r="220" fill="url(#centerGlow)" opacity="0.5"/>
</svg>
</div>
        <div className="banner-inner">

    <div className="banner-content">
      <h2>Neural Software Systems for 2030 Ready Companies</h2>
      <h3 className="banner-highlight">
        Web • Cloud • Mobile • SaaS • AI • Platform Engineering • Automation
      </h3>
      <p className="banner-highlight">
        Full-stack &amp; AI-powered product development for startups and
        enterprises – from idea to deployment.
      </p>
      <div className="banner-tags">
        <span className="banner-tag">React</span>
        <span className="banner-tag">Vite</span>
        <span className="banner-tag">Node.js</span>
        <span className="banner-tag">Firebase</span>
        <span className="banner-tag">AI Assistants</span>
        <span className="banner-tag">Chatbots</span>
        <span className="banner-tag">RAG / Vector Search</span>
      </div>
      <div className="banner-cta">
        <button className="btn-primary" onClick={openContact}>
          Book a Free Consultation
        </button>
        <button className="btn-outline" onClick={openPricing}>
          View Service Pricing
        </button>
      </div>
    </div>

          {/* Right side cards with stack */}
          <div className="banner-panels">
            <div className="banner-card">
              <div className="banner-card-title">
                <div className="banner-icon">⚛️</div>
                <span>Frontend · React + Vite</span>
              </div>
              <ul>
                <li>Pixel-perfect UI from Figma/XD/PSD</li>
                <li>Component-based architecture</li>
                <li>Responsive layouts &amp; PWAs</li>
                <li>Tailwind CSS / Material UI</li>
              </ul>
            </div>
            <div className="banner-card">
              <div className="banner-card-title">
                <div className="banner-icon">🧠</div>
                <span>AI Integrations &amp; GPT Apps</span>
              </div>
              <ul>
                <li>Custom GPT &amp; AI assistants for your domain</li>
                <li>Chatbots embedded into your website &amp; apps</li>
                <li>RAG systems using your documents &amp; data</li>
                <li>Automation with workflows &amp; webhooks</li>
              </ul>
            </div>
            <div className="banner-card">
              <div className="banner-card-title">
                <div className="banner-icon">📱</div>
                <span>Mobile · React Native</span>
              </div>
              <ul>
                <li>Android APK / AAB builds</li>
                <li>iOS builds via EAS</li>
                <li>Store uploads &amp; app reviews</li>
                <li>Fix build &amp; performance issues</li>
              </ul>
            </div>
            <div className="banner-card">
              <div className="banner-card-title">
                <div className="banner-icon">⚡</div>
                <span>Backend · Node, Firebase &amp; DevOps</span>
              </div>
              <ul>
                <li>Firebase Auth, Firestore &amp; Cloud Functions</li>
                <li>Node.js APIs &amp; serverless backends</li>
                <li>Vercel / Firebase Hosting / Cloudflare</li>
                <li>CI/CD, DNS &amp; monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES STRIP */}
      <section className="capabilities-strip">
        <div className="capabilities-grid">
          <div className="cap-item">
            <div className="cap-icon">⚛️</div>
            <div>
              <div className="cap-text-title">Frontend Development</div>
              <div className="cap-text-sub">
                React · Vite · Tailwind · Material UI · PWAs
              </div>
            </div>
          </div>
          <div className="cap-item">
            <div className="cap-icon">🧠</div>
            <div>
              <div className="cap-text-title">AI Solutions</div>
              <div className="cap-text-sub">
                GPT chatbots · RAG · AI copilots · automation flows
              </div>
            </div>
          </div>
          <div className="cap-item">
            <div className="cap-icon">📱</div>
            <div>
              <div className="cap-text-title">Mobile App Builds</div>
              <div className="cap-text-sub">
                React Native · Android &amp; iOS builds · Store uploads
              </div>
            </div>
          </div>
          <div className="cap-item">
            <div className="cap-icon">☁️</div>
            <div>
              <div className="cap-text-title">Cloud &amp; Deployment</div>
              <div className="cap-text-sub">
                Firebase · Vercel · Cloudflare · CI/CD pipelines
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NAVIGATION */}
      <nav className="nav">
  <div className="nav-left">
    <button
      className={active === "web" ? "active" : ""}
      onClick={() => handleNavClick("web")}
    >
      Web Development
    </button>
    <button
      className={active === "mobile" ? "active" : ""}
      onClick={() => handleNavClick("mobile")}
    >
      Mobile Apps
    </button>
    <button
      className={active === "cloud" ? "active" : ""}
      onClick={() => handleNavClick("cloud")}
    >
      Cloud Solutions
    </button>
    <button
      className={active === "ai" ? "active" : ""}
      onClick={() => handleNavClick("ai")}
    >
      AI Solutions
    </button>
    <button
      className={active === "custom" ? "active" : ""}
      onClick={() => handleNavClick("custom")}
    >
      Custom Software
    </button>
    <button
      className={active === "pricing" ? "active" : ""}
      onClick={() => handleNavClick("pricing")}
    >
      Pricing
    </button>
    <button
      className={active === "about" ? "active" : ""}
      onClick={() => handleNavClick("about")}
    >
      About
    </button>
    <button
      className={active === "shipping" ? "active" : ""}
      onClick={() => handleNavClick("shipping")}
    >
      Shipping Policy
    </button>
    <button
      className={active === "privacy" ? "active" : ""}
      onClick={() => handleNavClick("privacy")}
    >
      Privacy Policy
    </button>
    <button
      className={active === "terms" ? "active" : ""}
      onClick={() => handleNavClick("terms")}
    >
      Terms &amp; Conditions
    </button>
    <button
      className={active === "contact" ? "active" : ""}
      onClick={() => handleNavClick("contact")}
    >
      Contact
    </button>
  </div>

  <div className="nav-right">
    <a href="ff-premium-checkout.html">
      <button>FF Premium Checkout</button>
    </a>
    <a href="privacy-ff-gpt.html">
      <button>FF GPT Privacy</button>
    </a>
  </div>
</nav>

      {/* MAIN CONTENT */}
      <main className="content">
        {/* Web Development */}
        <section
          id="web"
          className={`service-detail ${active === "web" ? "active" : ""}`}
        >
          <div className="service-header">
            <h2>Web Development Services</h2>
            <p className="subtitle">
              Build powerful, responsive web applications that drive business
              growth. Our expert developers create custom solutions tailored to
              your unique requirements using cutting-edge technologies.
            </p>
          </div>

          <div className="tech-section">
            <h3>Technologies We Use</h3>
            <div className="tech-badges">
              <span className="tech-badge">React</span>
              <span className="tech-badge">Vite</span>
              <span className="tech-badge">.NET</span>
              <span className="tech-badge">C</span>
              <span className="tech-badge">Java</span>
              <span className="tech-badge">Python</span>
              <span className="tech-badge">HTML5</span>
              <span className="tech-badge">CSS3</span>
              <span className="tech-badge">JavaScript</span>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <h4>Custom Web Applications</h4>
                <p>
                  Tailored web solutions designed specifically for your business
                  processes, ensuring maximum efficiency and user satisfaction.
                </p>
              </div>
              <div className="feature-card">
                <h4>Responsive Design</h4>
                <p>
                  Websites that work flawlessly across all devices - desktop,
                  tablet, and mobile - providing consistent user experience.
                </p>
              </div>
              <div className="feature-card">
                <h4>E-Commerce Platforms</h4>
                <p>
                  Complete online shopping solutions with secure payment
                  integration, inventory management, and analytics.
                </p>
              </div>
              <div className="feature-card">
                <h4>Content Management</h4>
                <p>
                  Easy-to-use CMS solutions that let you manage your website
                  content without technical knowledge.
                </p>
              </div>
              <div className="feature-card">
                <h4>API Integration</h4>
                <p>
                  Seamless integration with third-party services and APIs to
                  extend your application's functionality.
                </p>
              </div>
              <div className="feature-card">
                <h4>Performance Optimization</h4>
                <p>
                  Lightning-fast loading speeds and optimized code for better
                  user experience and SEO rankings.
                </p>
              </div>
            </div>
          </div>

          <div className="benefits-list">
            <h3>Why Choose Our Web Development Services</h3>
            <div className="benefit-item">
              <div className="benefit-icon">1</div>
              <div className="benefit-content">
                <h4>Modern Technology Stack</h4>
                <p>
                  We use the latest frameworks and tools like React and Vite to
                  build fast, scalable applications that meet current web
                  standards.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">2</div>
              <div className="benefit-content">
                <h4>Custom Solutions</h4>
                <p>
                  Every business is unique. We develop custom web applications
                  that align perfectly with your specific requirements and
                  workflows.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">3</div>
              <div className="benefit-content">
                <h4>Scalable Architecture</h4>
                <p>
                  Our applications are built to grow with your business,
                  handling increased traffic and functionality as your needs
                  evolve.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">4</div>
              <div className="benefit-content">
                <h4>Security First</h4>
                <p>
                  We implement industry-standard security practices to protect
                  your data and ensure compliance with regulations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Apps */}
        <section
          id="mobile"
          className={`service-detail ${active === "mobile" ? "active" : ""}`}
        >
          <div className="service-header">
            <h2>Mobile App Development</h2>
            <p className="subtitle">
              Create engaging mobile experiences that connect with your users.
              We develop cross-platform applications that work seamlessly on
              both iOS and Android devices.
            </p>
          </div>

          <div className="tech-section">
            <h3>Technologies We Use</h3>
            <div className="tech-badges">
              <span className="tech-badge">Flutter</span>
              <span className="tech-badge">Java</span>
              <span className="tech-badge">Python</span>
              <span className="tech-badge">Dart</span>
              <span className="tech-badge">Android SDK</span>
              <span className="tech-badge">iOS Development</span>
              <span className="tech-badge">REST APIs</span>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <h4>Cross-Platform Apps</h4>
                <p>
                  Single codebase for both iOS and Android using Flutter,
                  reducing development time and costs significantly.
                </p>
              </div>
              <div className="feature-card">
                <h4>Native Performance</h4>
                <p>
                  Apps that feel native to each platform with smooth animations
                  and responsive user interfaces.
                </p>
              </div>
              <div className="feature-card">
                <h4>Offline Functionality</h4>
                <p>
                  Build apps that work even without internet connection, syncing
                  data when connectivity is restored.
                </p>
              </div>
              <div className="feature-card">
                <h4>Push Notifications</h4>
                <p>
                  Keep users engaged with timely notifications and updates
                  delivered directly to their devices.
                </p>
              </div>
              <div className="feature-card">
                <h4>Real-time Features</h4>
                <p>
                  Implement live chat, location tracking, and real-time data
                  synchronization for dynamic experiences.
                </p>
              </div>
              <div className="feature-card">
                <h4>App Store Deployment</h4>
                <p>
                  Complete support for publishing your app to Google Play Store
                  and Apple App Store.
                </p>
              </div>
            </div>
          </div>

          <div className="benefits-list">
            <h3>Mobile App Development Advantages</h3>
            <div className="benefit-item">
              <div className="benefit-icon">1</div>
              <div className="benefit-content">
                <h4>Flutter Expertise</h4>
                <p>
                  Our team specializes in Flutter development, creating
                  beautiful, natively compiled applications from a single
                  codebase.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">2</div>
              <div className="benefit-content">
                <h4>Cost-Effective Development</h4>
                <p>
                  Cross-platform development means you get apps for both
                  platforms at a fraction of the cost of native development.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">3</div>
              <div className="benefit-content">
                <h4>User-Centric Design</h4>
                <p>
                  We create intuitive interfaces that users love, following
                  platform-specific design guidelines for optimal experience.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">4</div>
              <div className="benefit-content">
                <h4>Ongoing Support</h4>
                <p>
                  Continuous maintenance and updates to keep your app running
                  smoothly and compatible with latest OS versions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cloud Solutions */}
        <section
          id="cloud"
          className={`service-detail ${active === "cloud" ? "active" : ""}`}
        >
          <div className="service-header">
            <h2>Cloud Solutions</h2>
            <p className="subtitle">
              Leverage the power of cloud computing for scalable, reliable, and
              accessible applications. Our cloud solutions ensure your data is
              always available, secure, and synchronized across all devices.
            </p>
          </div>

          <div className="tech-section">
            <h3>Technologies We Use</h3>
            <div className="tech-badges">
              <span className="tech-badge">Firestore</span>
              <span className="tech-badge">Firebase</span>
              <span className="tech-badge">Cloud Databases</span>
              <span className="tech-badge">AWS</span>
              <span className="tech-badge">Azure</span>
              <span className="tech-badge">Real-time Sync</span>
              <span className="tech-badge">Cloud Storage</span>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <h4>Real-time Data Sync</h4>
                <p>
                  Instant data synchronization across all devices and platforms,
                  ensuring everyone has the latest information.
                </p>
              </div>
              <div className="feature-card">
                <h4>Scalable Infrastructure</h4>
                <p>
                  Cloud solutions that automatically scale based on demand,
                  handling traffic spikes without performance issues.
                </p>
              </div>
              <div className="feature-card">
                <h4>Database Management</h4>
                <p>
                  Expert database design and optimization for fast queries and
                  efficient data storage using Firestore and SQL.
                </p>
              </div>
              <div className="feature-card">
                <h4>Data Security</h4>
                <p>
                  Enterprise-grade security with encryption, authentication, and
                  access control to protect your sensitive data.
                </p>
              </div>
              <div className="feature-card">
                <h4>Backup &amp; Recovery</h4>
                <p>
                  Automated backup systems and disaster recovery plans to ensure
                  your data is never lost.
                </p>
              </div>
              <div className="feature-card">
                <h4>Cloud Migration</h4>
                <p>
                  Smooth transition of your existing systems to cloud
                  infrastructure with minimal downtime.
                </p>
              </div>
            </div>
          </div>

          <div className="benefits-list">
            <h3>Cloud Solutions Benefits</h3>
            <div className="benefit-item">
              <div className="benefit-icon">1</div>
              <div className="benefit-content">
                <h4>Firestore Integration</h4>
                <p>
                  Specialized expertise in Firestore for building real-time
                  applications with seamless data synchronization.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">2</div>
              <div className="benefit-content">
                <h4>Always Accessible</h4>
                <p>
                  Your data and applications are accessible from anywhere, on
                  any device, at any time.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">3</div>
              <div className="benefit-content">
                <h4>Cost Optimization</h4>
                <p>
                  Pay only for what you use with cloud services, reducing
                  infrastructure costs and eliminating hardware maintenance.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">4</div>
              <div className="benefit-content">
                <h4>High Availability</h4>
                <p>
                  99.9% uptime guarantee with redundant systems and automatic
                  failover protection.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Solutions */}
        <section
          id="ai"
          className={`service-detail ${active === "ai" ? "active" : ""}`}
        >
          <div className="service-header">
            <h2>AI Integrations &amp; Development</h2>
            <p className="subtitle">
              Turn your products into intelligent experiences. We design,
              develop, and integrate AI assistants, chatbots, and automation
              flows tailored to your business workflows and data.
            </p>
          </div>

          <div className="tech-section">
            <h3>AI Technologies We Use</h3>
            <div className="tech-badges">
              <span className="tech-badge">OpenAI GPT</span>
              <span className="tech-badge">Custom GPTs</span>
              <span className="tech-badge">RAG (Retrieval-Augmented Gen)</span>
              <span className="tech-badge">
                Vector DBs (pgvector, Pinecone, etc.)
              </span>
              <span className="tech-badge">Node.js · TypeScript</span>
              <span className="tech-badge">Firebase &amp; Cloud Functions</span>
              <span className="tech-badge">Webhook &amp; API Integrations</span>
              <span className="tech-badge">AI Workflows / Orchestration</span>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <h4>AI Chatbots for Web &amp; Mobile</h4>
                <p>
                  Embed AI assistants on your website or inside your mobile apps
                  to answer FAQs, guide users, and collect leads in natural
                  language.
                </p>
              </div>
              <div className="feature-card">
                <h4>Domain-Specific GPT Assistants</h4>
                <p>
                  Custom GPTs trained on your documentation, SOPs, and knowledge
                  base – ideal for CA tools, internal support, or
                  industry-specific workflows.
                </p>
              </div>
              <div className="feature-card">
                <h4>RAG Systems on Your Data</h4>
                <p>
                  Build retrieval-augmented generation flows that search your
                  PDFs, spreadsheets, and databases before generating precise
                  answers.
                </p>
              </div>
              <div className="feature-card">
                <h4>AI Automation &amp; Back-Office Flows</h4>
                <p>
                  Use AI to summarize reports, draft emails, generate invoices,
                  and update CRMs or Firestore documents via APIs and Cloud
                  Functions.
                </p>
              </div>
              <div className="feature-card">
                <h4>AI for Mobile &amp; React Apps</h4>
                <p>
                  Integrate chatbots and AI features directly into React / React
                  Native frontends with secure token handling and usage limits.
                </p>
              </div>
              <div className="feature-card">
                <h4>Analytics &amp; Usage Controls</h4>
                <p>
                  Quota management, logging, and observability so you can track
                  token usage, user behavior, and performance over time.
                </p>
              </div>
            </div>
          </div>

          <div className="benefits-list">
            <h3>Why Add AI with Annamalaiyar CodeVerse</h3>
            <div className="benefit-item">
              <div className="benefit-icon">1</div>
              <div className="benefit-content">
                <h4>End-to-End Product Thinking</h4>
                <p>
                  We handle the entire stack – UI, backend, databases, and AI
                  layer – so your assistant feels like part of the product, not
                  a bolt-on widget.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">2</div>
              <div className="benefit-content">
                <h4>Secure Data Handling</h4>
                <p>
                  We design prompts, retrieval, and access rules carefully so
                  that sensitive documents and tenant data remain isolated and
                  protected.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">3</div>
              <div className="benefit-content">
                <h4>Optimized Costs</h4>
                <p>
                  Token usage optimization, caching, and batching so your AI
                  features stay fast without blowing up your monthly bill.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">4</div>
              <div className="benefit-content">
                <h4>Real Business Impact</h4>
                <p>
                  We focus on use-cases that save time, reduce errors, and
                  create new revenue – not just “playground demos”.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Custom Software */}
        <section
          id="custom"
          className={`service-detail ${active === "custom" ? "active" : ""}`}
        >
          <div className="service-header">
            <h2>Custom Software Development</h2>
            <p className="subtitle">
              Tailored software solutions designed specifically for your
              business needs. We develop production management systems, workflow
              automation tools, and enterprise applications that improve
              efficiency and quality.
            </p>
          </div>

          <div className="tech-section">
            <h3>Technologies We Use</h3>
            <div className="tech-badges">
              <span className="tech-badge">C</span>
              <span className="tech-badge">Java</span>
              <span className="tech-badge">Python</span>
              <span className="tech-badge">.NET</span>
              <span className="tech-badge">React</span>
              <span className="tech-badge">SQL</span>
              <span className="tech-badge">REST APIs</span>
              <span className="tech-badge">Microservices</span>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <h4>Production Management</h4>
                <p>
                  Our proprietary web-based production tracking system, proven
                  effective in managing complex workflows efficiently.
                </p>
              </div>
              <div className="feature-card">
                <h4>Workflow Automation</h4>
                <p>
                  Automate repetitive tasks and streamline business processes to
                  save time and reduce human error.
                </p>
              </div>
              <div className="feature-card">
                <h4>Client Integration</h4>
                <p>
                  Seamless integration with your existing systems and databases,
                  allowing real-time status monitoring.
                </p>
              </div>
              <div className="feature-card">
                <h4>Custom Reporting</h4>
                <p>
                  Generate detailed reports and analytics tailored to your
                  specific business metrics and KPIs.
                </p>
              </div>
              <div className="feature-card">
                <h4>Enterprise Solutions</h4>
                <p>
                  Large-scale software systems designed to handle complex
                  business operations across departments.
                </p>
              </div>
              <div className="feature-card">
                <h4>Legacy Modernization</h4>
                <p>
                  Update and modernize your existing software systems with new
                  technologies and improved functionality.
                </p>
              </div>
            </div>
          </div>

          <div className="benefits-list">
            <h3>Custom Software Advantages</h3>
            <div className="benefit-item">
              <div className="benefit-icon">1</div>
              <div className="benefit-content">
                <h4>Proven Track Record</h4>
                <p>
                  We've successfully developed and implemented our own
                  production management system, demonstrating our capability in
                  building robust solutions.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">2</div>
              <div className="benefit-content">
                <h4>Improved Efficiency</h4>
                <p>
                  Our custom tools have consistently helped clients reduce
                  turnaround time and improve overall quality of operations.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">3</div>
              <div className="benefit-content">
                <h4>Perfect Fit</h4>
                <p>
                  Unlike off-the-shelf software, our custom solutions are built
                  exactly to match your unique business requirements.
                </p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">4</div>
              <div className="benefit-content">
                <h4>Full Ownership</h4>
                <p>
                  You own the complete source code and have full control over
                  future development and modifications.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className={`service-detail ${active === "pricing" ? "active" : ""}`}
        >
          <div className="service-header">
            <h2>Pricing &amp; Engagement Models</h2>
            <p className="subtitle">
              Flexible options to match your project size and timeline. All
              pricing is indicative – final quotes are shared after a quick
              discovery call.
            </p>
          </div>
          <div className="pricing-wrap">
            <div className="pricing-card">
              <div>
                <div className="pricing-tag">Starter</div>
                <div className="pricing-price">Ideal for MVPs &amp; small apps</div>
                <div className="pricing-note">Typical range: 2 – 4 weeks</div>
                <ul>
                  <li>Single web app (React + Vite)</li>
                  <li>Responsive UI, basic auth &amp; forms</li>
                  <li>Deployment to Vercel / Firebase Hosting</li>
                  <li>Email / WhatsApp support during build</li>
                </ul>
              </div>
              <div className="pricing-cta">
                <button onClick={openContact}>Enquire for Exact Quote</button>
              </div>
            </div>
            <div className="pricing-card">
              <div>
                <div className="pricing-tag">Growth</div>
                <div className="pricing-price">Web + Mobile + Cloud</div>
                <div className="pricing-note">Typical range: 4 – 8 weeks</div>
                <ul>
                  <li>Web app + React Native mobile app</li>
                  <li>Firebase Auth, Firestore, Cloud Functions</li>
                  <li>Production-ready CI/CD &amp; monitoring</li>
                  <li>App Store / Play Store submission help</li>
                </ul>
              </div>
              <div className="pricing-cta">
                <button onClick={openContact}>Schedule a Call</button>
              </div>
            </div>
            <div className="pricing-card">
              <div>
                <div className="pricing-tag">Enterprise</div>
                <div className="pricing-price">
                  Custom Software &amp; Integrations
                </div>
                <div className="pricing-note">Long-term / retainer friendly</div>
                <ul>
                  <li>Production management &amp; workflow systems</li>
                  <li>Multi-role access, analytics &amp; reporting</li>
                  <li>Legacy modernization &amp; system integration</li>
                  <li>Ongoing maintenance &amp; SLA-based support</li>
                </ul>
              </div>
              <div className="pricing-cta">
                <button onClick={openContact}>Discuss Enterprise Plan</button>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className={`service-detail ${active === "about" ? "active" : ""}`}
        >
          <div className="service-header">
            <h2>About Annamalaiyar CodeVerse</h2>
            <p className="subtitle">
              Your trusted partner in digital transformation and software
              innovation
            </p>
          </div>

          <div className="about-section">
            <h3>Who We Are</h3>
            <p>
              Annamalaiyar CodeVerse is a leading software development
              and IT solutions provider dedicated to helping businesses achieve
              their digital goals. We understand the critical role that
              technology plays in modern business operations, and we're
              committed to delivering solutions that enhance efficiency, quality,
              and productivity.
            </p>
            <p>
              Our team of highly skilled software developers brings years of
              experience across multiple platforms and technologies, enabling us
              to tackle projects of any complexity and scale.
            </p>
          </div>

          <div className="about-section">
            <h3>Our Expertise</h3>
            <p>
              We specialize in developing customized software solutions across a
              wide range of platforms and technologies:
            </p>
            <ul>
              <li>
                <strong>Programming Languages:</strong> C, Java, Python, .NET,
                Dart
              </li>
              <li>
                <strong>Web Technologies:</strong> React, Vite, HTML5, CSS3,
                JavaScript
              </li>
              <li>
                <strong>Mobile Development:</strong> Flutter for cross-platform
                applications
              </li>
              <li>
                <strong>Cloud Services:</strong> Firestore, Firebase, AWS, Azure
              </li>
              <li>
                <strong>Database Solutions:</strong> SQL, NoSQL, Firestore,
                Cloud Databases
              </li>
              <li>
                <strong>Enterprise Applications:</strong> Custom business
                software and workflow systems
              </li>
            </ul>
          </div>

          <div className="about-section">
            <h3>Our Approach</h3>
            <p>
              We believe in building long-term partnerships with our clients.
              Our development process is collaborative, transparent, and focused
              on delivering measurable results. We work closely with you to
              understand your business challenges and create solutions that
              address your specific needs.
            </p>
            <p>
              Our proprietary production management and tracking system,
              developed in-house, demonstrates our commitment to innovation and
              excellence. This web-based solution has proven its effectiveness
              in managing complex workflows and integrating seamlessly with
              client systems.
            </p>
          </div>

          <div className="about-section">
            <h3>Why Choose Annamalaiyar CodeVerse?</h3>
            <ul>
              <li>
                Experienced team with diverse technical expertise across
                multiple platforms
              </li>
              <li>
                Proven track record of delivering high-quality software
                solutions
              </li>
              <li>
                Custom development tailored to your specific business
                requirements
              </li>
              <li>
                Transparent project management with real-time status monitoring
              </li>
              <li>
                Commitment to improving turnaround time and overall quality
              </li>
              <li>Comprehensive support throughout development and beyond</li>
              <li>
                Integration capabilities with existing client systems and
                databases
              </li>
              <li>Focus on scalable, maintainable, and secure solutions</li>
            </ul>
          </div>
        </section>

        {/* Terms & Conditions */}
        <section
          id="terms"
          className={`service-detail ${active === "terms" ? "active" : ""}`}
        >
          <div className="service-header">
    <h2>Terms &amp; Conditions</h2>
    <p className="subtitle">
      These Terms &amp; Conditions apply to all websites, mobile apps, custom GPTs,
      SaaS products and software development services offered by <strong>Annamalaiyar CodeVerse</strong> (“Annamalaiyar CodeVerse”, “we”, “our”, “us”).
      By accessing or using any of our services or making a payment, you agree to be
      bound by these Terms.
    </p>

    <h3>1. Services</h3>
    <p>
      Annamalaiyar CodeVerse provides software development, consulting, SaaS subscriptions,
      AI-based tools, mobile and web applications, and related IT services.
      Specific features, scope, timelines and deliverables will be defined in
      project proposals, statements of work, service orders, or subscription plans
      (collectively, “Service Agreements”).
    </p>

    <h3>2. Eligibility &amp; Accounts</h3>
    <ul>
      <li>You must be at least 18 years old and legally capable of entering into a binding contract.</li>
      <li>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</li>
      <li>You agree to provide accurate, current and complete information when creating or updating your account.</li>
    </ul>

    <h3>3. Payments &amp; Billing</h3>
    <p>
      Fees for our services may be charged as one-time project fees, retainers,
      or recurring subscriptions (monthly, annual, or otherwise) as agreed in
      the relevant Service Agreement.
    </p>
    <ul>
      <li>
        Payments may be processed through third-party payment gateways and platforms,
        including but not limited to Razorpay, Stripe, PayPal, UPI apps, credit/debit
        card processors, and app stores (Google Play, Apple App Store, etc.).
      </li>
      <li>
        By initiating a payment, you agree to be bound by the applicable terms and
        privacy policies of those payment providers in addition to these Terms.
      </li>
      <li>
        All fees are typically payable in advance and are non-refundable unless
        explicitly stated otherwise in a written agreement or in our separate
        Refund &amp; Cancellation Policy.
      </li>
      <li>
        You are responsible for any taxes, duties or government charges applicable
        to the services, except where we explicitly agree to collect and remit them.
      </li>
    </ul>

    <h3>4. Refund &amp; Cancellation</h3>
    <p>
      Refunds and cancellations are governed by Annamalaiyar CodeVerse’s <strong>Refund &amp; Cancellation Policy</strong>. In general, once a billing
      period or one-time project has started, fees are non-refundable except where:
    </p>
    <ul>
      <li>a written agreement specifically provides for a refund, or</li>
      <li>a refund is required under applicable law or payment-gateway rules.</li>
    </ul>
    <p>
      Any refund, if approved, will be processed through the original payment method
      where reasonably possible.
    </p>

    <h3>5. Use of Our Services</h3>
    <p>You agree that you will not:</p>
    <ul>
      <li>Use our services for any illegal, harmful, fraudulent or abusive activities.</li>
      <li>Attempt to gain unauthorized access to our systems or other users’ data.</li>
      <li>Copy, resell, sublicense or reverse-engineer our proprietary software, models or code, except where expressly permitted.</li>
      <li>Upload or transmit malicious code, spam or content that violates laws or third-party rights.</li>
    </ul>

    <h3>6. AI &amp; Automation Disclaimer</h3>
    <p>
      Some Annamalaiyar CodeVerse solutions use AI models and automation (including third-party
      AI providers). Outputs are generated based on patterns in data and may be
      incorrect, incomplete or out of date.
    </p>
    <ul>
      <li>All AI outputs are suggestions or drafts and must be reviewed by a qualified professional before being relied upon.</li>
      <li>Our tools do not constitute legal, tax, financial, medical or any other regulated professional advice.</li>
    </ul>

    <h3>7. Intellectual Property</h3>
    <p>
      Unless otherwise agreed in a written Service Agreement:
    </p>
    <ul>
      <li>Annamalaiyar CodeVerse retains ownership of all underlying source code, frameworks, libraries, models and tools developed by us.</li>
      <li>
        You retain ownership of your own brand assets, data, content and any
        confidential materials you provide to us.
      </li>
      <li>
        Custom software and deliverables may be licensed or assigned to you as
        per the project contract (for example, full source-code transfer, limited
        license, or SaaS usage rights).
      </li>
    </ul>

    <h3>8. Data Protection &amp; Privacy</h3>
    <p>
      Our handling of personal data is described in the <strong>Privacy Policy</strong>. By using our services, you consent to such
      processing. You are responsible for ensuring that any data you share with us
      from your clients or employees has been collected lawfully and with the
      necessary permissions.
    </p>

    <h3>9. Third-Party Services &amp; Integrations</h3>
    <p>
      Our solutions may integrate with external services (e.g. Firebase, Supabase,
      Razorpay, email providers, analytics tools, OpenAI, cloud platforms).
      We are not responsible for the availability, security or performance of
      third-party services and their own terms and policies will apply.
    </p>

    <h3>10. Limitation of Liability</h3>
    <p>
      To the maximum extent permitted by law, Annamalaiyar CodeVerse and
      its directors, employees and partners will not be liable for any indirect,
      incidental, special or consequential damages, loss of profits, loss of data,
      penalties or business interruption arising out of or related to your use of
      our services, even if we have been advised of the possibility of such damages.
    </p>
    <p>
      Our total aggregate liability for any claim relating to the services will be
      limited to the amount you paid for the services in the three (3) months
      immediately preceding the event giving rise to the claim, unless a different
      cap is specified in a signed agreement.
    </p>

    <h3>11. Governing Law &amp; Dispute Resolution</h3>
    <p>
      These Terms are governed by the laws of India. Any disputes will be subject
      to the exclusive jurisdiction of the courts located in Tamil Nadu, India,
      unless otherwise agreed in writing.
    </p>

    <h3>12. Changes to These Terms</h3>
    <p>
      We may update these Terms &amp; Conditions from time to time. The latest
      version will always be available on this page with an updated effective date.
      Continued use of our services after changes means you accept the revised Terms.
    </p>

    <h3>13. Contact</h3>
    <p>
      For questions about these Terms &amp; Conditions, please contact:<br />
      <strong>Email:</strong> <a href="mailto:dhanasekar@annamalaiyarcodeverse.com" className="text-blue-600 underline">dhanasekar@annamalaiyarcodeverse.com</a><br />
      <strong>Company:</strong> Annamalaiyar CodeVerse
    </p>
  </div>
        </section>

        {/* Shipping Policy */}
        <section
          id="shipping"
          className={`service-detail ${
            active === "shipping" ? "active" : ""
          }`}
        >
          <div className="service-header">
            <h2>Shipping &amp; Delivery Policy</h2>
            <p className="subtitle">
              Since Annamalaiyar CodeVerse provides digital software and IT services, no
              physical shipping applies.
            </p>
            <ul>
              <li>
                Deliverables are shared electronically via secure platforms.
              </li>
              <li>
                All project milestones and delivery timelines are defined in
                advance.
              </li>
              <li>
                Support and updates are provided through digital channels.
              </li>
            </ul>
          </div>
        </section>

        {/* Privacy Policy */}
        <section
          id="privacy"
          className={`service-detail ${active === "privacy" ? "active" : ""}`}
        >
          <div className="service-header">
    <h2>Privacy Policy</h2>
    <p className="subtitle">
      This Privacy Policy explains how <strong>Annamalaiyar CodeVerse</strong> (“Annamalaiyar CodeVerse”, “we”, “our”, “us”) collects, uses and protects information
      when you use our websites, apps, custom GPTs, SaaS platforms, and related
      services (collectively, the “Services”).
    </p>

    <h3>1. Information We Collect</h3>
    <p>Depending on which service you use, we may collect:</p>
    <ul>
      <li><strong>Contact Details:</strong> name, email address, phone number, organization name.</li>
      <li>
        <strong>Account &amp; Usage Data:</strong> login details, activity logs,
        device information, IP address, timestamps and technical diagnostics.
      </li>
      <li>
        <strong>Business &amp; Project Data:</strong> requirements, documents, files,
        prompts and inputs you provide so that we can deliver software or AI outputs.
      </li>
      <li>
        <strong>Payment Information:</strong> limited billing details and payment
        status. Card / bank details are processed directly by third-party payment
        gateways and are not stored by us.
      </li>
    </ul>

    <h3>2. How We Use Your Information</h3>
    <ul>
      <li>To provide, operate and improve our software, apps and AI tools.</li>
      <li>To create and manage user accounts and customer projects.</li>
      <li>To communicate with you about support, updates, invoices and security alerts.</li>
      <li>To configure and maintain integrations with third-party platforms (e.g. Firebase, Supabase, OpenAI, email services).</li>
      <li>To comply with legal obligations and prevent misuse or fraud.</li>
    </ul>
    <p>We do <strong>not sell</strong> your personal data to third parties.</p>

    <h3>3. Third-Party Services &amp; Payment Gateways</h3>
    <p>
      We may use third-party providers for hosting, databases, analytics, AI
      processing, communication and payments, including but not limited to
      Firebase, Supabase, Render, Vercel, OpenAI, Razorpay, Stripe, PayPal,
      Google Play, Apple App Store and email services.
    </p>
    <ul>
      <li>These providers process data on our behalf or as independent controllers under their own privacy policies.</li>
      <li>Payment gateways receive your payment details directly; Annamalaiyar CodeVerse does not see or store full card or bank information.</li>
    </ul>

    <h3>4. Data Retention</h3>
    <p>
      We retain data for as long as necessary to provide the Services, comply
      with legal obligations, resolve disputes and enforce agreements. Where an
      account or project is closed, we will delete or anonymize personal data
      within a reasonable period, subject to backup and legal retention requirements.
    </p>

    <h3>5. Your Rights</h3>
    <p>Subject to applicable law, you may have the right to:</p>
    <ul>
      <li>Request access to the personal data we hold about you.</li>
      <li>Request correction of inaccurate or incomplete data.</li>
      <li>Request deletion of your data, where legally permitted.</li>
      <li>Object to or restrict certain types of processing.</li>
    </ul>
    <p>
      To exercise these rights, contact us at <a href="mailto:dhanasekar@annamalaiyarcodeverse.com" className="text-blue-600 underline">
        dhanasekar@annamalaiyarcodeverse.com
      </a>.
    </p>

    <h3>6. Security</h3>
    <p>
      We use reasonable technical and organizational measures (such as HTTPS,
      access controls and cloud-provider security features) to protect your data.
      However, no system is 100% secure, and you use our Services at your own risk.
    </p>

    <h3>7. Children’s Privacy</h3>
    <p>
      Our business-focused Services are not directed to children under 16, and we
      do not knowingly collect personal data from minors for these services. If you
      believe a minor has provided data to us, please contact us so we can delete it.
    </p>

    <h3>8. Changes to This Policy</h3>
    <p>
      We may update this Privacy Policy from time to time. The latest version will
      always be available on this page with an updated effective date. Continued use
      of the Services after changes means you accept the revised Policy.
    </p>

    <h3>9. Contact Us</h3>
    <p>
      For privacy questions, data requests or complaints, please contact:<br />
      <strong>Email:</strong> <a href="mailto:dhanasekar@annamalaiyarcodeverse.com" className="text-blue-600 underline">
        dhanasekar@annamalaiyarcodeverse.com
      </a><br />
      <strong>Company:</strong> Annamalaiyar CodeVerse
    </p>
  </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          className={`service-detail ${active === "contact" ? "active" : ""}`}
        >
          <div className="service-header">
            <h2>Contact &amp; Project Enquiry</h2>
            <p className="subtitle">
              Have a project or idea? Share a few details and we'll get back
              with suggestions and a quote.
            </p>

            <div className="contact-info">
              <p>
                <strong>Email:</strong> <a href="mailto:dhanasekar@annamalaiyarcodeverse.com" className="text-blue-600 underline">
                  dhanasekar@annamalaiyarcodeverse.com
                </a>
              </p>
              <p>
                <strong>Phone:</strong> +91-9600887711
              </p>
              <p>
                <strong>Address:</strong> Annamalaiyar CodeVerse, India
              </p>
              <p>
                <strong>Logo:</strong>{" "}
                <a href="logo.png" target="_blank">
                  View Logo
                </a>
              </p>
            </div>

            <div className="enquiry-wrapper">
              <div className="enquiry-card">
                <h3>Quick Project Enquiry</h3>
                <p style={{ fontSize: 12, color: "#555" }}>
                  This form is a front-end demo. Connect it to your preferred
                  backend (Firestore, email API, etc.) to capture submissions.
                </p>

                <form id="enquiryForm" onSubmit={handleEnquirySubmit}>
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="name">Full Name</label>
                      <input id="name" name="name" type="text" required />
                    </div>
                    <div className="form-field">
                      <label htmlFor="email">Email</label>
                      <input id="email" name="email" type="email" required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="projectType">Project Type</label>
                      <select id="projectType" name="projectType">
                        <option>Web App</option>
                        <option>Mobile App</option>
                        <option>Web + Mobile</option>
                        <option>AI Solution</option>
                        <option>Custom Software</option>
                        <option>Consulting / Other</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label htmlFor="budget">
                        Estimated Budget (optional)
                      </label>
                      <input
                        id="budget"
                        name="budget"
                        type="text"
                        placeholder="e.g. ₹1L – ₹3L"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="details">Project Details</label>
                    <textarea
                      id="details"
                      name="details"
                      placeholder="Tell us about your idea, timeline, features etc."
                      required
                    />
                  </div>

                  <div className="enquiry-actions">
                    <button type="submit">Send Enquiry</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        © 2025 Annamalaiyar CodeVerse. All Rights Reserved.
      </footer>
    </>
  );
}