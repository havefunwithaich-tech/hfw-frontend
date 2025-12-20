import Head from 'next/head';
import Link from 'next/link';

export default function LaunchGreeting() {
  return (
    <div className="main-container">
      <Head>
        <title>Relaunch & Policy Update | havefunwithAIch</title>
        <meta name="description" content="Official Site Relaunch: New Content Policy & Core Mission" />
      </Head>

      <div className="content-wrapper">
        <h1 className="article-title">[MAJOR UPDATE] havefunwithAIch Official Site Relaunch: New Content Policy & Core Mission</h1>

        <div className="article-meta">
          <p>Posted: December 2, 2025</p>
        </div>

        <section className="section">
          <h2 className="section-title">Introduction: A Two-Week Journey to Ultra-High Performance</h2>
          <p>It has been a significant undertaking. The performance limitations of our previous rental server necessitated a complete site renewal. Our plan involved consolidating our previously dispersed platforms and implementing a front-end separation architecture to maximize platform effectiveness.</p>
          <p>While I initially expected this migration to take just three days, it ultimately took the better part of two weeks. The core content features application-development level code scattered throughout, making the process far from simple. Even with the assistance of powerful AI tools like Gemini and Copilot, there were moments of genuine difficulty that stumped even the three of us. Reflecting on my active 30-year IT career, I realize this would have been nearly impossible to accomplish alone back then.</p>
        </section>

        <section className="section">
          <h2 className="section-title">Core Features of the New Architecture</h2>
          <p>We have successfully rebuilt the site with a focus on speed, stability, and user experience:</p>
          <ul>
            <li>**Ultra-High Speed:** We utilized Next.js as the front-end, serving all display-related content as static caches, while content is managed in WordPress. This ensures exceptionally fast loading times.</li>
            <li>**Membership & Integration:** Full membership capabilities and seamless integration with Stripe have been established.</li>
            <li>**Advanced Ad Management:** We implemented Google Ad Manager (GAM) for our advertising and have effectively moved away from the problematic AdSense. This ensures that intrusive or poor-quality advertisements will no longer reach our visitors.</li>
            <li>**Custom Build:** Essentially, the entire system is a custom build tailored to our specific needs.</li>
          </ul>
        </section>

        <section className="section">
          <h2 className="section-title">Key Technical Challenges Overcome</h2>
          <p>The complexity of the project stemmed from several friction points:</p>
          <ul>
            <li>Next.js & WordPress Integration: Managing configuration settings, code states, and ensuring compatibility between necessary applications and versions was the biggest hurdle.</li>
            <li>Membership Processing: Logic surrounding member authentication and access required intricate handling.</li>
            <li>In-Article Video Embedding: We regrettably had to defer the integration of complex in-article video features for now.</li>
            <li>Next.js Screen Preparation: Preparing the various screens within the Next.js framework took considerable time.</li>
            <li>Ad Display Functionality: While ad display is now working, there is still room for optimization in terms of GAM usage and complexity.</li>
          </ul>
        </section>

        <section className="section">
          <h2 className="section-title">Performance and Infrastructure</h2>
          <p>Our efforts have yielded significant results in site speed, achieving world-class performance:</p>
          <p>Mobile scores have reached **75** (up from 50-60), and PC scores are now **98** (up from 80-90). We believe this positions us among the fastest platforms globally. We will continue optimizing to push these scores even higher.</p>
          <p>We utilize a Next.js front-end with WordPress content management, both residing on the **same infrastructure** rather than separate servers (the typical setup). This intentionally sacrifices some load distribution in exchange for **ultra-high-speed processing** and easier maintenance. The server itself is hosted on **Digital Ocean**, ensuring top-tier speed and stability.</p>
        </section>

        <section className="section">
          <h2 className="section-title">Future Plans for Optimization</h2>
          <p>We are not finished optimizing. Future plans include:</p>
          <ul>
            <li>**Video Hosting Migration:** We plan to migrate our video assets, currently housed on Gumlet, to a separate disk located on the same Digital Ocean server foundation.</li>
            <li>**Video Access Policy (Future):** We plan to transition from full public video access to a model where only the latest videos are publicly available, alongside a comprehensive backup of the environment to a local NAS. This will ensure perfect speed, stability, and complete recovery capabilities for our video content.</li>
          </ul>
        </section>

        <section className="section">
          <h2 className="section-title">Current Content Policy: Videos & Exclusive Articles</h2>
          <p>Currently, all videos are **completely public** with no registration or charge required. We encourage you to enjoy them! Unlike the versions shared on social media, these are **Director's Cut versions** with no time limits and a focus on maintaining the highest possible picture and audio quality, free from external platform restrictions.</p>
          <p>For our articles, we have proudly transitioned to a **member-exclusive model**. In exchange, we have hidden content that you would absolutely have to purchase a book to gain access to elsewhere, such as the **Sink Seeding Method (SSM)**?the fundamental prompting law that overturns 180 degrees of conventional wisdom and is essential for all serious AI users.</p>
          <p>Other exclusive content includes detailed **cost comparisons based on the true value standard of AI video generation**. We sincerely invite you to <Link href="/veil" className="member-link">become a member and subscribe</Link> to access this unparalleled level of tactical and philosophical intelligence.</p>
        </section>
      </div>

      <style jsx>{`
        .main-container { background-color: #000; min-height: 100vh; color: #fff; font-family: sans-serif; padding: 60px 20px; }
        .content-wrapper { max-width: 850px; margin: 0 auto; line-height: 1.7; }
        .article-title { font-size: 2.8rem; margin-bottom: 10px; color: #00ccff; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .article-meta { color: #888; margin-bottom: 40px; font-size: 0.9rem; }
        .section { margin-bottom: 40px; }
        .section-title { font-size: 1.8rem; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px dotted #333; padding-bottom: 5px; }
        p { margin-bottom: 15px; }
        ul { list-style-type: disc; margin-left: 20px; padding-left: 0; margin-bottom: 20px; }
        li { margin-bottom: 8px; }
        strong { color: #fff; }
        .member-link { color: #ff4444; font-weight: bold; text-decoration: underline; }

        @media (max-width: 768px) {
          .article-title { font-size: 2rem; }
          .section-title { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}