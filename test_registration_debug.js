// Registration Debug Test
// Run this in your browser console on the registration page

console.log('=== Registration Debug Test ===');

// Test 1: Check API URL
console.log('1. API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// Test 2: Check if backend is reachable
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User'
  })
})
.then(response => {
  console.log('2. Backend Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('3. Backend Response:', data);
})
.catch(error => {
  console.error('4. Backend Error:', error);
});

// Test 3: Check localStorage
console.log('5. Current Token:', localStorage.getItem('token'));
console.log('6. Current User:', localStorage.getItem('user'));

console.log('=== End Debug Test ===');
