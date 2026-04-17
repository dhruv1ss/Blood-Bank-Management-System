
const axios = require('axios');

async function testSupport() {
    try {
        console.log('Testing Support API...');
        // We'll need a token, but let's see if we get a 401 (expected) or 404/500
        const res = await axios.post('http://localhost:5001/api/support', {
            subject: 'Test Subject',
            message: 'Test Message'
        });
        console.log('Response:', res.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', error.response.data);
        } else {
            console.log('Error Message:', error.message);
        }
    }
}

testSupport();
