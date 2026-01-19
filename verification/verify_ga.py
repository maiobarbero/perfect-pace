
from playwright.sync_api import sync_playwright

def verify_google_analytics():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the page
        page.goto("http://localhost:4321/perfect-pace/")

        # Check if the Google Analytics script is present in the head
        ga_script = page.locator('script[src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"]')
        if ga_script.count() > 0:
            print("SUCCESS: Google Analytics script found.")
        else:
            print("FAILURE: Google Analytics script NOT found.")

        # Check if window.gtag is defined
        is_gtag_defined = page.evaluate("typeof window.gtag === 'function'")
        if is_gtag_defined:
            print("SUCCESS: window.gtag is defined.")
        else:
            print("FAILURE: window.gtag is NOT defined.")

        # Take a screenshot
        page.screenshot(path="verification/ga_verification.png")

        browser.close()

if __name__ == "__main__":
    verify_google_analytics()
