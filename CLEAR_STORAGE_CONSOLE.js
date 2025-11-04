// ========================================
// CLEAR STORAGE AND FIX 401 ERRORS
// ========================================
// Copy and paste this ENTIRE script into your browser console (F12)

console.log('🔧 Starting storage cleanup...');

// Step 1: Clear all storage
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storage cleared!');

// Step 2: Verify it's cleared
console.log('localStorage items:', localStorage.length);
console.log('sessionStorage items:', sessionStorage.length);

// Step 3: Show instructions
console.log('📋 Next steps:');
console.log('1. The page will reload in 2 seconds');
console.log('2. Go to the login page');
console.log('3. Enter your credentials');
console.log('4. Click Login');
console.log('5. After login, run this to verify token:');
console.log('   localStorage.getItem("token")');

// Step 4: Reload the page
setTimeout(() => {
  console.log('🔄 Reloading page...');
  window.location.reload();
}, 2000);

// ========================================
// AFTER LOGIN: Verify Token is Stored
// ========================================
// Copy and paste this AFTER you login:

/*
const token = localStorage.getItem('token');
if (token) {
  console.log('✅ Token found!');
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Check token structure (JWT has 3 parts)
  const parts = token.split('.');
  if (parts.length === 3) {
    console.log('✅ Token structure is correct (3 parts)');
  } else {
    console.log('❌ Token structure is wrong!');
  }
  
  // Check if token has "Bearer " prefix (should NOT)
  if (token.startsWith('Bearer ')) {
    console.log('⚠️ WARNING: Token has "Bearer " prefix - remove it!');
  } else {
    console.log('✅ Token format is correct (no "Bearer " prefix)');
  }
} else {
  console.log('❌ Token NOT found in localStorage!');
  console.log('All localStorage items:', {...localStorage});
  console.log('→ Frontend is not storing the token after login');
}
*/

// ========================================
// CHECK IF TOKEN IS BEING SENT
// ========================================
// After login, check Network tab:
// 1. Open DevTools (F12)
// 2. Go to Network tab
// 3. Make a request (e.g., go to dashboard)
// 4. Click on a request (e.g., /api/interns)
// 5. Go to Headers tab
// 6. Look for Request Headers → Authorization: Bearer ...
// 
// If you see Authorization header: ✅ Token is being sent
// If you don't see it: ❌ Frontend is not sending the token

