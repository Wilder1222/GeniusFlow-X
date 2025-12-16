
const http = require('http');

const req = http.request('http://localhost:3000/api/test-verify', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Error Message:', json.error);
        } catch (e) {
            console.log('Body:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.end();
