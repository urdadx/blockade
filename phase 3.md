# Phase 3: On-Page Content Filtering

## Goal

Hide individual Twitter/X and Reddit posts when their rendered content matches Blockade's default or user-created blocked keywords. Matching must happen locally and only during active scheduled blocking hours.

## Implementation

### 1. Content Script

Add a WXT content script for:

- `https://x.com/*`
- `https://twitter.com/*`
- `https://reddit.com/*`
- `https://www.reddit.com/*`

The script will read the existing blocking and schedule settings from extension storage. It must react immediately when keywords or schedules change.

### 2. Site Adapters

Keep site-specific selectors isolated so they can be updated independently when a website changes its markup.

- Twitter/X: detect tweet `article` containers.
- Reddit: detect `shreddit-post`, post containers, and relevant `article` elements.

Only post content should be inspected. Navigation, sidebars, dialogs, and unrelated page text must not trigger filtering.

### 3. Keyword Matching

Normalize rendered post content before matching:

- Convert text to lowercase.
- Apply Unicode normalization.
- Collapse repeated whitespace.
- Include visible text, links, hashtags, and useful accessibility labels.
- Exclude scripts, styles, hidden metadata, form fields, and editable content.

Match both built-in adult keywords and user-created blocked keywords. Filtering should only run while the blocking schedule is active.

### 4. Hide Matching Posts

When a post matches:

- Add a Blockade data attribute and CSS class to the post container.
- Hide only the matching post, not the entire page or feed.
- Restore the post when its keyword is removed or scheduled blocking becomes inactive.

### 5. SPA and Infinite-Scroll Support

Twitter/X and Reddit dynamically add content without full page reloads.

- Observe added content with a debounced `MutationObserver`.
- Inspect only newly added or changed post containers.
- Cache each post's last scanned text to avoid repeated processing.
- Rescan visible posts after relevant storage changes.

### 6. Privacy

All content analysis must remain local to the browser.

- Do not send page text or matched content to Google.
- Do not send page text or matched content to Blockade servers.
- Do not include post content in analytics.
- Do not count every hidden post as a normal blocked-page attempt.

## Limitations

- Image-only content will not be detected without a separate image-classification system.
- Site markup changes may require adapter selector updates.
- Obfuscated terms such as `p0rn` or `p.o.r.n` require explicit normalization rules and careful false-positive testing.

## Verification

- Confirm matching posts are hidden on Twitter/X search results and timelines.
- Confirm matching posts are hidden on Reddit feeds and post pages.
- Confirm unrelated posts remain visible.
- Confirm newly loaded posts are scanned.
- Confirm hidden posts return when blocking hours end.
- Confirm keyword additions and removals apply without reloading the page.
- Confirm no page content leaves the browser.
