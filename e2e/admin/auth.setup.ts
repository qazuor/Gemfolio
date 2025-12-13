import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test as setup } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@gemfolio.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '123';
const AUTH_FILE = path.join(__dirname, '../.auth/admin.json');

/**
 * Setup: Authenticate as admin and save session
 * Note: This requires a valid admin account to be set up in the database
 */
setup('authenticate as admin', async ({ page }) => {
  // Increase default timeout for this test
  setup.setTimeout(120000);

  console.log('[Auth Setup] Starting admin authentication...');
  console.log('[Auth Setup] Environment:');
  console.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`  - CI: ${process.env.CI}`);
  console.log(`  - BETTER_AUTH_URL: ${process.env.BETTER_AUTH_URL || 'NOT SET'}`);
  console.log(`  - BETTER_AUTH_SECRET: ${process.env.BETTER_AUTH_SECRET ? 'SET' : 'NOT SET'}`);

  // Go to login page and wait for full load
  await page.goto('/login', { waitUntil: 'networkidle' });
  console.log('[Auth Setup] Login page loaded');

  // Wait for login form to be visible
  await expect(page.getByRole('heading', { name: /gemfolio/i })).toBeVisible();

  // Wait for React hydration - ensure the button is not disabled initially
  const submitButton = page.getByRole('button', { name: /iniciar sesión/i });
  await submitButton.waitFor({ state: 'visible' });

  // Small delay to ensure React has hydrated
  await page.waitForTimeout(1000);

  // Fill login form using id selectors for more reliability
  const emailInput = page.locator('#email');
  const passwordInput = page.locator('#password');

  await emailInput.waitFor({ state: 'visible' });
  await emailInput.click();
  await emailInput.fill(ADMIN_EMAIL);

  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.click();
  await passwordInput.fill(ADMIN_PASSWORD);

  // Verify the values were filled
  await expect(emailInput).toHaveValue(ADMIN_EMAIL);
  await expect(passwordInput).toHaveValue(ADMIN_PASSWORD);

  console.log('[Auth Setup] Form filled, attempting programmatic login first...');

  // Try programmatic login first (more reliable in CI)
  try {
    const loginResponse = await page.request.post('/api/auth/sign-in/email', {
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[Auth Setup] Programmatic login response:', loginResponse.status());

    // Log response headers to see Set-Cookie headers
    const responseHeaders = loginResponse.headers();
    console.log('[Auth Setup] Response headers:');
    for (const [key, value] of Object.entries(responseHeaders)) {
      if (key.toLowerCase().includes('cookie') || key.toLowerCase() === 'set-cookie') {
        console.log(`  - ${key}: ${value}`);
      }
    }

    // Get all headers as array (Set-Cookie might have multiple values)
    const allHeaders = loginResponse.headersArray();
    const setCookieHeaders = allHeaders.filter((h) => h.name.toLowerCase() === 'set-cookie');
    console.log(`[Auth Setup] Set-Cookie headers count: ${setCookieHeaders.length}`);
    for (const header of setCookieHeaders) {
      console.log(`  - ${header.value.substring(0, 100)}...`);
    }

    // Get cookies from the API response context
    const apiCookies = await page.context().cookies();
    console.log(`[Auth Setup] Cookies after API login: ${apiCookies.length}`);
    for (const cookie of apiCookies) {
      console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
    }

    // Check if we got the session_token from API
    const hasSessionToken = apiCookies.some((c) => c.name === 'better-auth.session_token');
    if (hasSessionToken) {
      console.log('[Auth Setup] Session token obtained via API! Navigating to dashboard...');
      await page.goto('/', { waitUntil: 'networkidle' });
    } else {
      console.log('[Auth Setup] No session token from API, falling back to form submission...');
      await submitButton.click();
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    }
  } catch (e) {
    console.log('[Auth Setup] Programmatic login failed, using form submission:', e);
    await submitButton.click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
  }

  console.log('[Auth Setup] Navigation detected, current URL:', page.url());

  // Wait for page to fully load
  await page.waitForLoadState('networkidle');

  // Check for login errors on current page
  const errorMessage = page.locator('.bg-destructive\\/10, [role="alert"]');
  const hasError = await errorMessage.isVisible().catch(() => false);
  if (hasError) {
    const errorText = await errorMessage.textContent();
    throw new Error(`Login failed: ${errorText}`);
  }

  // Verify we're authenticated by checking we're not on login page
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    // Take a screenshot for debugging
    console.log('[Auth Setup] ERROR: Still on login page. Taking screenshot...');
    throw new Error('Still on login page after login attempt - check screenshot for details');
  }

  // Wait for dashboard content to be visible (important for session to be established)
  // This ensures the session is fully established before saving
  const dashboardHeading = page.getByRole('heading', { name: /dashboard/i });
  const sidebar = page.locator('aside').first();

  // Wait for either dashboard heading or sidebar to be visible
  await Promise.race([
    dashboardHeading.waitFor({ state: 'visible', timeout: 15000 }),
    sidebar.waitFor({ state: 'visible', timeout: 15000 }),
  ]).catch(() => {
    console.warn(
      '[Auth Setup] Dashboard heading/sidebar not found, checking for other authenticated content...'
    );
  });

  // Additional wait to ensure session cookies are properly set
  await page.waitForTimeout(2000);

  // Log ALL cookies for debugging - not filtering to see what's actually set
  const cookies = await page.context().cookies();
  console.log(`[Auth Setup] Total cookies after login: ${cookies.length}`);
  console.log('[Auth Setup] All cookies:');
  for (const cookie of cookies) {
    console.log(
      `  - ${cookie.name}: domain=${cookie.domain}, path=${cookie.path}, secure=${cookie.secure}, httpOnly=${cookie.httpOnly}, sameSite=${cookie.sameSite}, value=${cookie.value.substring(0, 30)}...`
    );
  }

  // Check specifically for session_token
  const sessionToken = cookies.find((c) => c.name === 'better-auth.session_token');
  const sessionData = cookies.find((c) => c.name === 'better-auth.session_data');
  console.log('[Auth Setup] Cookie check:');
  console.log(`  - session_token: ${sessionToken ? 'FOUND' : 'MISSING'}`);
  console.log(`  - session_data: ${sessionData ? 'FOUND' : 'MISSING'}`);

  // Verify session by calling the session endpoint
  try {
    const sessionResponse = await page.request.get('/api/auth/get-session');
    const sessionStatus = sessionResponse.status();
    const sessionBody = await sessionResponse.json().catch(() => ({}));
    console.log('[Auth Setup] Session verification:');
    console.log(`  - status: ${sessionStatus}`);
    console.log(`  - user: ${sessionBody?.user?.email || 'NOT FOUND'}`);
    console.log(`  - session: ${sessionBody?.session?.id ? 'VALID' : 'INVALID'}`);
  } catch (e) {
    console.log('[Auth Setup] Session verification failed:', e);
  }

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });
  console.log('[Auth Setup] Storage state saved to:', AUTH_FILE);

  // Verify the file was created and contains cookies
  if (existsSync(AUTH_FILE)) {
    const savedState = JSON.parse(readFileSync(AUTH_FILE, 'utf-8'));
    console.log('[Auth Setup] Saved storageState contains:');
    console.log(`  - ${savedState.cookies?.length || 0} cookies`);
    console.log(`  - ${savedState.origins?.length || 0} origins`);
    if (savedState.cookies?.length > 0) {
      console.log('[Auth Setup] Saved cookies:');
      for (const cookie of savedState.cookies) {
        console.log(`    - ${cookie.name} (domain: ${cookie.domain})`);
      }
    }
  } else {
    console.error('[Auth Setup] ERROR: Storage state file was not created!');
  }

  // Verify we have the session cookies
  const sessionCookie = cookies.find((c) => c.name.includes('session'));
  if (!sessionCookie) {
    console.warn('[Auth Setup] Warning: No session cookie found after login');
  } else {
    console.log('[Auth Setup] Session cookie found:', sessionCookie.name);
  }

  console.log('[Auth Setup] Authentication setup completed successfully');
});
