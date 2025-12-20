import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Script from 'next/script';
import Masonry from 'react-masonry-css'; // ★Step 1 でインストールしたライブラリ

const GRAPHQL_ENDPOINT = "https://hq.havefunwithaich.com/graphql";
const PLACEHOLDER_IMG = "https://hq.havefunwithaich.com/site_ad.png";

const FETCH_BATCH_SIZE = 20;

const AD_PATHS = {
  header: '/23326444898/videos_top_ct',
  shorts: '/23326444898/Shorts_First_Item',
  long:   '/23326444898/Long_First_Item'
};

// ===============================================
// 広告ユニットの強化版
// ===============================================
const AdUnit = React.memo(({ path, size, uniqueId, isHeader = false }) => {
  const slotRef = useRef(null);
  const divId = `ad-${uniqueId}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.googletag = window.googletag || { cmd: [] };
    window.googletag.cmd.push(() => {
      let existingSlot = window.googletag.pubads().getSlots().find(s => s.getSlotElementId() === divId);
      
      if (existingSlot) {
        window.googletag.pubads().refresh([existingSlot]);
        return; 
      }

      let newSlot;
      if (isHeader) {
        const mapping = window.googletag.sizeMapping()
          .addSize([750, 0], [728, 90])
          .addSize([0, 0], [468, 60])
          .build();
        newSlot = window.googletag.defineSlot(path, [728, 90], divId)
          .defineSizeMapping(mapping)
          .addService(window.googletag.pubads());
      } else {
        newSlot = window.googletag.defineSlot(path, size, divId)
          .addService(window.googletag.pubads());
      }
      
      slotRef.current = newSlot;

      if (newSlot) {
          window.googletag.display(divId);
      }
    });
  }, [path, size, uniqueId, isHeader]);

  const style = isHeader 
    ? { 
        display: 'grid', placeItems: 'center', width: '100%', minHeight: '90px', margin: '20px 0' 
      }
    : { 
        position: 'relative', width: '100%', height: '100%',
        display: 'grid', placeItems: 'center', backgroundColor: '#000'
      };

  // uniqueIdを key にすることでDOMノードの永続性を確保
  return (
    <div key={uniqueId} style={style}>
      <div id={divId} style={isHeader ? { textAlign: 'center' } : {}}></div>
      {!isHeader && <span style={{ position: 'absolute', bottom: '2px', right: '5px', fontSize: '9px', color: '#444' }}>Ad</span>}
    </div>
  );
});
AdUnit.displayName = 'AdUnit';

// ===============================================
// API通信
// ===============================================
const fetchVideos = async (cursor) => {
  const query = `
    query GetVideos($first: Int, $after: String) {
      portfolios(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
        pageInfo { hasNextPage, endCursor }
        nodes { title, slug, featuredImage { node { sourceUrl, mediaDetails { width, height } } } }
      }
    }
  `;
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { first: FETCH_BATCH_SIZE, after: cursor } })
  });
  const json = await res.json();
  return json.data.portfolios;
};

// ===============================================
// メイン画面
// ===============================================
export default function VideoListPage() {
  const [allNodes, setAllNodes] = useState([]);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
  
  const [activeTab, setActiveTab] = useState('portrait'); 
  const [limits, setLimits] = useState({ portrait: FETCH_BATCH_SIZE, landscape: FETCH_BATCH_SIZE });
  
  const [loadingType, setLoadingType] = useState(null); 
  const isFetched = useRef(false);

  // データの振り分け（メモ化と縦横比の厳密化）
  const portraits = useMemo(() => allNodes.filter(n => {
    const w = n.featuredImage?.node?.mediaDetails?.width || 0;
    const h = n.featuredImage?.node?.mediaDetails?.height || 0;
    // 縦長判定: 縦が横の1.1倍より大きければ縦長
    return h > w * 1.1; 
  }), [allNodes]);

  const landscapes = useMemo(() => allNodes.filter(n => {
    const w = n.featuredImage?.node?.mediaDetails?.width || 0;
    const h = n.featuredImage?.node?.mediaDetails?.height || 0;
    // 横長判定: それ以外
    return h <= w * 1.1;
  }), [allNodes]);

  // データ取得ロジック（追加読み込み）
  const loadMoreData = async (cursor) => {
    try {
      const data = await fetchVideos(cursor);
      
      setAllNodes(prev => {
        const map = new Map(prev.map(i => [i.slug, i]));
        data.nodes.forEach(i => map.set(i.slug, i));
        return Array.from(map.values());
      });
      
      setPageInfo(data.pageInfo);
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // 初回ロード
  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;
    setLoadingType('init');
    loadMoreData(null).finally(() => setLoadingType(null));
  }, []);

  // ★タブ切り替えハンドラ: 非アクティブタブの limits をリセットして連動を物理的に防ぐ
  const handleTabChange = (tab) => {
    const otherTab = tab === 'portrait' ? 'landscape' : 'portrait';
    setLimits(prev => ({ 
      [tab]: prev[tab], 
      // 非アクティブなタブを初期表示件数に戻す
      [otherTab]: FETCH_BATCH_SIZE 
    }));
    setActiveTab(tab);
  };

  // Load Moreハンドラ: アクティブタブの limits のみを更新
  const handleLoadMore = async () => {
    const type = activeTab; 
    
    if (loadingType) return;
    setLoadingType(type);

    const currentLimit = limits[type];
    const currentList = type === 'portrait' ? portraits : landscapes;
    
    // 1. 手持ちのリストに未表示のアイテムがある場合
    if (currentList.length > currentLimit) {
      setLimits(prev => ({ ...prev, [type]: prev[type] + FETCH_BATCH_SIZE }));
      setLoadingType(null);
    } 
    // 2. サーバーに次ページがあり、追加でデータを取得する必要がある場合
    else if (pageInfo.hasNextPage) {
      await loadMoreData(pageInfo.endCursor);
      // データ取得後、現在のタブの件数のみを増やし、他のタブには触れない
      setLimits(prev => ({ ...prev, [type]: prev[type] + FETCH_BATCH_SIZE }));
      setLoadingType(null);
    } 
    else {
      setLoadingType(null);
    }
  };

  // Masonryブレイクポイントの設定
  const breakpointColumns = {
    default: activeTab === 'portrait' ? 4 : 3, 
    1100: activeTab === 'portrait' ? 3 : 2,
    700: 2,
    500: 1
  };
  
  // レンダリング関数
  const renderItems = (fullList, type) => {
    const itemsToShow = fullList.slice(0, limits[type]); 
    const adPath = type === 'portrait' ? AD_PATHS.shorts : AD_PATHS.long;
    const adSize = type === 'portrait' ? [120, 240] : [300, 250];

    return itemsToShow.flatMap((video, index) => {
      const showAd = (index + 1) % 8 === 0;
      // 広告スロットIDを固定: 8で割った商をユニークIDに使用
      const uniqueAdId = `${type}-adslot-${Math.floor((index + 1) / 8)}`; 
      
      const elements = [];

      // 1. ビデオカード
      elements.push(
        <div 
          key={`${type}-vid-${video.slug}`} 
          style={cardStyle}
          className="masonry-item" 
        >
          <Link href={`/videos/${video.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ position: 'relative' }}>
              <img src={video.featuredImage?.node?.sourceUrl || PLACEHOLDER_IMG} 
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} loading="lazy" />
            </div>
            <div style={{ padding: '10px', textAlign: 'center', fontSize: '14px', color: '#ccc' }}>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.title}</div>
            </div>
          </Link>
        </div>
      );

      // 2. 広告スロット
      if (showAd) {
        elements.push(
          <div 
            key={uniqueAdId} 
            style={cardStyle}
            className="masonry-item" 
          >
            <div style={{ position: 'relative', width: '100%', height: 'auto', minHeight: type === 'portrait' ? '240px' : '250px' }}>
              {/* AdUnitコンポーネントに key を持たせ、DOMの再利用を強化 */}
              <AdUnit key={`adunit-${uniqueAdId}`} path={adPath} size={adSize} uniqueId={uniqueAdId} />
            </div>
             {/* Sponsoredテキストを広告枠の外に配置し、動画への混入を防ぐ */}
            <div style={{ padding: '10px', textAlign: 'center', fontSize: '14px', color: '#444', backgroundColor: '#111' }}>
              Sponsored
            </div>
          </div>
        );
      }

      return elements;
    });
  };

  const cardStyle = {
    border: '1px solid #333', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000',
    boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
    marginBottom: '20px' 
  };

  // ロードモアボタンを表示するかどうかの判定
  const canLoadMoreCheck = (type) => {
    const list = type === 'portrait' ? portraits : landscapes;
    return pageInfo.hasNextPage || list.length > limits[type];
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Head>
        <title>HQ Portfolio</title>
      </Head>

      <Script
        src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.googletag = window.googletag || { cmd: [] };
          window.googletag.cmd.push(() => {
            window.googletag.pubads().collapseEmptyDivs();
            window.googletag.enableServices();
          });
        }}
      />

      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <h1 style={{ textAlign: 'center', margin: '40px 0', letterSpacing: '2px' }}>HQ Portfolio</h1>

        <AdUnit path={AD_PATHS.header} uniqueId="header-top" isHeader={true} />

        {/* タブ切り替えボタン */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          <button 
            onClick={() => handleTabChange('portrait')}
            style={activeTab === 'portrait' ? { ...tabButtonStyle, backgroundColor: '#66cfff', color: '#000' } : tabButtonStyle}
          >
            PORTRAIT / SHORTS
          </button>
          <button 
            onClick={() => handleTabChange('landscape')}
            style={activeTab === 'landscape' ? { ...tabButtonStyle, backgroundColor: '#ffcc00', color: '#000' } : tabButtonStyle}
          >
            LANDSCAPE / CINEMATIC
          </button>
        </div>

        {/* Masonryグリッドコンテナ: key={activeTab} でタブ切り替え時に強制再計算 */}
        <section key={activeTab} style={{ marginBottom: '80px' }}>
          {activeTab === 'portrait' && (
            <>
              <h2 style={{ color: '#66cfff', borderBottom: '2px solid #333', paddingBottom: '10px', textAlign: 'center' }}>PORTRAIT / SHORTS</h2>
              {/* Portrait リスト (縦長) */}
              <Masonry
                breakpointCols={breakpointColumns}
                className="my-masonry-grid" 
                columnClassName="my-masonry-grid_column" 
              >
                {renderItems(portraits, 'portrait')}
              </Masonry>
              
              {canLoadMoreCheck('portrait') && (
                <button onClick={handleLoadMore} style={loadBtnStyle} disabled={loadingType === 'portrait'}>
                  {loadingType === 'portrait' ? 'Loading...' : 'Load More Shorts'}
                </button>
              )}
            </>
          )}

          {activeTab === 'landscape' && (
            <>
              <h2 style={{ color: '#ffcc00', borderBottom: '2px solid #333', paddingBottom: '10px', textAlign: 'center' }}>LANDSCAPE / CINEMATIC</h2>
              {/* Landscape リスト (横長) */}
              <Masonry
                breakpointCols={breakpointColumns}
                className="my-masonry-grid" 
                columnClassName="my-masonry-grid_column" 
              >
                {renderItems(landscapes, 'landscape')}
              </Masonry>
            
              {canLoadMoreCheck('landscape') && (
                <button onClick={handleLoadMore} style={{...loadBtnStyle, border: '1px solid #ffcc00'}} disabled={loadingType === 'landscape'}>
                  {loadingType === 'landscape' ? 'Loading...' : 'Load More Cinematic'}
                </button>
              )}
            </>
          )}
        </section>
      </div>
      
      {/* Masonry用の必須CSS定義 */}
      <style jsx global>{`
        .my-masonry-grid {
          display: flex;
          margin-left: -20px; /* gutter size */
          width: auto;
        }
        .my-masonry-grid_column {
          padding-left: 20px; /* gutter size */
          background-clip: padding-box;
        }
      `}</style>

    </div>
  );
}

const loadBtnStyle = {
  display: 'block', margin: '40px auto', padding: '12px 60px', backgroundColor: '#000', color: '#fff',
  border: '1px solid #66cfff', borderRadius: '30px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s'
};

const tabButtonStyle = {
  padding: '10px 20px', margin: '0 5px', border: 'none', borderRadius: '8px', cursor: 'pointer',
  backgroundColor: '#222', color: '#ccc', fontSize: '16px', fontWeight: 'bold', transition: 'all 0.3s'
};