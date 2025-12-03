// post_login.js
const http = require('http'); // HTTP通信モジュール

const postData = JSON.stringify({
  email: 'ichikawa@example.com',
  password: 'password'
});

const options = {
  hostname: 'api',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let responseBody = '';
  res.setEncoding('utf8');

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log('RESPONSE BODY:');
    console.log(responseBody);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// データをリクエストボディに書き込み、リクエストを終了
req.write(postData);
req.end();