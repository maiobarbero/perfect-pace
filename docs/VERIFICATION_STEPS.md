# Manual Verification Steps

To verify that the cookie banner effectively blocks Google Analytics until consent is given, follow these steps:

## Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge).
- The "Perfect Pace" application running locally or deployed.

## Steps

### 1. Clear Cookies and Local Storage
1.  Open the application in your browser.
2.  Open **Developer Tools** (F12 or Right Click > Inspect).
3.  Go to the **Application** tab (Chrome/Edge) or **Storage** tab (Firefox).
4.  Under **Local Storage**, right-click the domain and select **Clear**.
5.  Under **Cookies**, right-click the domain and select **Clear**.
6.  Reload the page.

### 2. Verify Blocking (Initial State)
1.  Go to the **Network** tab in Developer Tools.
2.  In the filter box, type `google`.
3.  Ensure the "Disable cache" checkbox is checked.
4.  Reload the page.
5.  **Verify**: You should **NOT** see any requests to `googletagmanager.com` or `google-analytics.com`.
    *   *Note: You might see requests to `fonts.googleapis.com` or `fonts.gstatic.com`. These are for fonts and are considered necessary.*

### 3. Verify Consent Acceptance
1.  On the page, you should see the Cookie Banner at the bottom.
2.  Click **Accept All**.
3.  Look at the **Network** tab immediately.
4.  **Verify**: A new request to `googletagmanager.com` (specifically `gtag/js`) should appear.

### 4. Verify Persistence
1.  Reload the page.
2.  Look at the **Network** tab.
3.  **Verify**: The request to `googletagmanager.com` should appear immediately on load.

## Troubleshooting
-   If you see Google Analytics requests before accepting cookies, ensure you cleared Local Storage correctly. The preference is saved in `cookie_consent` key.
-   If requests don't appear after clicking Accept, ensure your ad blocker is disabled for this site.
