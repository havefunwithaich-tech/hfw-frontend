import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import dynamic from "next/dynamic";
import Script from "next/script";

const GAM_UNIT_PATH = "/23326444898/video_detail";
const HQ_ADS_PLAYLIST = ["L121", "L122", "L123"];

const formatTitle = (text) => {
  if (!text) return "";
  return text.replace(/-/g, " ").replace(/_/g, " ").toUpperCase();
};

export async function getServerSideProps({ req, query }) {
  const targetSlug = query.slug || null;
  let rawList = [];

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const res = await fetch(`${protocol}://${host}/?type=list`);

    if (res.ok) {
      const data = await res.json();
      rawList = data.media || [];
    }
  } catch (e) {}

  const portraitVideos = rawList
    .filter(item => item.content_id && item.content_id.startsWith('P'))
    .map(item => ({
        content_id: item.content_id,
        title: item.title,
        tags: item.tag ? item.tag.split(',').map(t => t.trim()).filter(Boolean) : (item.tags || [])
    }));

  let initialIndex = 0;
  if (targetSlug) {
    const foundIndex = portraitVideos.findIndex(v => v.content_id === targetSlug);
    if (foundIndex >= 0) initialIndex = foundIndex;
  }

  return {
    props: {
      initialPlaylist: portraitVideos,
      initialIndex: initialIndex
    }
  };
}

const GamAdUnit = ({ divId }) => {
  useEffect(() => {
    if (typeof window === "undefined" || !window.googletag) return;
    window.googletag.cmd.push(() => {
      const gpt = window.googletag;
      const pubads = gpt.pubads();
      const existing = pubads.getSlots().find(s => s.getSlotElementId() === divId);
      if (existing) gpt.destroySlots([existing]);
      gpt.defineSlot(GAM_UNIT_PATH, [[480, 320], [336, 280], [300, 250]], divId).addService(pubads);
      gpt.enableServices();
      gpt.display(divId);
    });
  }, [divId]);
  return (
    <div className="gam-container">
      <div className="ad-label">AD</div>
      <div id={divId}></div>
      <style jsx>{`
        .gam-container { width: 480px; height: 320px; margin: 0 auto; position: relative; }
        .ad-label { position: absolute; top: 0; left: 0; background: rgba(0,0,0,0.5); color: #fff; font-size: 10px; padding: 3px 8px; z-index: 10; pointer-events: none; font-weight: bold; }
        :global(#${divId}), :global(#${divId} > div), :global(#${divId} iframe) { width: 480px !important; height: 320px !important; display: block !important; border: 0 !important; }
      `}</style>
    </div>
  );
};
const DynamicGamAd = dynamic(() => Promise.resolve(GamAdUnit), { ssr: false, loading: () => <div style={{width:480, height:320, background:"#111"}}/> });

const HqPromoAd = () => {
  const [index, setIndex] = useState(0);

  const adSrc = `/?content_id=${HQ_ADS_PLAYLIST[index]}&type=ad`;

  const handleAdError = () => {
    setIndex((prev) => (prev + 1) % HQ_ADS_PLAYLIST.length);
  };

  const handleEnded = () => {
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % HQ_ADS_PLAYLIST.length);
    }, 100);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#000" }}>
      <div style={{position:"absolute", top:0, left:0, background:"rgba(0,0,0,0.5)", color:"#fff", fontSize:10, padding:"3px 8px", zIndex:10, pointerEvents:"none", fontWeight:"bold"}}>AD</div>
      <video
        key={adSrc}
        src={adSrc}
        muted playsInline autoPlay 
        onEnded={handleEnded}
        onError={handleAdError}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
};

const ControlDeck = ({ config, quality, actions }) => {
  return (
    <div className="control-deck">
      <div onClick={actions.prevVideo} className="deck-btn">⏮</div>
      <div onClick={actions.nextVideo} className="deck-btn">⏭</div>
      <div onClick={actions.cycleQuality} className="deck-btn quality-btn">
        <span>{quality}</span>
      </div>
      <div onClick={actions.toggleTheater} className="deck-btn">{config.isTheater ? '×' : '□'}</div>
      <div onClick={actions.toggleMute} className="deck-btn">{config.isMuted ? '🔇' : '🔊'}</div>
      <div onClick={actions.toggleLoop} className="deck-btn">{config.isLoop ? "🔁" : "➡"}</div>
      <style jsx>{`
        .control-deck { display: flex; gap: 12px; pointer-events: auto; }
        .deck-btn {
          width: 42px; height: 42px;
          background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%; display: flex; alignItems: center; justifyContent: center;
          color: #fff; font-size: 1.2rem; cursor: pointer; backdrop-filter: blur(4px);
          transition: all 0.2s; user-select: none;
        }
        .deck-btn:hover { transform: translateY(-5px); background: rgba(0,0,0,0.8); border-color: rgba(255,255,255,0.5); }
        .quality-btn { font-size: 0.7rem; font-weight: bold; flex-direction: column; line-height: 1; }
        @media (max-width: 768px) {
          .deck-btn { width: 34px; height: 34px; font-size: 1rem; }
          .control-deck { gap: 8px; }
        }
      `}</style>
    </div>
  );
};

const ActionButtons = ({ isLiked, onToggleLike, currentVideo }) => {
  const shareData = useMemo(() => {
    if (!currentVideo) return null;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/videos/portrait/${currentVideo.content_id}`;
    const text = `${currentVideo.title || 'Amazing AI Video'} #havefunwithAIch`;
    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    };
  }, [currentVideo]);

  return (
    <div className="action-buttons-container">
      <div className={`action-btn like-btn ${isLiked ? 'liked' : ''}`} onClick={onToggleLike}>
        {isLiked ? '♥' : '♡'}
      </div>
      {shareData && (
        <a 
          href={shareData.twitter} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="action-btn sns-btn"
          onClick={(e) => e.stopPropagation()}
        >
          𝕏
        </a>
      )}
      <style jsx>{`
        .action-buttons-container { display: flex; flex-direction: column; gap: 15px; pointer-events: auto; z-index: 102; }
        .action-btn {
          width: 40px; height: 40px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%; display: flex; alignItems: center; justifyContent: center;
          color: #fff; font-size: 1.3rem; cursor: pointer; backdrop-filter: blur(4px);
          transition: all 0.2s; text-decoration: none; user-select: none;
        }
        .action-btn:hover { transform: translateY(-5px); background: rgba(0,0,0,0.8); border-color: rgba(255,255,255,0.5); }
        .like-btn.liked { color: #ff4757; border-color: #ff4757; background: rgba(255, 71, 87, 0.15); }
        .sns-btn { font-size: 1.1rem; }
      `}</style>
    </div>
  );
};

export default function PortraitPlayer({ initialPlaylist = [], initialIndex = 0 }) {
  const router = useRouter();
  
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  const [isLiked, setIsLiked] = useState(false);
  const [currentQuality, setCurrentQuality] = useState("720");

  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  useEffect(() => {
    if (initialPlaylist && initialPlaylist.length > 0) {
      setPlaylist(initialPlaylist);
      setCurrentIndex(initialIndex);
    }
  }, [initialPlaylist, initialIndex]);

  const videoRef = useRef(null);
  const [config, setConfig] = useState({ isMuted: true, isLoop: false, isTheater: false });
  const [status, setStatus] = useState({ isPlaying: false, isError: false });

  useEffect(() => {
    document.body.style.overflow = config.isTheater ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [config.isTheater]);

  const currentVideo = useMemo(() => {
    if (!playlist || playlist.length === 0 || currentIndex < 0 || currentIndex >= playlist.length) return null;
    return playlist[currentIndex];
  }, [currentIndex, playlist]);

  useEffect(() => { setIsLiked(false); }, [currentIndex]);

  const videoSrc = useMemo(() => {
    if (!currentVideo) return null;
    return `/?content_id=${currentVideo.content_id}&type=video`;
  }, [currentVideo]);

  useEffect(() => {
    if (videoSrc) {
      setStatus(s => ({ ...s, isError: false }));
    }
  }, [videoSrc]);

  const metaInfo = useMemo(() => {
    if (!currentVideo) {
      return {
        title: "HQ Player | havefunwithAIch",
        description: "Official AI Video Player",
        url: "",
        image: "",
      };
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const permalink = `${origin}/videos/portrait/${currentVideo.content_id}`;
    const dynamicImage = `${origin}/?content_id=${currentVideo.content_id}&type=image`;
    
    return {
      title: `${currentVideo.title} | HQ Player`,
      description: `Watch ${currentVideo.title}. AI-generated content by havefunwithAIch.`,
      url: permalink,
      image: dynamicImage,
    };
  }, [currentVideo]);

  const actions = {
    togglePlay: useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      v.paused ? v.play().catch(() => {}) : v.pause();
    }, []),
    toggleMute: useCallback((e) => { e && e.stopPropagation(); setConfig(c => ({ ...c, isMuted: !c.isMuted })); }, []),
    toggleLoop: useCallback((e) => { e && e.stopPropagation(); setConfig(c => ({ ...c, isLoop: !c.isLoop })); }, []),
    toggleTheater: useCallback((e) => { e && e.stopPropagation(); setConfig(c => ({ ...c, isTheater: !c.isTheater })); }, []),
    cycleQuality: useCallback((e) => { 
        e && e.stopPropagation(); 
        console.log("Quality switch requested - Backend pending");
    }, []),
    nextVideo: useCallback((e) => {
        e && e.stopPropagation();
        if (playlist.length <= 1) return;
        setCurrentIndex(prev => (prev + 1) % playlist.length);
    }, [playlist.length]),
    prevVideo: useCallback((e) => {
        e && e.stopPropagation();
        if (playlist.length <= 1) return;
        setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    }, [playlist.length]),
    toggleLike: useCallback((e) => { e && e.stopPropagation(); setIsLiked(prev => !prev); }, []),
  };

  const handleEnded = useCallback(() => {
    if (config.isLoop) return;
    if (playlist.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % playlist.length);
  }, [config.isLoop, playlist.length]);

  useEffect(() => {
    if (videoRef.current && videoSrc) {
        const wasPlaying = !videoRef.current.paused || status.isPlaying;
        videoRef.current.load();
        if (wasPlaying || config.isLoop || config.isMuted) {
           videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        }
    }
  }, [videoSrc]);

  const minSwipeDistance = 50;
  const onTouchStart = (e) => {
    touchEndRef.current = null;
    touchStartRef.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    const isNextSwipe = distance > minSwipeDistance;
    const isPrevSwipe = distance < -minSwipeDistance;

    if (isNextSwipe) actions.nextVideo();
    else if (isPrevSwipe) actions.prevVideo();
  };

  if (!router.isReady) return null;

  return (
    <div className="page-wrapper">
      <Head>
        <title>{metaInfo.title}</title>
        <meta name="description" content={metaInfo.description} />
        <link rel="canonical" href={metaInfo.url} />
        <meta property="og:title" content={metaInfo.title} />
        <meta property="og:description" content={metaInfo.description} />
        <meta property="og:url" content={metaInfo.url} />
        <meta property="og:image" content={metaInfo.image} />
        <meta property="og:type" content="video.other" />
        <meta property="og:site_name" content="havefunwithAIch" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaInfo.title} />
        <meta name="twitter:description" content={metaInfo.description} />
        <meta name="twitter:image" content={metaInfo.image} />
      </Head>

      <Script src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" strategy="afterInteractive" />
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-PG1S76T9QW" strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-PG1S76T9QW');`}</Script>

      <div className="video-main-container">
        <div
            className={`video-container-wrapper ${config.isTheater ? 'theater-mode' : ''}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
          {(!videoSrc && !status.isError && playlist.length === 0) && <div className="loading-overlay">Loading...</div>}
          {status.isError && <div className="loading-overlay"><h2>Video Unavailable</h2></div>}

          <video
            ref={videoRef}
            src={videoSrc || ""}
            key={videoSrc}
            playsInline autoPlay
            muted={config.isMuted}
            loop={config.isLoop}
            className="main-video"
            onClick={actions.togglePlay}
            onContextMenu={(e) => e.preventDefault()}
            onEnded={handleEnded}
            onError={() => setStatus(s => ({...s, isError: true}))}
            onPlay={() => setStatus(s => ({...s, isPlaying: true, isError: false}))}
            onPause={() => setStatus(s => ({...s, isPlaying: false}))}
          />

          <div className="ui-layer">
            <div className="deck-wrapper">
                <ControlDeck config={config} quality={currentQuality} actions={actions} />
            </div>
            <div className="action-wrapper">
                <ActionButtons 
                  isLiked={isLiked} 
                  onToggleLike={actions.toggleLike} 
                  currentVideo={currentVideo} 
                />
            </div>
          </div>
        </div>
      </div>

     {!config.isTheater && (
        <div className="details-section">
          <div className="content-block title-block">
             <h1 style={{ margin: "0", fontSize: "1.6rem", textAlign: "center", color: "#66cfff", letterSpacing:"2px" }}>
               {currentVideo ? (currentVideo.title || formatTitle(currentVideo.content_id)) : "LOADING..."}
             </h1>

             {currentVideo && currentVideo.tags && currentVideo.tags.length > 0 && (
               <div className="tag-container">
                 {currentVideo.tags.map((tagName, idx) => (
                   <span key={idx} className="tag-label">{tagName}</span>
                 ))}
               </div>
             )}
          </div>

          <div className="content-block ad-block"><DynamicGamAd divId="video-detail-ad-middle" /></div>
          <div className="content-block ad-block"><div className="hq-bunker"><HqPromoAd /></div></div>
        </div>
      )}

      <style jsx>{`
        .page-wrapper { width: 100%; min-height: 100vh; background: #000; color: #fff; overflow-x: hidden; display: flex; flex-direction: column; }
        .video-main-container { width: 100%; margin: 0 auto; display: flex; justify-content: center; }

        .video-container-wrapper {
            width: 100%; max-width: 500px; aspect-ratio: 9 / 16;
            background: #000; display: flex; justify-content: center; align-items: center;
            z-index: 20; overflow: hidden; position: relative; touch-action: pan-y;
        }

        .video-container-wrapper.theater-mode {
            position: fixed; top: 0; left: 0; width: 100%; height: 100dvh;
            max-width: none; aspect-ratio: unset; z-index: 9999; object-fit: contain;
        }

        .main-video { width: 100%; height: 100%; object-fit: contain; cursor: pointer; position: relative; z-index: 0; }
        .loading-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 20; color: #fff; }

        .ui-layer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; pointer-events: none; }
        .deck-wrapper { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 101; }
        .action-wrapper { position: absolute; bottom: 100px; right: 10px; z-index: 101; }

        .tag-container { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-top: 10px; margin-bottom: 20px; }
        .tag-label {
          background: rgba(102, 207, 255, 0.1); border: 1px solid #66cfff;
          color: #66cfff; font-size: 0.75rem; padding: 3px 10px;
          border-radius: 4px; font-weight: bold; text-transform: uppercase; white-space: nowrap;
        }
        
        .details-section { max-width: 800px; margin: 0 auto; padding: 20px; width: 100%; }
        .content-block { width: 100%; margin-bottom: 50px; }
        .ad-block { display: flex; justify-content: center; }
        .hq-bunker { width: 480px; height: 320px; border: 1px solid #222; overflow: hidden; }

        @media (max-width: 768px) {
            .action-wrapper { bottom: 90px; }
        }
      `}</style>
    </div>
  );
}