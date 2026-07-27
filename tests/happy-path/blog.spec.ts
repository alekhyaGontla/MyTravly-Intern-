import { test, expect } from '@playwright/test';

test.describe('Module 12: Blog Automation', () => {

    test('BLOG-SCN-01: Verify Explore India section', async ({ page }) => {
        await page.goto('/');
        // The Explore India section should render correctly and be visible
        const exploreIndia = page.getByText('Explore India').first();
        await expect(exploreIndia).toBeVisible();
    });

    test('BLOG-SCN-02: Verify Blogs section', async ({ page }) => {
        await page.goto('/');
        
        // Scroll down to the Blogs section to ensure lazy-loaded cards appear
        const blogsHeading = page.getByText('Blogs', { exact: true }).first();
        await blogsHeading.scrollIntoViewIfNeeded();
        await expect(blogsHeading).toBeVisible({ timeout: 10000 });
        
        // Wait for lazy-loaded blog cards to render after scrolling
        await page.waitForTimeout(2000);

        // Target an individual blog article link with a clean title (excluding %3F titles that cause server-side redirect to the index)
        const readFullLink = page.locator('a[href*="blog-read"]:not([href*="%3F"])').first();
        await expect(readFullLink).toBeVisible({ timeout: 15000 });

        // Handle both same-tab navigation and opening in a new tab/window
        const [newPage] = await Promise.all([
          page.context().waitForEvent('page').catch(() => page),
          readFullLink.click()
        ]);
        const blogArticlePage = newPage || page;
        await blogArticlePage.waitForLoadState('domcontentloaded');

        // Verify that the individual blog reading page (blog-read/?t=...) opened successfully and displays the Follow button from pic 2
        expect(blogArticlePage.url()).toContain('blog-read');
        const followBtn = blogArticlePage.getByRole('button', { name: /Follow/i }).or(blogArticlePage.getByText('Follow', { exact: true })).first();
        await expect(followBtn).toBeVisible({ timeout: 15000 });
    });

});
