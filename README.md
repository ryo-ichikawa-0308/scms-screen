# Simple contract management system 動作検証用画面

本作品群は、[simple-contract-management-system](https://github.com/ryo-ichikawa-0308/simple-contract-management-system)の画面資産である。APIの動作検証を目的として、最小限の画面機能を提供する。

## 概要

本サブモジュールは、下記の3点を目的とする。

1. **API動作検証:** バックエンドの各APIエンドポイントが正しく動作することを検証するため、最小限の画面機能を提供すること。
2. **技術学習:** 著者自身の、Angularフレームワークと関連技術(Angular Material等)を習得するための環境および成果物。
3. **画面設計・実装ガバナンス検討:** 上記の実装プロセスに基づく、画面実装プロセスのガバナンス検討。

## 構成要素

| ファイル/ディレクトリ                     | 役割                     | 備考                     |
| ----------------------------------------- | ------------------------ | ------------------------ |
| [scms-frontend](./scms-frontend/)         | 画面資産                 | 画面の実装資産を格納する |
| [architecture.md](./docs/architecture.md) | 設計資料                 | 画面資産の設計資料       |
| README.md(本書)                           | ドキュメントの概要と構成 |                          |

## 動作確認方法

### 準備

1. 本サブモジュールを[メインモジュール](https://github.com/ryo-ichikawa-0308/simple-contract-management-system)のサブモジュールとしてクローンする。
1. メインモジュールのDevContainerを起動し、メインモジュールのDBサーバ、APIサーバ、APサーバのコンテナが起動していることを確認する。DBマイグレーションと初期データ投入は、開発コンテナ初回起動時に自動で実行される。
1. (オプション: 手動で初期データを再投入する場合)全テーブルのデータを削除し、下記のコマンドで初期データを投入する。

```bash
cd /workspaces/api/scms-backend
npm run batch:init
```

### 実行

1. [http://localhost:4200](http://localhost:4200)にアクセスする。
1. ユーザーID `sample@example.com` パスワード `password`でログインする。

(C)2025 Ryo ICHIKAWA
