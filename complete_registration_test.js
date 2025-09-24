// Complete Registration Test Suite
// Run this in browser console on http://localhost:3000/register

console.log('🚀 Starting Complete Registration Test Suite');

// Test 1: Check if page loaded correctly
console.log('1. Page Check:');
console.log('   - URL:', window.location.href);
console.log('   - Title:', document.title);

// Test 2: Check if React components are loaded
console.log('2. React Components Check:');
const registerForm = document.querySelector('form');
const firstNameInput = document.querySelector('input[name="firstName"]');
const lastNameInput = document.querySelector('input[name="lastName"]');
const emailInput = document.querySelector('input[name="email"]');
const passwordInput = document.querySelector('input[name="password"]');
const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
const submitButton = document.querySelector('button[type="submit"]');

console.log('   - Form element:', registerForm ? '✅ Found' : '❌ Missing');
console.log('   - First Name input:', firstNameInput ? '✅ Found' : '❌ Missing');
console.log('   - Last Name input:', lastNameInput ? '✅ Found' : '❌ Missing');
console.log('   - Email input:', emailInput ? '✅ Found' : '❌ Missing');
console.log('   - Password input:', passwordInput ? '✅ Found' : '❌ Missing');
console.log('   - Confirm Password input:', confirmPasswordInput ? '✅ Found' : '❌ Missing');
console.log('   - Submit button:', submitButton ? '✅ Found' : '❌ Missing');

// Test 3: Check environment variables
console.log('3. Environment Check:');
console.log('   - API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// Test 4: Test form filling
console.log('4. Form Filling Test:');
if (firstNameInput && lastNameInput && emailInput && passwordInput && confirmPasswordInput) {
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser' + Date.now() + '@example.com',
    password: 'testpassword123',
    confirmPassword: 'testpassword123'
  };
  
  // Fill form
  firstNameInput.value = testData.firstName;
  lastNameInput.value = testData.lastName;
  emailInput.value = testData.email;
  passwordInput.value = testData.password;
  confirmPasswordInput.value = testData.confirmPassword;
  
  // Trigger change events
  [firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  
  console.log('   - Form filled with test data:', testData);
  console.log('   - First Name value:', firstNameInput.value);
  console.log('   - Last Name value:', lastNameInput.value);
  console.log('   - Email value:', emailInput.value);
  console.log('   - Password value:', passwordInput.value);
  console.log('   - Confirm Password value:', confirmPasswordInput.value);
}

// Test 5: Test API connectivity
console.log('5. API Connectivity Test:');
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'testconnectivity' + Date.now() + '@example.com',
    password: 'testpassword123'
  })
})
.then(response => {
  console.log('   - API Response Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('   - API Response Data:', data);
  if (data.token) {
    console.log('   - ✅ Registration API is working');
  } else {
    console.log('   - ❌ Registration API returned no token');
  }
})
.catch(error => {
  console.error('   - ❌ API Error:', error);
});

// Test 6: Check localStorage
console.log('6. LocalStorage Check:');
console.log('   - Current token:', localStorage.getItem('token'));
console.log('   - Current user:', localStorage.getItem('user'));

console.log('🏁 Registration Test Suite Complete');
console.log('📝 Next Steps:');
console.log('   1. Check all ✅/❌ indicators above');
console.log('   2. If any ❌ found, that indicates the issue');
console.log('   3. Try manual registration to see specific error');
console.log('   4. Check browser console for any error messages');
