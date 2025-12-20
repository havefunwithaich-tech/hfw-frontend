import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="main-container">
      <Head>
        <title>Privacy Policy | havefunwithAIch</title>
        <meta name="description" content="Our commitment to protecting your personal data and privacy." />
      </Head>

      <div className="content-wrapper">
        <h1 className="page-title">Privacy Policy</h1>
        
        <p className="introduction-text">We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website.</p>
        
        <hr />

        <section className="section">
          <h2 className="section-title">1. Data We Collect and Why (Membership & Transactions)</h2>
          <p>We collect information necessary for the provision of our services, specifically through our membership platform and external payment processor.</p>
          <ul>
            <li>**Membership Data:** When you sign up for exclusive articles and content, we collect your name and email address for account management, service access, and communication.</li>
            <li>**Transaction Data:** Payment processing for subscriptions is handled by **Stripe**. We do not store your full credit card details. Stripe processes your payment data securely to fulfill your subscription and prevent fraud.</li>
          </ul>
        </section>

        <section className="section">
          <h2 className="section-title">2. Advertising and Tracking Technology</h2>
          <p>We use Google services to manage advertising and measure site performance. **By using our site, you consent to this privacy policy and the use of cookies/data as described below.**</p>
          <ul>
            <li>**Google Ad Manager (GAM) and AdSense:** We use Google Ad Manager (GAM) to serve ads on this site. Google may use **cookies** to serve ads based on your prior visits to our site or other sites on the Internet. We rely on GAM to control the quality of advertisements shown on our platform.</li>
            <li>**Usage Data:** Our site uses logging and analytics to monitor technical performance, which helps us ensure our Next.js architecture delivers ultra-high speed and stability.</li>
          </ul>
          <p>For more information on how Google uses data, please visit <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="external-link">Google Privacy & Terms</a>.</p>
        </section>

        <section className="section">
          <h2 className="section-title">3. Your Rights and Contact</h2>
          <p>You have the right to access, rectify, or erase your personal data held by us. If you wish to exercise these rights or have questions about this policy, please contact us.</p>
          <p>We are committed to complying with all applicable laws, including Japan's **Act on Specified Commercial Transactions** regarding paid services.</p>
          {/* 💥 メールアドレスを .com に修正 💥 */}
          <p>Email: <a href="mailto:contact@havefunwithaich.com" className="contact-link">contact@havefunwithaich.com</a></p>
        </section>
        
        <p className="update-note">This policy was last updated on December 2, 2025.</p>
      </div>

      <style jsx>{`
        .main-container { background-color: #000; min-height: 100vh; color: #fff; font-family: sans-serif; padding: 60px 20px; }
        .content-wrapper { max-width: 850px; margin: 0 auto; line-height: 1.7; }
        .page-title { font-size: 2.8rem; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
        .introduction-text { font-size: 1.1rem; font-style: italic; color: #aaa; margin-bottom: 30px; }
        hr { border: 0; border-top: 1px solid #333; margin: 40px 0; }
        .section-title { font-size: 1.8rem; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px dotted #333; padding-bottom: 5px; }
        p { margin-bottom: 15px; }
        ul { list-style-type: disc; margin-left: 20px; padding-left: 0; margin-bottom: 20px; }
        li { margin-bottom: 8px; }
        .external-link, .contact-link { color: #00ccff; text-decoration: none; }
        .external-link:hover, .contact-link:hover { text-decoration: underline; }
        .update-note { font-size: 0.85rem; color: #666; margin-top: 50px; }

        @media (max-width: 768px) {
          .page-title { font-size: 2rem; }
          .section-title { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
