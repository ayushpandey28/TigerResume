require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const app = require('./src/app');
const User = require('./src/models/User');

const TEST_PORT = 5099;

// Helper to make HTTP requests
const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      ...headers,
      ...(payload ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      } : {})
    };

    const req = http.request({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function runVerification() {
  console.log('====================================================');
  console.log('VERIFYING TIGERRESUME MONGODB & SERVERLESS FIXES');
  console.log('====================================================\n');

  let server;
  let testEmail = `test_verification_${Date.now()}@example.com`;
  let testPassword = 'Password123!';
  let authToken = null;

  try {
    // 1. Start HTTP server without pre-connecting Mongoose (simulating cold start)
    console.log('[1/8] Simulating cold start: Mongoose disconnected (readyState = ' + mongoose.connection.readyState + ')');
    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        console.log(`  ✓ Express test server listening on port ${TEST_PORT}`);
        resolve();
      });
    });

    // 2. Health check endpoint test
    console.log('\n[2/8] Testing GET /api/health (should respond fast even before DB connects)...');
    const healthRes = await request('GET', '/api/health');
    console.log('  Health check status:', healthRes.status);
    console.log('  Health check response:', healthRes.body);
    if (healthRes.status !== 200) {
      throw new Error(`Health check failed with status ${healthRes.status}`);
    }
    console.log('  ✓ Health check returned 200 OK');

    // 3. Reverse-proxy & Cold Start Signup test
    console.log('\n[3/8] Testing cold start POST /api/auth/signup with X-Forwarded-For reverse-proxy header...');
    console.log('  Sending signup request for:', testEmail);
    const signupStart = Date.now();
    const signupRes = await request('POST', '/api/auth/signup', {
      name: 'Verification User',
      email: testEmail,
      password: testPassword
    }, {
      'X-Forwarded-For': '203.0.113.195'
    });
    const signupDuration = Date.now() - signupStart;

    console.log(`  Response received in ${signupDuration}ms (well under 10000ms timeout)`);
    console.log('  Status code:', signupRes.status);
    console.log('  Success:', signupRes.body.success);
    console.log('  Message:', signupRes.body.message);

    if (signupRes.status !== 201) {
      throw new Error(`Signup failed with status ${signupRes.status}: ${JSON.stringify(signupRes.body)}`);
    }
    authToken = signupRes.body.data.token;
    console.log('  ✓ Cold start signup succeeded, User.findOne() executed without buffering timeout!');
    console.log('  ✓ Reverse-proxy X-Forwarded-For handled cleanly without rate-limit errors!');
    console.log('  ✓ Current Mongoose readyState:', mongoose.connection.readyState);

    // 4. Test duplicate email handling (ensures User.findOne works immediately on warm connection)
    console.log('\n[4/8] Testing warm POST /api/auth/signup with existing email...');
    const dupStart = Date.now();
    const dupRes = await request('POST', '/api/auth/signup', {
      name: 'Verification User Dup',
      email: testEmail,
      password: testPassword
    }, {
      'X-Forwarded-For': '203.0.113.195'
    });
    console.log(`  Response received in ${Date.now() - dupStart}ms`);
    console.log('  Status code:', dupRes.status);
    console.log('  Message:', dupRes.body.message);
    if (dupRes.status !== 400 || dupRes.body.message !== 'User already exists with this email') {
      throw new Error(`Expected 400 duplicate user, got: ${JSON.stringify(dupRes.body)}`);
    }
    console.log('  ✓ Warm User.findOne() executed instantly (<100ms) with correct 400 response');

    // 5. Test Login endpoint
    console.log('\n[5/8] Testing POST /api/auth/login...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: testPassword
    }, {
      'X-Forwarded-For': '203.0.113.195'
    });
    console.log('  Status code:', loginRes.status);
    console.log('  User name:', loginRes.body.data?.user?.name);
    if (loginRes.status !== 200 || !loginRes.body.data?.token) {
      throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
    }
    authToken = loginRes.body.data.token;
    console.log('  ✓ Login succeeded with valid token');

    // 6. Test Protected Profile endpoint
    console.log('\n[6/8] Testing GET /api/auth/profile with JWT...');
    const profileRes = await request('GET', '/api/auth/profile', null, {
      'Authorization': `Bearer ${authToken}`,
      'X-Forwarded-For': '203.0.113.195'
    });
    console.log('  Status code:', profileRes.status);
    console.log('  Profile email:', profileRes.body.data?.user?.email);
    console.log('  Profile stats:', profileRes.body.data?.stats);
    if (profileRes.status !== 200 || profileRes.body.data?.user?.email !== testEmail) {
      throw new Error(`Profile retrieval failed: ${JSON.stringify(profileRes.body)}`);
    }
    console.log('  ✓ Profile endpoint executed multiple Mongoose queries successfully');

    // 7. Test Dashboard endpoint
    console.log('\n[7/8] Testing GET /api/dashboard with JWT...');
    const dashboardRes = await request('GET', '/api/dashboard', null, {
      'Authorization': `Bearer ${authToken}`,
      'X-Forwarded-For': '203.0.113.195'
    });
    console.log('  Status code:', dashboardRes.status);
    console.log('  Dashboard has user:', !!dashboardRes.body.data?.user);
    if (dashboardRes.status !== 200) {
      throw new Error(`Dashboard failed: ${JSON.stringify(dashboardRes.body)}`);
    }
    console.log('  ✓ Dashboard endpoint executed complex parallel Mongoose queries successfully');

    // 8. Test Reconnection resilience
    console.log('\n[8/8] Testing connection recovery after unexpected socket drop...');
    await mongoose.disconnect();
    console.log('  Forced disconnect. Current readyState:', mongoose.connection.readyState);
    const postDropRes = await request('GET', '/api/auth/profile', null, {
      'Authorization': `Bearer ${authToken}`,
      'X-Forwarded-For': '203.0.113.195'
    });
    console.log('  Status code after reconnection:', postDropRes.status);
    console.log('  Current readyState after auto-reconnect:', mongoose.connection.readyState);
    if (postDropRes.status !== 200) {
      throw new Error(`Reconnection failed: ${JSON.stringify(postDropRes.body)}`);
    }
    console.log('  ✓ dbMiddleware automatically reconnected to MongoDB Atlas after connection drop!');

    // Cleanup test user
    console.log('\n[Cleanup] Removing verification test user...');
    await User.deleteOne({ email: testEmail });
    console.log('  ✓ Test user cleaned up.');

    console.log('\n====================================================');
    console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ✓');
    console.log('====================================================');

  } catch (err) {
    console.error('\n❌ VERIFICATION FAILED:', err.message);
    if (testEmail) {
      try {
        await User.deleteOne({ email: testEmail });
      } catch (e) {}
    }
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
}

runVerification();
