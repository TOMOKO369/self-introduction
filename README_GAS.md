# Daily Reporting Setup (GAS)

このWEBサイトは静的なHTMLページであるため、ページ単体で「毎日夜24時に集計して通知する」という機能を持つことはできません（ページが開かれていないとプログラムが動かないため）。

要望通りの「アクセス数の1日1回の集計通知」を実現するには、Google Apps Script (GAS) などの外部サーバー機能を使うのが一般的です。

## 手順

1. [Google Apps Script](https://script.google.com/) にアクセスし、「新しいプロジェクト」を作成します。
2. 「プロジェクトの設定」→「スクリプト プロパティ」に、プロパティ名 DISCORD_WEBHOOK_URL で、新しく作った Webhook URL を登録します。URL は HTML、JavaScript、README や GitHub に書かないでください。
3. 以下のコードをエディタに貼り付けます。

```javascript
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
  const webhookUrl = props.getProperty('DISCORD_WEBHOOK_URL');
  if (!webhookUrl) {
    throw new Error('DISCORD_WEBHOOK_URL is not configured');
  }
  const count = props.getProperty('daily_info_count') || '0';
  const today = new Date();
  
  const message = {
    content: `📊 **本日のアクセス集計**\n日付: ${today.toLocaleDateString()}\nアクセス数: ${count} 回`
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(message),
    muteHttpExceptions: true
  };
  
  const status = UrlFetchApp.fetch(webhookUrl, options).getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error('Discord notification failed (HTTP ' + status + ')');
  }
  
  // カウントをリセット
  props.setProperty('daily_info_count', '0');
}
```

4. **トリガーの設定**:
   - 左側の時計マーク（トリガー）をクリック。
   - 「トリガーを追加」を選択。
   - 実行する関数: `sendDailyReport`
   - イベントのソース: `時間主導型`
   - タイプ: `日タイマー`
   - 時刻: 午前0時〜午前1時（プロジェクトのタイムゾーンを日本時間に設定）

5. **デプロイ**:
   - 右上の「デプロイ」->「新しいデプロイ」
   - 種類: 「ウェブアプリ」
   - アクセスできるユーザー: 「全員」
   - 「デプロイ」をクリックし、発行された URL をコピーします。

6. **HTMLの修正**:
   - 公開ページから呼び出すのは GAS の Web アプリ URL だけです。公開された計測用 URL は外部からも呼び出せるため、集計は目安です。

現在、公開ページからの Discord 通知は停止しています。再開する場合は上記の設定とデプロイを行ってください。過去に公開した Webhook は、Discord 側で削除してください。
