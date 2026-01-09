require('dotenv').config();
const fetch = globalThis.fetch || require('node-fetch');

(async ()=>{
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Origin': 'http://localhost:5175' },
      body: JSON.stringify({ email: 'dasukoteswarnaidu0@gmail.com', password: 'password123' }),
    });

    console.log('STATUS', res.status);
    console.log('CORS ORIGIN HEADER:', res.headers.get('access-control-allow-origin'));
    console.log('BODY', await res.text());
  } catch (err) {
    console.error('ERROR', err);
  }
})();