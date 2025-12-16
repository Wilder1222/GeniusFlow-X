
async function testDb() {
    console.log('Testing DB connectivity via API...');

    try {
        const response = await fetch('http://localhost:3000/api/test-db', {
            method: 'GET',
        });

        const text = await response.text();
        console.log('Status Code:', response.status);
        console.log('Response Body:', text);

    } catch (error) {
        console.error('ERROR: Network or script error', error);
    }
}

testDb();
