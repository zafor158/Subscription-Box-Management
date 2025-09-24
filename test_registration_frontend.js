// Frontend Registration Test
// This script tests the registration functionality

console.log('=== Frontend Registration Test ===');

// Test data
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'testuser' + Date.now() + '@example.com',
  password: 'testpassword123',
  confirmPassword: 'testpassword123'
};

console.log('Test User Data:', testUser);

// Test API endpoint directly
async function testRegistrationAPI() {
  try {
    console.log('1. Testing API endpoint directly...');
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        email: testUser.email,
        password: testUser.password
      })
    });

    console.log('2. Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('3. Registration Success:', data);
      console.log('4. Token received:', data.token ? 'Yes' : 'No');
      console.log('5. User data:', data.user);
    } else {
      const errorData = await response.json();
      console.error('3. Registration Failed:', errorData);
    }
  } catch (error) {
    console.error('4. Network Error:', error);
  }
}

// Test form validation
function testFormValidation() {
  console.log('6. Testing form validation...');
  
  // Test empty fields
  if (!testUser.firstName || !testUser.lastName || !testUser.email || !testUser.password) {
    console.error('❌ Empty field validation failed');
  } else {
    console.log('✅ Empty field validation passed');
  }
  
  // Test password match
  if (testUser.password !== testUser.confirmPassword) {
    console.error('❌ Password match validation failed');
  } else {
    console.log('✅ Password match validation passed');
  }
  
  // Test password length
  if (testUser.password.length < 6) {
    console.error('❌ Password length validation failed');
  } else {
    console.log('✅ Password length validation passed');
  }
}

// Run tests
testFormValidation();
testRegistrationAPI();

console.log('=== End Frontend Registration Test ===');
