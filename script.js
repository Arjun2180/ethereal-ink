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
            id: Date.now(),         
            content,
            likes: 0,
            timestamp: Date.now()
        };

        const stored = loadTiles();
        stored.push(post);
        saveTiles(stored);

        createTile(post, true);    

        textarea.value = '';
        textarea.style.height = 'auto';
        if (charCount) charCount.textContent = '0 chars';
    });
});
