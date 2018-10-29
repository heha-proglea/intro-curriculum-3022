'use strict';
const pug = require('pug');
const util = require('./handler-util');
const Post = require('./post');

function handle(req, res) {
  switch (req.method) {
    case 'GET':
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      // requelizeにて投稿内容を取得する
      Post.findAll({order:[['id', 'DESC']]}).then((posts) => { // sequelizeの関数findAllで、データを全件取得(引数orderにて並び順を逆に変更)
        // pugテンプレートからレンダリングしたものをHTTPレスポンスボディに出力し、終了
        res.end(pug.renderFile('./views/posts.pug', {
          // pugに渡すのは、データベースから取得したデータposts
          posts: posts
        }));
      });
      break;
    case 'POST':
      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        const decoded = decodeURIComponent(body);
        const content = decoded.split('content=')[1];
        console.info('投稿されました: ' + content);
        // 投稿内容をデータベース上に保存する
        Post.create({
          content: content, // 投稿内容
          trackingCookie: null, // ※ Cookieは未実装なのでnull
          postedBy: req.user // 投稿者名
        }).then(() => {
          // 上記処理(DBへの保存)終了後、/postsへリダイレクト
          handleRedirectPosts(req, res);
        });
      });
      break;
    default:
      util.handleBadRequest(req, res);
      break;
  }
}

function handleRedirectPosts(req, res) {
  res.writeHead(303, {
    'Location': '/posts'
  });
  res.end();
}

module.exports = {
  handle: handle
};
