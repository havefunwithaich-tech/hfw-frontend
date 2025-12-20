import Link from "next/link";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Script from "next/script";

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE || "https://hq.havefunwithaich.com/graphql";

const RAW_VIDEO_BASE = 
  process.env.NEXT_PUBLIC_VIDEO_BASE || 
  process.env.NEXT_PUBLIC_VIDEO_ENDPOINT || 
  "https://hq.havefunwithaich.com/videos/";

const VIDEO_BASE_URL = RAW_VIDEO_BASE.endsWith("/") ? RAW_VIDEO_BASE : `${RAW_VIDEO_BASE}/`;

const IMAGE_BASE_URL = "https://hq.havefunwithaich.com/images";
const GAM_UNIT_PATH = "/23326444898/video_detail";
const HQ_ADS_PLAYLIST = ["/hq-ads/ad01.mp4", "/hq-ads/ad02.mp4", "/hq-ads/ad03.mp4"];

const TIPPING_OPTIONS = {
  tier1: { url: "https://buy.stripe.com/dRm5kvaiLaAF1SPeuX4Vy02?locale=en", label: "$1.00", emoji: "💰" },
  tier2: { url: "https://buy.stripe.com/5kQ28j2QjbEJ1SPbiL4Vy03?locale:en", label: "$2.00", emoji: "☕" },
  tier3: { url: "https://buy.stripe.com/5kQcMX3Un249fJFcmP4Vy04?locale:en", label: "I Love You!!!", price: "$5.00", emoji: "❤️" },
};

const QUERY_BY_SLUG = `
query GetPortfolioBySlug($slug: ID!) {
  portfolio(id: $slug, idType: SLUG) {
    title
    content
    slug
    date
    featuredImage {
      node {
        sourceUrl
        mediaDetails {
          width
          height
        }
      }
    }
  }
}
`;

const QUERY_ALL = `
query GetAllPortfolios {
  portfolios(first: 1000, where: { orderby: { field: DATE, order: DESC } }) {
    nodes {
      slug
      featuredImage {
        node {
          mediaDetails {
            width
            height
          }
        }
      }
    }
  }
}
`;

const generateVideoUrl = (slug, quality, isLandscape) => {
  if (!slug) return "";
  const safeIsLandscape = !!isLandscape;
  const folder = safeIsLandscape ? "landscape" : "portrait";
  
  let sizeSuffix = "720";
  if (quality === "FHD") sizeSuffix = "1080";
  if (quality === "4K") sizeSuffix = "2160";

  return `${VIDEO_BASE_URL}${folder}/${slug}_${sizeSuffix}.mp4`;
};

const useVideoController = (slug, isLandscapeProp) => {
  const videoRef = useRef(null);
  const router = useRouter();

  const [status, setStatus] = useState({
    isPlaying: false,
    isEnded: false,
    isWaiting: true,
  });

  const [config, setConfig] = useState({
    isMuted: true,
    isLoop: true,
    quality: "HD",
    isTheater: false,
  });

  const videoSrc = useMemo(() => {
    return generateVideoUrl(slug, config.quality, isLandscapeProp);
  }, [slug, config.quality, isLandscapeProp]);

  useEffect(() => {
    setConfig(prev => ({ ...prev, quality: "HD" }));
    setStatus(s => ({ ...s, isWaiting: true, isEnded: false, isPlaying: false }));
  }, [slug]);

  const handlers = {
    onPlay: () => setStatus(s => ({ ...s, isPlaying: true, isEnded: false, isWaiting: false })),
    onPause: () => setStatus(s => ({ ...s, isPlaying: false })),
    onEnded: () => setStatus(s => ({ ...s, isPlaying: false, isEnded: true })),
    onWaiting: () => setStatus(s => ({ ...s, isWaiting: true })),
    onPlaying: () => setStatus(s => ({ ...s, isWaiting: false, isPlaying: true })),
    onVolumeChange: () => {
      if (videoRef.current) {
        const currentMuted = videoRef.current.muted || videoRef.current.volume === 0;
        if (currentMuted !== config.isMuted) {
           setConfig(c => ({ ...c, isMuted: currentMuted }));
        }
      }
    },
    onError: (e) => {
        console.error(`[Video Error] Load Failed: ${videoSrc}`, e);
        setStatus(s => ({ ...s, isWaiting: false })); 
    }
  };

  const actions = {
    togglePlay: useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      v.paused ? v.play().catch(e => {}) : v.pause();
    }, []),
    toggleMute: useCallback((e) => {
      e.stopPropagation();
      setConfig(c => ({ ...c, isMuted: !c.isMuted }));
    }, []),
    toggleLoop: useCallback((e) => {
      e.stopPropagation();
      setConfig(c => ({ ...c, isLoop: !c.isLoop }));
    }, []),
    toggleTheater: useCallback((e) => {
      e.stopPropagation();
      setConfig(c => ({ ...c, isTheater: !c.isTheater }));
    }, []),
    cycleQuality: useCallback((e) => {
      e.stopPropagation();
      setStatus(s => ({ ...s, isWaiting: true }));
      setConfig(c => {
        const next = c.quality === "HD" ? "FHD" : c.quality === "FHD" ? "4K" : "HD";
        return { ...c, quality: next };
      });
    }, []),
    replay: useCallback(() => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      v.play().catch(() => {});
      setStatus(s => ({ ...s, isEnded: false, isWaiting: true }));
    }, [])
  };

  useEffect(() => {
    const handleRouteChange = () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      if (videoRef.current) videoRef.current.pause();
    };
  }, [router.events]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    setStatus(s => ({ ...s, isWaiting: true }));
    
    const currentTime = v.currentTime;
    v.load();

    if (currentTime > 0.5) v.currentTime = currentTime;
    
    const tryPlay = async () => {
       try { await v.play(); } catch(e) { }
    };
    tryPlay();

  }, [videoSrc]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = config.isMuted;
  }, [config.isMuted]);

  return { videoRef, videoSrc, status, config, handlers, actions };
};

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
         .gam-container { width: 480px; height: 320px; margin: 0 auto; position: relative; background: transparent; }
         .ad-label { position: absolute; top: 0; left: 0; background: rgba(0,0,0,0.5); color: #fff; font-size: 10px; padding: 3px 8px; z-index: 10; pointer-events: none; font-weight: bold; }
         :global(#${divId}), :global(#${divId} > div), :global(#${divId} iframe) { width: 480px !important; height: 320px !important; display: block !important; margin: 0 !important; border: 0 !important; }
       `}</style>
    </div>
  );
};
const DynamicGamAd = dynamic(() => Promise.resolve(GamAdUnit), { ssr: false, loading: () => <div style={{width:480, height:320}}/> });

const HqPromoAd = () => {
  const [index, setIndex] = useState(0);
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#000" }}>
      <div style={{position:"absolute", top:0, left:0, background:"rgba(0,0,0,0.5)", color:"#fff", fontSize:10, padding:"3px 8px", zIndex:10, pointerEvents:"none", fontWeight:"bold"}}>AD</div>
      <video
        key={HQ_ADS_PLAYLIST[index]}
        src={HQ_ADS_PLAYLIST[index]}
        muted playsInline autoPlay
        onEnded={() => setIndex((prev) => (prev + 1) % HQ_ADS_PLAYLIST.length)}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
};

const DECK_CONTAINER_STYLE = {
  position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
  width: 'max-content', maxWidth: '90%', zIndex: 100, pointerEvents: 'none',
};
const HUD_CONTAINER_STYLE = {
  position: 'absolute', right: '15px', bottom: '150px',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
  zIndex: 100, pointerEvents: 'none',
};
const BTN_STYLE = {
  background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50%",
  width: "42px", height: "42px", display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "1.2rem", color: "#fff", cursor: "pointer", backdropFilter: "blur(4px)",
  transition: "background 0.2s", pointerEvents: "auto", textDecoration: "none"
};

const ControlDeck = ({ config, actions, neighbors }) => {
  return (
    <div style={DECK_CONTAINER_STYLE}>
      <div onClick={actions.toggleTheater} style={BTN_STYLE}>{config.isTheater ? '×' : '□'}</div>
      <div onClick={actions.toggleMute} style={BTN_STYLE}>{config.isMuted ? '🔇' : '🔊'}</div>
      <div onClick={actions.cycleQuality} style={{...BTN_STYLE, color: config.quality === "4K" ? "#ffcc00" : "#fff", fontWeight: config.quality === "4K" ? "bold" : "normal", fontSize: "0.8rem"}}>{config.quality}</div>
      <div onClick={actions.toggleLoop} style={BTN_STYLE}>{config.isLoop ? "🔁" : "🔂"}</div>
      
      {neighbors.prev ? (
         <Link href={`/videos/${neighbors.prev}`} legacyBehavior>
            <a style={BTN_STYLE}>◁</a>
         </Link>
      ) : (
         <div style={{...BTN_STYLE, visibility: 'hidden'}}>◁</div>
      )}

      {neighbors.next ? (
         <Link href={`/videos/${neighbors.next}`} legacyBehavior>
            <a style={{...BTN_STYLE, fontWeight: "bold"}}>▷</a>
         </Link>
      ) : (
         <div style={{...BTN_STYLE, visibility: 'hidden'}}>▷</div>
      )}
    </div>
  );
};

const LikeButton = ({ slug, title }) => {
  const [isLiked, setIsLiked] = useState(false);
  useEffect(() => { if (slug && localStorage.getItem(`liked_${slug}`)) setIsLiked(true); }, [slug]);
  const handleLike = (e) => {
    e.stopPropagation();
    if (isLiked) return;
    setIsLiked(true);
    localStorage.setItem(`liked_${slug}`, "true");
    if (typeof window !== 'undefined' && window.gtag) window.gtag('event', 'like_video', { 'event_category': 'Engagement', 'event_label': title, 'video_slug': slug });
  };
  return (
    <button onClick={handleLike} style={{...BTN_STYLE, 
      background: isLiked ? "rgba(233, 30, 99, 0.2)" : "rgba(0,0,0,0.15)", 
      border: "none", width: "45px", height: "45px", fontSize: "1.5rem", marginBottom: "0px", 
      color: isLiked ? "#e91e63" : "#fff" 
    }}>👍</button>
  );
};

const HudControls = ({ slug, title }) => {
  const hudBtnStyle = { ...BTN_STYLE, background: "rgba(0,0,0,0.15)", border: "none", width: "45px", height: "45px", fontSize: "1.5rem" };
  return (
    <div style={HUD_CONTAINER_STYLE}>
      <LikeButton slug={slug} title={title} />
      <a href={TIPPING_OPTIONS.tier1.url} target="_blank" rel="noopener noreferrer" style={hudBtnStyle} onClick={(e)=>e.stopPropagation()}>{TIPPING_OPTIONS.tier1.emoji}</a>
      <a href={TIPPING_OPTIONS.tier2.url} target="_blank" rel="noopener noreferrer" style={hudBtnStyle} onClick={(e)=>e.stopPropagation()}>{TIPPING_OPTIONS.tier2.emoji}</a>
      <a href={TIPPING_OPTIONS.tier3.url} target="_blank" rel="noopener noreferrer" style={hudBtnStyle} onClick={(e)=>e.stopPropagation()}>{TIPPING_OPTIONS.tier3.emoji}</a>
    </div>
  );
};

export default function VideoDetailPage({ post, neighbors, isLandscape }) {
  const router = useRouter();

  if (router.isFallback) return <div className="full-screen-center">Loading Content...</div>;
  if (!post || !post.slug) {
    return <div className="full-screen-center"><h1>Content Not Found</h1><p>The requested video does not exist.</p></div>;
  }

  const posterUrl = `${IMAGE_BASE_URL}/${post.slug}.webp`;
  const { videoRef, videoSrc, status, config, handlers, actions } = useVideoController(post.slug, isLandscape);

  const touchCoords = useRef({ startX: 0, startY: 0, endX: 0, endY: 0 });

  const onTouchStart = (e) => { 
    touchCoords.current.startX = e.targetTouches[0].clientX; 
    touchCoords.current.startY = e.targetTouches[0].clientY;
    touchCoords.current.endX = e.targetTouches[0].clientX; 
    touchCoords.current.endY = e.targetTouches[0].clientY; 
  };
  
  const onTouchMove = (e) => { 
    touchCoords.current.endX = e.targetTouches[0].clientX; 
    touchCoords.current.endY = e.targetTouches[0].clientY; 
  };
  
  const onTouchEnd = () => {
    const { startX, startY, endX, endY } = touchCoords.current;
    const distX = startX - endX; 
    const distY = startY - endY;

    if (Math.abs(distX) < 60) return;
    if (Math.abs(distY) > Math.abs(distX)) return;

    if (distX > 0 && neighbors.next) {
      router.push(`/videos/${neighbors.next}`);
    } else if (distX < 0 && neighbors.prev) {
      router.push(`/videos/${neighbors.prev}`);
    }
  };

  return (
    <>
      <Script src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" strategy="afterInteractive" />
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-PG1S76T9QW" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-PG1S76T9QW');`}</Script>

      <div className="page-wrapper" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className="video-main-container">
          <div className={`video-container-wrapper ${config.isTheater ? 'theater-mode' : ''}`} style={{position: config.isTheater ? 'fixed' : 'relative'}}>
             
            {status.isWaiting && !status.isPlaying && <div className="loading-overlay">Loading...</div>}
            {!status.isPlaying && !status.isWaiting && !status.isEnded && (
               <div onClick={actions.togglePlay} className="play-button-overlay">▶</div>
            )}

            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterUrl}
              playsInline
              autoPlay
              loop={config.isLoop}
              muted={config.isMuted}
              controlsList="nodownload"
              className="main-video"
              onClick={actions.togglePlay}
              onContextMenu={(e) => e.preventDefault()}
              {...handlers}
            />

            <ControlDeck config={config} actions={actions} neighbors={neighbors} />
            <HudControls slug={post.slug} title={post.title} />

            {status.isEnded && !config.isLoop && (
              <div className="ended-overlay">
                <h2 style={{color:"#fff", marginBottom:"30px", fontSize:"1.8rem"}}>Did the AI Soul Resonate?</h2>
                <div style={{display:"flex", gap:"20px", marginBottom:"40px", pointerEvents:"auto"}}>
                   <HudControls slug={post.slug} title={post.title} />
                </div>
                <button onClick={actions.replay} style={{ background: "none", border: "1px solid #fff", color: "#fff", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize:"1rem", pointerEvents:"auto" }}>Replay</button>
              </div>
            )}
          </div>
        </div>

        {!config.isTheater && (
          <div className="details-section">
            <div className="content-block article-block">
               <div style={{ marginBottom: "20px" }}>
                   <h1 style={{ margin: "0", fontSize: "1.4rem", lineHeight: "1.3", color: isLandscape ? "#ffcc00" : "#66cfff" }}>{post.title}</h1>
                   <div style={{ fontSize: "0.8rem", color: "#666", marginTop:"5px" }}>{post.date?.substring(0,10)}</div>
               </div>
               <div style={{ lineHeight: "1.8", color: "#ddd", fontSize: "1rem" }} dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            <div className="content-block ad-block"><div className="ad-bunker"><DynamicGamAd divId="video-detail-ad-middle" /></div></div>
            <div className="content-block ad-block"><div className="ad-bunker hq-bunker"><HqPromoAd /></div></div>
            <div className="footer-spacer"></div>
          </div>
        )}

        <style jsx>{`
          .page-wrapper { width: 100%; min-height: 100vh; background: #000; color: #fff; overflow-x: hidden; display: flex; flex-direction: column; }
          .full-screen-center { width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; background: #000; }
          .video-main-container { width: 100%; max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
          .video-container-wrapper { width: 100%; height: 85dvh; max-height: 85vh; background: #000; display: flex; justify-content: center; align-items: center; z-index: 20; overflow: hidden; }
          .video-container-wrapper.theater-mode { top: 0; left: 0; width: 100%; height: 100dvh; max-height: none; z-index: 9999; }
          .main-video { width: 100%; height: 100%; display: block; object-fit: contain; cursor: pointer; }
          .loading-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 20; pointer-events: none; color: #fff; font-weight: bold; }
          .play-button-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 25; cursor: pointer; background: rgba(0,0,0,0.4); border-radius: 50%; padding: 20px; backdrop-filter: blur(4px); font-size: 3rem; color: #fff; }
          
          .ended-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 40; padding: 20px; text-align: center; backdrop-filter: blur(2px); }
          .details-section { max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(to bottom, #050505, #111); position: relative; z-index: 10; }
          .content-block { width: 100%; margin-bottom: 60px; }
          .ad-block { display: flex; justify-content: center; }
          .ad-bunker { width: 480px; height: 320px; display: flex; justify-content: center; align-items: center; background: transparent; overflow: visible; }
          .hq-bunker { box-shadow: 0 10px 30px rgba(0,0,0,0.5); overflow: hidden; }
          .footer-spacer { margin-top: 50px; border-top: 1px solid #333; padding-top: 20px; }
        `}</style>
      </div>
    </>
  );
}

const executeQuery = async (query, variables = {}) => {
  const endpoint = GRAPHQL_ENDPOINT;
  
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(200000) 
    });
    const json = await res.json();
    if (res.ok && json?.data) return json.data;
  } catch (e) {
    console.error("POST Fetch Error", e);
  }

  try {
    const params = new URLSearchParams();
    params.set("query", query);
    if (Object.keys(variables).length) {
        params.set("variables", JSON.stringify(variables));
    }
    const res2 = await fetch(`${endpoint}?${params.toString()}`);
    const json2 = await res2.json();
    return json2?.data || null;
  } catch (e) {
    console.error("GET Fetch Error", e);
    return null;
  }
};

export async function getStaticProps({ params }) {
  const slug = params.slug;

  const data = await executeQuery(QUERY_BY_SLUG, { slug });
  if (!data?.portfolio) {
    return { 
        props: { post: { slug, title: "Error", content:"" }, neighbors:{}, isLandscape: false },
        revalidate: 60 
    };
  }

  const post = data.portfolio;
  const media = post.featuredImage?.node?.mediaDetails;
  const w = Number(media?.width);
  const h = Number(media?.height);
  const isLandscape = (Number.isFinite(w) && Number.isFinite(h)) ? w >= h : false;

  const allData = await executeQuery(QUERY_ALL);
  let nodes = allData?.portfolios?.nodes || [];

  nodes = nodes.filter(n => {
     const mw = Number(n.featuredImage?.node?.mediaDetails?.width);
     const mh = Number(n.featuredImage?.node?.mediaDetails?.height);
     const isL = (Number.isFinite(mw) && Number.isFinite(mh)) ? mw >= mh : false;
     return isL === isLandscape;
  });

  const idx = nodes.findIndex(n => n.slug === slug);
  const prev = idx > 0 ? nodes[idx - 1].slug : null;
  const next = idx < nodes.length - 1 ? nodes[idx + 1].slug : null;

  return {
    props: { post, neighbors: { prev, next }, isLandscape },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  // ★修正ポイント: 
  // ビルド時に全ページ生成しようとするとGraphQLサーバーが死ぬため、
  // pathsを空にして「リクエストがあった時に初めて生成する」方式に変更します。
  
  return {
    paths: [], // 空配列 = ビルド時は何も作らない（0秒で終わる）
    fallback: 'blocking', // 初回アクセス時にSSRのように振る舞い、生成してから結果を返す（2回目以降はキャッシュ）
  };
}