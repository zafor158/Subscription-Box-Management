const http = require('http');

function testServer() {
  console.log('🧪 Testing server connection...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is running! Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📊 Health check response:', data);
      
      // Now test subscription plans
      testSubscriptionPlans();
    });
  });

  req.on('error', (error) => {
    console.error('❌ Server connection failed:', error.message);
  });

  req.end();
}

function testSubscriptionPlans() {
  console.log('\n🧪 Testing subscription plans...');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/subscriptions/plans',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`📦 Plans endpoint status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        const plans = JSON.parse(data);
        console.log('✅ Subscription plans loaded successfully!');
        console.log(`📋 Found ${plans.plans.length} plans:`);
        plans.plans.forEach(plan => {
          console.log(`   - ${plan.name}: $${plan.priceMonthly}/month`);
        });
      } else {
        console.log('❌ Plans endpoint failed:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Plans endpoint error:', error.message);
  });

  req.end();
}

testServer();
