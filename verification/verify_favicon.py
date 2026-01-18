from playwright.sync_api import sync_playwright

def verify_favicon():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Navigate to the local server
        page.goto("http://localhost:4321/perfect-pace/")

        # Check if the favicon link is present in the head
        favicon = page.locator('link[rel="icon"][type="image/svg+xml"]')
        print(f"Favicon found: {favicon.count() > 0}")
        print(f"Favicon href: {favicon.get_attribute('href')}")

        # Take a screenshot of the page to ensure it loads (favicon itself is in head, not visible in viewport body)
        # But we can see if the app loads correctly.
        page.screenshot(path="verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_favicon()
