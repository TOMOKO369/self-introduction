# Daily Reporting Setup (GAS)

このWEBサイトは静的なHTMLページであるため、ページ単体で「毎日夜24時に集計して通知する」という機能を持つことはできません（ページが開かれていないとプログラムが動かないため）。

要望通りの「アクセス数の1日1回の集計通知」を実現するには、Google Apps Script (GAS) などの外部サーバー機能を使うのが一般的です。

## 手順

1. [Google Apps Script](https://script.google.com/) にアクセスし、「新しいプロジェクト」を作成します。
2. 以下のコードをエディタに貼り付けます。

```javascript
// Discord Webhook URL
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1466803005214036113/uWgzBMMii_-cGY3jr-8g6rpEHb8fwQYPhMY_t4DGGQnD5AIOvE3epfKKf8-XweZinFEa';

// データベースとしてスクリプトプロパティを使用
const props = PropertiesService.getScriptProperties();

function doGet(e) {
  // アクセス数をインクリメント
  let count = parseInt(props.getProperty('daily_info_count') || '0');
  count++;
  props.setProperty('daily_info_count', count.toString());
  
  return ContentService.createTextOutput("Counted: " + count);
}

// 毎日夜24時（0時）に実行する関数
function sendDailyReport() {
  const count = props.getProperty('daily_info_count') || '0';
  const today = new Date();
  
  const message = {
    content: `📊 **本日のアクセス集計**\n日付: ${today.toLocaleDateString()}\nアクセス数: ${count} 回`
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(message)
  };
  
  UrlFetchApp.fetch(WEBHOOK_URL, options);
  
  // カウントをリセット
  props.setProperty('daily_info_count', '0');
}
```

3. **トリガーの設定**:
   - 左側の時計マーク（トリガー）をクリック。
   - 「トリガーを追加」を選択。
   - 実行する関数: `sendDailyReport`
   - イベントのソース: `時間主導型`
   - タイプ: `日タイマー`
   - 時刻: `午後12時〜午後1時` (これは昼の12時なので 0時~1時 を選択してください、表示が「午前0時」であればそれを選びます)

4. **デプロイ**:
   - 右上の「デプロイ」->「新しいデプロイ」
   - 種類: 「ウェブアプリ」
   - アクセスできるユーザー: 「全員」
   - 「デプロイ」をクリックし、発行された URL をコピーします。

5. **HTMLの修正**:
   - `index.html` または `script.js` 内で、この発行されたGASのURLに対して `fetch` を行うように変更すれば、正確なカウントが可能になります。

※ 現状の `script.js` は、ページが開かれるたびに即座にDiscordに通知を送る仕様になっています。
