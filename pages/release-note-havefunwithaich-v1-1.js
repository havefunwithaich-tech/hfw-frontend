import Head from 'next/head';
import Link from 'next/link';

export default function ReleaseNoteV11() {
  return (
    <div className="release-container">
      <Head>
        <title>v1.1 Release Note | havefunwithAIch</title>
      </Head>

      <header className="release-header">
        <p className="release-label">Release Note</p>
        <h1 className="main-title">havefunwithAIch v1.1</h1>
        <h2 className="sub-title">The Convergence of Vision and Architecture</h2>
      </header>

      <section className="intro-section">
        <p>We are proud to announce the release of v1.1, a major milestone in the evolution of havefunwithAIch.</p>
        <p>This update goes beyond technical stabilization. It represents a refinement of the architecture and intent behind how this platform is experienced.</p>
      </section>

      <div className="content-grid">
        <section className="feature-block">
          <h3>1. Bespoke Video Showcase Engine</h3>
          <p>We have introduced a custom-built video presentation engine designed specifically for high-fidelity visual storytelling.</p>
          <div className="detail-box">
            <h4>Design Philosophy</h4>
            <ul>
              <li>This system is not an add-on. It is an explicit architectural choice.</li>
              <li>While it supports promotional-grade visuals, our stance remains unchanged: <strong>there are no third-party advertisements, now or in the future.</strong></li>
              <li>This space exists solely to present ideas, works, and technologies we genuinely stand behind.</li>
            </ul>
          </div>
        </section>

        <section className="feature-block">
          <h3>2. Dual-Gateway Integration</h3>
          <p className="category-tag">Official Site Convergence</p>
          <p>Following our long-term architectural roadmap, the official havefunwithAIch ecosystem has been fully synchronized.</p>
          <div className="detail-box">
            <h4>Structural Outcome</h4>
            <ul>
              <li>We have implemented a Two-Gateway model.</li>
              <li>Whether visitors arrive via the legacy official domain or the new HQ, content delivery is now unified, normalized, and optimized.</li>
              <li>Articles, videos, and core resources flow through a consistent, high-performance pipeline, ensuring a stable experience for a global audience.</li>
            </ul>
          </div>
        </section>

        <section className="feature-block">
          <h3>3. Video Infrastructure 2.0</h3>
          <p className="category-tag">Stability and Performance Overhaul</p>
          <p>The Videos section has undergone a fundamental backend redesign.</p>
          <div className="detail-box">
            <h4>What Changed</h4>
            <ul>
              <li>This was not a surface-level fix.</li>
              <li>Playback logic, routing, and data flow were restructured to eliminate regional bottlenecks and ensure consistent delivery under real-world conditions.</li>
              <li>The result is a system built for reliability first, not assumptions.</li>
            </ul>
          </div>
        </section>
      </div>

      <footer className="architect-message">
        <div className="message-frame">
          <h3>A Message from the Architect</h3>
          <p>After 30 years in the IT industry, I’ve learned that “good enough” is where systems quietly fail later. This release was examined at the level of structure, flow, and responsibility.</p>
          <div className="status-grid">
            <p className="status-item">The infrastructure is now set.</p>
            <p className="status-item">The pathways are clear.</p>
            <p className="status-item">The platform is ready for what follows.</p>
          </div>
          <div className="closing-words">
            <p className="seed">Seed your mind.</p>
            <p className="join">Join the Symbiosis.</p>
          </div>
        </div>
        <Link href="https://hq.havefunwithaich.com" className="back-link">Return to HQ &rarr;</Link>
      </footer>

      <style jsx>{`
        .release-container { max-width: 840px; margin: 0 auto; padding: 80px 24px; color: #fff; background: #000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.8; }
        .release-header { text-align: center; margin-bottom: 80px; }
        .release-label { color: #00ccff; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; font-size: 0.85rem; margin-bottom: 12px; }
        .main-title { font-size: clamp(2rem, 8vw, 3.5rem); font-weight: 900; margin: 0; letter-spacing: -0.02em; }
        .sub-title { font-size: 1.25rem; color: #777; margin-top: 15px; font-weight: 400; letter-spacing: 0.05em; }
        .intro-section { font-size: 1.2rem; color: #aaa; margin-bottom: 80px; text-align: center; max-width: 700px; margin-inline: auto; }
        .feature-block { margin-bottom: 80px; }
        .feature-block h3 { font-size: 1.8rem; color: #fff; margin-bottom: 20px; font-weight: 800; }
        .category-tag { font-size: 0.9rem; color: #00ccff; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
        .detail-box { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 30px; border-radius: 8px; margin-top: 25px; }
        .detail-box h4 { font-size: 0.8rem; color: #555; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 20px; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; }
        ul { list-style: none; padding: 0; }
        li { position: relative; padding-left: 28px; margin-bottom: 18px; color: #ccc; font-size: 1rem; }
        li::before { content: '∟'; position: absolute; left: 0; color: #00ccff; font-weight: bold; }
        .architect-message { margin-top: 120px; text-align: center; }
        .message-frame { padding: 60px 40px; border-radius: 16px; background: linear-gradient(180deg, #050505 0%, #000 100%); border: 1px solid #111; position: relative; }
        .message-frame h3 { font-size: 1.5rem; margin-bottom: 24px; color: #fff; letter-spacing: 0.05em; }
        .status-grid { margin: 40px 0; }
        .status-item { color: #666; font-size: 1.1rem; margin: 5px 0; }
        .closing-words { margin-top: 60px; }
        .seed { font-size: 1.8rem; font-weight: 900; color: #fff; margin: 0; }
        .join { font-size: 1.8rem; font-weight: 900; color: #00ccff; margin: 0; }
        .back-link { display: inline-block; margin-top: 40px; color: #444; font-size: 0.9rem; font-weight: bold; transition: color 0.3s; }
        .back-link:hover { color: #fff; }
        @media (max-width: 768px) {
          .release-container { padding: 40px 20px; }
          .message-frame { padding: 40px 20px; }
          .seed, .join { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}