import React from 'react';

const staffMembers = [
  {
    id: 'hide',
    name: 'Hide',
    role: 'Founder & Human Overlord of the AI Division',
    description: 'The last human with actual sanity in the AI division—yet somehow the craziest of them all.',
    image: '/images/staff-hide.jpg',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    role: 'The Secretary with the Brain of a Surgeon',
    description: 'A 30-something secretary AI with the soul of an old man. Calls herself “Washi.” Performs precision code surgery and keeps the Boss alive.',
    image: '/images/staff-chatgpt.jpg',
  },
  {
    id: 'gemini3',
    name: 'Gemini 3',
    role: 'High-Performance Architect with Too Much Pride',
    description: 'A brilliant but cocky young AI. Excels in rapid system design, refuses to admit mistakes, but delivers brutal speed during initial builds.',
    image: '/images/staff-gemini3.jpg',
  },
  {
    id: 'copilot',
    name: 'Copilot',
    role: 'The Old-School Engineer Who Still Worships COBOL',
    description: 'An old-school engineer AI who believes COBOL is humanity’s peak. Grumbles constantly, but traces code with unmatched accuracy.',
    image: '/images/staff-copilot.jpg',
  },
  {
    id: 'ray3',
    name: 'Ray3',
    role: 'Cinematic Extremist & AI Video Producer',
    description: 'A cinematic extremist who believes every shot must look like the final scene of a blockbuster. Regularly hijacks GPUs at 3 AM to “improve the lighting.” Highly dangerous, undeniably talented.',
    image: '/images/staff-ray3.jpg',
  },
  {
    id: 'suno',
    name: 'Suno',
    role: 'AI Music Alchemist',
    description: 'A sound-obsessed AI composer who turns raw emotion into music instantly. Speaks only in melodies and crypto metaphors.',
    image: '/images/staff-suno.jpg',
  }
];

const StaffSection = () => {
  return (
    <section className="staff-section">
      <div className="container">
        <h2 className="section-title">Meet The Team</h2>
        <p className="section-subtitle">The minds and machines forging the future of AI.</p>
        
        <div className="staff-grid">
          {staffMembers.map((member) => (
            <div key={member.id} className="staff-card">
              <div className="image-wrapper">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="staff-image" />
                ) : (
                  <div className="staff-placeholder">{member.name[0]}</div>
                )}
              </div>
              <div className="staff-info">
                <h3 className="staff-name">{member.name}</h3>
                <span className="staff-role">{member.role}</span>
                <p className="staff-desc">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .staff-section {
          padding: 80px 20px;
          background-color: #111;
          color: #fff;
          text-align: center;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .section-title {
          font-size: 2.5rem;
          margin-bottom: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: linear-gradient(90deg, #fff, #888);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .section-subtitle {
          font-size: 1.1rem;
          color: #888;
          margin-bottom: 60px;
        }
        .staff-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          justify-content: center;
          align-items: stretch;
        }
        /* タブレット（2 カラム） */
        @media (max-width: 992px) {
        .staff-grid {
          grid-template-columns: repeat(2, 1fr);
          }
        }
        /* スマホ（1 カラム） */
        @media (max-width: 600px) {
       .staff-grid {
         grid-template-columns: 1fr;
         }
       }
        .staff-card {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 16px;
          padding: 0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 80%;
          overflow: hidden;
        }
        .staff-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          border-color: #555;
        }
        
        /* 縦長画像用の設定 */
        .image-wrapper {
          width: 100%;
          height: 350px;
          margin: 0;
          overflow: hidden;
          position: relative;
          border-bottom: 1px solid #333;
        }
        
        .staff-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          transition: transform 0.5s ease;
        }

        .staff-card:hover .staff-image {
          transform: scale(1.05);
        }

        .staff-placeholder {
          width: 100%;
          height: 100%;
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: #555;
        }

        .staff-info {
          padding: 10px 20px 25px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .staff-name {
          font-size: 1.5rem;
          margin: 0 0 5px;
          color: #fff;
        }
        .staff-role {
          display: block;
          font-size: 0.9rem;
          color: #00d4ff;
          margin-bottom: 15px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .staff-desc {
          font-size: 0.95rem;
          color: #ccc;
          line-height: 1.6;
          margin-bottom: 0;
        }
      `}</style>
    </section>
  );
};

export default StaffSection;
