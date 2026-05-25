// ─────────────────────────────────────────────
//  Ethereal Ink – Community Posts (script.js)
// ─────────────────────────────────────────────
//
// HOW IT WORKS (plain English):
//
// 1. STORAGE KEY
//    All posts are saved in the browser's localStorage under the key "ei_tiles".
//    localStorage is like a mini database that lives in your browser and survives
//    page refreshes. Each post is an object: { id, content, likes, timestamp }.
//
// 2. LOADING ON PAGE START  (DOMContentLoaded)
//    When the page finishes loading we read the saved posts from localStorage and
//    render each one by calling createTile(). If there are no saved posts we show
//    an "empty state" message instead.
//
// 3. POSTING  (addButton click)
//    When the user clicks Post we:
//    a) Read the textarea value and bail if it's empty / only spaces.
//    b) Build a new post object with a unique id (Date.now()), the content,
//       0 likes, and the current timestamp.
//    c) Add it to the saved array and write the updated array back to localStorage.
//    d) Call createTile() to insert it at the TOP of the grid (prepend).
//    e) Clear the textarea and reset its height.
//
// 4. LIKING  (like button click inside each tile)
//    Likes live inside the post object in localStorage. When a like button is
//    clicked we toggle a "liked" state (one like per session – tracked by a local
//    variable on the button via closure). The count is updated in the DOM and
//    written back to localStorage.
//    NOTE: Previously the code matched posts by content string, which breaks if two
//    posts have identical text. We now use a unique numeric id instead.
//
// 5. DELETING  (✕ button inside each tile)
//    Clicking the delete button removes the post from localStorage and fades the
//    tile out of the DOM – no page reload needed.
//
// 6. TEXTAREA AUTO-RESIZE
//    The textarea grows as you type by setting its height to its scrollHeight.
//    A character counter also updates live so users can gauge post length.
//
// 7. createTile(post, prepend)
//    A pure helper that builds a tile DOM node and optionally prepends vs appends.
//
// 8. saveTiles(array) / loadTiles()
//    Two tiny wrappers around localStorage so the serialization logic lives in
//    one place. If localStorage throws (e.g. private browsing quota) we degrade
//    gracefully without crashing.

const STORAGE_KEY = 'ei_tiles';

function loadTiles() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveTiles(tiles) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tiles));
    } catch {
        console.warn('Could not save to localStorage.');
    }
}

function formatTime(ts) {
    // Turns a Unix timestamp into a friendly "just now / 5m ago / Mar 12" label
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function createTile(post, prepend = false) {
    const container = document.getElementById('tilesContainer');
    const emptyState = container.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.id = post.id;

    // We use a closure variable `liked` and `likes` so each tile's like button
    // tracks its own state independently without hitting localStorage on every render.
    let likes = post.likes;
    let liked = false;

    tile.innerHTML = `
        <div class="tile-body">${escapeHTML(post.content).replace(/\n/g, '<br>')}</div>
        <div class="tile-footer">
            <span class="tile-time">${formatTime(post.timestamp)}</span>
            <div style="display:flex;gap:8px;align-items:center">
                <button class="like-btn" aria-label="Like this post">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M8 13.5S1.5 9.5 1.5 5.5A3.5 3.5 0 0 1 8 3.07 3.5 3.5 0 0 1 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"/>
                    </svg>
                    <span class="like-count">${likes}</span>
                </button>
                <button class="delete-btn" aria-label="Delete post" title="Delete" style="background:none;border:1px solid var(--border);border-radius:99px;padding:5px 10px;cursor:pointer;font-size:13px;color:var(--ink-muted);font-family:var(--sans);transition:all 0.2s">✕</button>
            </div>
        </div>
    `;

    const likeBtn   = tile.querySelector('.like-btn');
    const likeCount = tile.querySelector('.like-count');
    const deleteBtn = tile.querySelector('.delete-btn');

    likeBtn.addEventListener('click', () => {
        liked = !liked;
        likes += liked ? 1 : -1;
        likeCount.textContent = likes;
        likeBtn.classList.toggle('liked', liked);

        // Persist: update only the matching post (by unique id, not content string)
        const tiles = loadTiles().map(t => t.id === post.id ? { ...t, likes } : t);
        saveTiles(tiles);
    });

    deleteBtn.addEventListener('click', () => {
        tile.style.transition = 'opacity 0.25s, transform 0.25s';
        tile.style.opacity = '0';
        tile.style.transform = 'scale(0.97)';
        setTimeout(() => {
            tile.remove();
            const updated = loadTiles().filter(t => t.id !== post.id);
            saveTiles(updated);
            // Show empty state if nothing left
            if (!container.querySelector('.tile')) showEmpty(container);
        }, 250);
    });

    if (prepend && container.firstChild) {
        container.insertBefore(tile, container.firstChild);
    } else {
        container.appendChild(tile);
    }
}

function showEmpty(container) {
    container.innerHTML = `
        <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <p>Be the first to share something.</p>
        </div>`;
}

function escapeHTML(str) {
    // Prevents XSS: turns < > & into safe HTML entities before injecting into DOM
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── BOOT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tilesContainer');
    const tiles = loadTiles();

    if (tiles.length === 0) {
        showEmpty(container);
    } else {
        tiles.forEach(tile => createTile(tile));
    }

    // Textarea auto-resize + character counter
    const textarea  = document.getElementById('userInput');
    const charCount = document.getElementById('charCount');

    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
        if (charCount) charCount.textContent = `${textarea.value.length} chars`;
    });

    // Post button
    document.getElementById('addButton').addEventListener('click', () => {
        const content = textarea.value.trim();
        if (!content) {
            textarea.focus();
            return;
        }

        const post = {
            id: Date.now(),         // unique numeric id – avoids the duplicate-content bug
            content,
            likes: 0,
            timestamp: Date.now()
        };

        const stored = loadTiles();
        stored.push(post);
        saveTiles(stored);

        createTile(post, true);    // prepend = true → newest post appears at the top

        textarea.value = '';
        textarea.style.height = 'auto';
        if (charCount) charCount.textContent = '0 chars';
    });
});
