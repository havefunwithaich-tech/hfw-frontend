import Link from "next/link";
import { useEffect } from "react";

export default function ThanksPage() {
  // GAイベントなどを発火させたい場合はここで
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'purchase', { 
            'event_category': 'Donation', 
            'event_label': 'Tip', 
            'value': 1 // 正確な額はURLクエリパラメータ等で取らないと不明ですが、簡易的にはこれで
        });
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      textAlign: "center"
    }}>
      <div style={{
        fontSize: "5rem",
        marginBottom: "20px",
        animation: "bounce 2s infinite"
      }}>
        🎉
      </div>

      <h1 style={{
        fontSize: "2.5rem",
        background: "linear-gradient(45deg, #ff00cc, #3333ff)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "20px"
      }}>
        Thank You for Your Support!
      </h1>

      <p style={{
        fontSize: "1.2rem",
        color: "#ccc",
        maxWidth: "600px",
        lineHeight: "1.8",
        marginBottom: "40px"
      }}>
        Your resonance keeps the AI soul alive.<br/>
        We will continue to create the cutting edge.
      </p>

      <Link href="/" legacyBehavior>
        <a style={{
          padding: "15px 40px",
          border: "1px solid #fff",
          borderRadius: "30px",
          color: "#fff",
          textDecoration: "none",
          fontSize: "1.2rem",
          transition: "background 0.3s",
          background: "rgba(255,255,255,0.1)"
        }}>
          Back to Top
        </a>
      </Link>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
          40% {transform: translateY(-20px);}
          60% {transform: translateY(-10px);}
        }
      `}</style>
    </div>
  );
}
