import Head from 'next/head';

export default function SpecifiedCommercialTransactions() {
  return (
    <div className="main-container">
      <Head>
        <title>特定商取引法に基づく表記 | havefunwithAIch</title>
        <meta name="description" content="Act on Specified Commercial Transactions - required by Japanese law." />
      </Head>

      <div className="content-wrapper">
        <h1 className="page-title">特定商取引法に基づく表記</h1>
        
        <p className="english-disclaimer">
          This page is provided in accordance with Japanese law (Act on Specified Commercial Transactions) and is relevant only to those who reside in Japan.
          It is intended for Japanese customers and required by Japanese financial regulations.
        </p>

        <table className="transaction-table">
          <tbody>
            <tr>
              <th scope="row">販売業者の名称</th>
              <td>小倉 英雄（HavefunwithAIch）</td>
            </tr>
            <tr>
              <th scope="row">所在地</th>
              <td>請求があったら遅滞なく開示いたします</td>
            </tr>
            <tr>
              <th scope="row">電話番号</th>
              <td>請求があったら遅滞なく開示いたします</td>
            </tr>
            <tr>
              <th scope="row">受付時間</th>
              <td>メールにて24時間受付（原則、返信は3営業日以内）</td>
            </tr>
            <tr>
              <th scope="row">メールアドレス</th>
              <td><a href="mailto:contact@havefunwithaich.ghost.io" className="contact-link">contact@havefunwithaich.ghost.io</a></td>
            </tr>
            <tr>
              <th scope="row">運営統括責任者</th>
              <td>小倉 英雄</td>
            </tr>
            <tr>
              <th scope="row">追加手数料等の追加料金</th>
              <td>追加料金なし。</td>
            </tr>
            <tr>
              <th scope="row">交換および返品（返金ポリシー）</th>
              <td>デジタル商品のため、原則として返品・返金には対応しておりません。</td>
            </tr>
            <tr>
              <th scope="row">引渡時期</th>
              <td>決済完了後、即時で購読・視聴可能な状態になります。</td>
            </tr>
            <tr>
              <th scope="row">受け付け可能な決済手段</th>
              <td>クレジットカード（Stripe決済）</td>
            </tr>
            <tr>
              <th scope="row">決済期間</th>
              <td>クレジットカード決済はただちに処理されます。</td>
            </tr>
            <tr>
              <th scope="row">販売価格</th>
              <td>初月無料 $5/月, または $50/年（17%割引） <span className="note">※日本円によるお支払いには対応しておりません</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .main-container { background-color: #000; min-height: 100vh; color: #fff; font-family: sans-serif; padding: 40px 20px; }
        .content-wrapper { max-width: 900px; margin: 0 auto; line-height: 1.6; }
        .page-title { font-size: 2.5rem; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .english-disclaimer { margin-bottom: 40px; font-style: italic; color: #aaa; }

        .transaction-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .transaction-table th, .transaction-table td {
          border: 1px solid #333;
          padding: 12px 15px;
          text-align: left;
          font-size: 1rem;
        }
        .transaction-table th {
          background-color: #1a1a1a;
          width: 35%; /* 項目名の幅を調整 */
          font-weight: bold;
          color: #ddd;
        }
        .transaction-table td {
          background-color: #0d0d0d;
          color: #fff;
        }
        .contact-link {
          color: #00ccff;
          text-decoration: none;
        }
        .contact-link:hover {
          text-decoration: underline;
        }
        .note {
          color: #ff4444; /* 注意書きを強調 */
          font-weight: bold;
          display: block;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
}
