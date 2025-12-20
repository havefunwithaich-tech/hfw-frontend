import Head from 'next/head';

export default function About() {
  return (
    <div className="main-container">
      <Head>
        <title>About This Site | havefunwithAIch</title>
        <meta name="description" content="The core philosophy, strategy, and content policy of havefunwithAIch." />
      </Head>

      <div className="content-wrapper">
        <h1 className="page-title">About HavefunwithAIch</h1>

        <p>HavefunwithAIch is a creator-led project focused on AI video production, YouTube content strategy, and creative prompt engineering.</p>
        <p>This site exists to support the full workflow behind the channel — including global audience analysis, production structure, scripting strategy, and experimental processes that don't make it to the public stage.</p>
        <p>Unlike typical AI video review sites or promotion-driven media, HavefunwithAIch documents the actual decisions, failures, tests, and behind-the-scenes mechanisms that power original content creation.</p>
        <p>The goal is not to sell hype, but to expose the architecture of how meaningful AI content can be built — technically, philosophically, and tactically.</p>
        <p>YouTube is a powerful but constrained platform. Its recommendation system rewards popularity over intent, and often silences or buries content that challenges norms.</p>
        <p>That’s why this space exists: to make room for deeper explanation, transparent methodology, and the operational realities that creators must face when working with cutting-edge AI tools and global audiences.</p>
        <p>This site is independently operated. We do not publish generic promotional content. All material here is curated from active experiments and real production outcomes tied to the HavefunwithAIch channel and its collaborations.</p>

        <hr />

        <h2 className="section-title">Content Access and Platform Structure</h2>
        <p>Since our official launch on December 2, 2025, we have implemented a dedicated structure to maximize both content depth and global access:</p>

        <h3>1. Exclusive Articles (Member Only):</h3>
        <p>The deep explanations, transparent methodology, and operational realities discussed here—including strategic analyses and cutting-edge SSM research—are now reserved for our core partners and members (via Veil and affiliate platforms). This ensures we can focus on providing unconstrained, high-value tactical intelligence.</p>

        <h3>2. Video Content (Globally Accessible):</h3>
        <p>All video content produced by havefunwithAIch remains universally accessible and viewable by the public. This content is primarily monetized through our partnerships, AdSense displayed on this site, and affiliate income.</p>

        <p>We operate globally, and all content on this platform is presented exclusively in US English.</p>
      </div>

      <style jsx>{`
        .main-container { background-color: #000; min-height: 100vh; color: #fff; font-family: sans-serif; padding: 40px 20px; }
        .content-wrapper { max-width: 800px; margin: 0 auto; line-height: 1.6; }
        .page-title { font-size: 2.5rem; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .section-title { font-size: 1.8rem; margin-top: 40px; }
        h3 { font-size: 1.3rem; margin-top: 25px; color: #00ccff; }
        hr { border: 0; border-top: 1px solid #333; margin: 40px 0; }
        p { margin-bottom: 15px; }
      `}</style>
    </div>
  );
}
