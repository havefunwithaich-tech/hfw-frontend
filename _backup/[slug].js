import { GraphQLClient, gql } from 'graphql-request';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const endpoint = process.env.WP_GRAPHQL_URL;
const graphQLClient = new GraphQLClient(endpoint);

const AD_NETWORK_CODE = '/23326444898';

const SLOT_CONFIGS = {
  TOP: {
    slotId: 'div-gpt-ad-video-detail-top',
    unitCode: 'HFWAM_TOP',
    sizes: [[728, 90], [300, 250], [300, 100]],
    mapping: [
      { viewport: [1024, 0], sizes: [[728, 90]] },
      { viewport: [768, 0], sizes: [[728, 90]] },
      { viewport: [0, 0], sizes: [[300, 250], [300, 100]] }
    ]
  },
  MIDDLE: {
    slotId: 'div-gpt-ad-video-detail-middle',
    unitCode: 'HFWAM_MIDDLE',
    sizes: [[336, 280], [300, 250]],
    mapping: [
      { viewport: [1024, 0], sizes: [[336, 280], [300, 250]] },
      { viewport: [768, 0], sizes: [[336, 280], [300, 250]] },
      { viewport: [0, 0], sizes: [[336, 280], [300, 250]] }
    ]
  },
  BOTTOM: {
    slotId: 'div-gpt-ad-video-detail-bottom',
    unitCode: 'HFWAM_BOTTOM',
    sizes: [[970, 250], [728, 90], [300, 250]],
    mapping: [
      { viewport: [1024, 0], sizes: [[970, 250]] },
      { viewport: [768, 0], sizes: [[728, 90]] },
      { viewport: [0, 0], sizes: [[300, 250]] }
    ]
  }
};

const GET_PORTFOLIO_SLUGS = gql`
  query GetPortfolioSlugs {
    portfolios(first: 100) {
      nodes {
        slug
      }
    }
  }
`;

const GET_PORTFOLIO = gql`
  query GetPortfolio($slug: ID!) {
    portfolio(id: $slug, idType: SLUG) {
      title
      content
      slug
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
`;

export async function getStaticPaths() {
  const data = await graphQLClient.request(GET_PORTFOLIO_SLUGS);
  const paths = data.portfolios.nodes.map((item) => ({
    params: { slug: item.slug },
  }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const data = await graphQLClient.request(GET_PORTFOLIO, { slug: params.slug });
  return {
    props: {
      portfolio: data.portfolio || null,
    },
    revalidate: 3600,
  };
}

const AdSlotComponent = ({ config }) => {
  const { slotId, unitCode, sizes, mapping: mappingConfig } = config;

  useEffect(() => {
    if (window.googletag?.cmd) {
      window.googletag.cmd.push(() => {
        const slotExists = googletag
          .pubads()
          .getSlots()
          .some((slot) => slot.getSlotElementId() === slotId);

        if (slotExists) {
          googletag.display(slotId);
          return;
        }

        let mappingBuilder = window.googletag.sizeMapping();
        mappingConfig.forEach((rule) => {
          mappingBuilder = mappingBuilder.addSize(rule.viewport, rule.sizes);
        });
        const mapping = mappingBuilder.build();

        window.googletag
          .defineSlot(
            `${AD_NETWORK_CODE}/${unitCode}`,
            sizes,
            slotId
          )
          .defineSizeMapping(mapping)
          .addService(window.googletag.pubads());

        window.googletag.display(slotId);
      });
    }
  }, [slotId, unitCode, sizes, mappingConfig]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        margin: '30px 0',
      }}
    >
      <div
        id={slotId}
        style={{ minWidth: '300px', minHeight: '100px', height: 'auto' }}
      />
    </div>
  );
};

const DynamicAdSlot = dynamic(() => Promise.resolve(AdSlotComponent), {
  ssr: false,
});

export default function PortfolioPage({ portfolio }) {
  useEffect(() => {
    if (window.googletag?.cmd) {
      window.googletag.cmd.push(() => {
        window.googletag.pubads().enableSingleRequest();
        window.googletag.enableServices();
      });
    }
  }, []);

  if (!portfolio) {
    return <div>Error: Portfolio not found.</div>;
  }

  const imageUrl = portfolio.featuredImage?.node?.sourceUrl;
  const videoSrc = `/video/${encodeURIComponent(portfolio.slug)}.mp4`;

  return (
    <div className="content-container">
      <DynamicAdSlot config={SLOT_CONFIGS.TOP} />

      <h1 style={{ textAlign: 'center' }}>{portfolio.title}</h1>

      <video
        src={videoSrc}
        controls
        playsInline
        poster={imageUrl || undefined}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '800px',
          display: 'block',
          margin: '0 auto 30px',
          borderRadius: '16px',
        }}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      >
        Your browser is not able to play this video.
      </video>

      <DynamicAdSlot config={SLOT_CONFIGS.MIDDLE} />

      <div
        className="video-body"
        dangerouslySetInnerHTML={{ __html: portfolio.content }}
      />

      <DynamicAdSlot config={SLOT_CONFIGS.BOTTOM} />

      <style jsx global>{`
        .video-body {
          overflow-wrap: break-word;
          word-wrap: break-word;
          text-align: center;
        }
        .video-body img,
        .video-body table,
        .video-body figure,
        .video-body iframe {
          max-width: 100% !important;
          height: auto !important;
          width: 100% !important;
          box-sizing: border-box;
          margin: 1em auto;
        }

        #div-gpt-ad-video-detail-top > iframe,
        #div-gpt-ad-video-detail-middle > iframe,
        #div-gpt-ad-video-detail-bottom > iframe {
          margin: 0 !important;
          display: block !important;
        }
      `}</style>
    </div>
  );
}
