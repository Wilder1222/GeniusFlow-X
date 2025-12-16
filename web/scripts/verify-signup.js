

async function testSignup() {
    const email = `schema_test_${Date.now()}@example.com`;
    const password = 'test123456';
    const username = `user_${Date.now()}`;

    console.log(`Testing signup for: ${email}`);

    try {
        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, username }),
        });

        const data = await response.json();

        console.log('Status Code:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
            console.log('SUCCESS: Signup API returned success.');
            console.log('User ID:', data.data?.user?.id || 'N/A');
        } else {
            console.error('FAILURE: Signup API failed.');
        }

    } catch (error) {
        console.error('ERROR: Network or script error', error);
    }
}

testSignup();
