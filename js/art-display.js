/**
 * Lumière Gallery - Art Display Catalog Controller
 * Real-time filter, search, sort, and favorites management
 */

document.addEventListener('DOMContentLoaded', () => {
  initArtCatalog();
  initFavoriteButtons();
});

function initArtCatalog() {
  const searchInput = document.getElementById('art-search');
  const filterPills = document.querySelectorAll('.pill-btn');
  const sortSelect = document.getElementById('art-sort');
  const grid = document.getElementById('art-grid');
  const countEl = document.getElementById('result-count');

  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.art-card'));
  let currentCategory = 'all';
  let searchQuery = '';

  function filterAndSort() {
    let visibleCards = cards.filter(card => {
      const category = card.getAttribute('data-category');
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const artist = (card.getAttribute('data-artist') || '').toLowerCase();

      const matchesCat = (currentCategory === 'all' || category === currentCategory);
      const matchesSearch = title.includes(searchQuery) || artist.includes(searchQuery);

      return matchesCat && matchesSearch;
    });

    // Sort cards
    const sortVal = sortSelect ? sortSelect.value : 'default';
    visibleCards.sort((a, b) => {
      const yearA = parseInt(a.getAttribute('data-year')) || 0;
      const yearB = parseInt(b.getAttribute('data-year')) || 0;
      const titleA = (a.getAttribute('data-title') || '').toLowerCase();
      const titleB = (b.getAttribute('data-title') || '').toLowerCase();

      if (sortVal === 'year-asc') return yearA - yearB;
      if (sortVal === 'year-desc') return yearB - yearA;
      if (sortVal === 'title-asc') return titleA.localeCompare(titleB);
      if (sortVal === 'title-desc') return titleB.localeCompare(titleA);
      return 0;
    });

    // Update DOM
    cards.forEach(card => card.style.display = 'none');
    visibleCards.forEach(card => {
      card.style.display = 'flex';
      grid.appendChild(card);
    });

    if (countEl) {
      countEl.textContent = `Showing ${visibleCards.length} of ${cards.length} artworks`;
    }

    // Empty state
    let emptyMsg = document.getElementById('no-results-msg');
    if (visibleCards.length === 0) {
      if (!emptyMsg) {
        emptyMsg = document.createElement('div');
        emptyMsg.id = 'no-results-msg';
        emptyMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);';
        emptyMsg.innerHTML = `
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 8px;">No artworks found</h3>
          <p>Try adjusting your search terms or filter selection.</p>
        `;
        grid.appendChild(emptyMsg);
      }
      emptyMsg.style.display = 'block';
    } else if (emptyMsg) {
      emptyMsg.style.display = 'none';
    }
  }

  // Pill click listener
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-filter') || 'all';
      filterAndSort();
    });
  });

  // Search input listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterAndSort();
    });
  }

  // Sort select listener
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      filterAndSort();
    });
  }
}

// Favorite toggle interaction
function initFavoriteButtons() {
  const favBtns = document.querySelectorAll('.fav-btn');
  const favorites = JSON.parse(localStorage.getItem('lumiere_favorites') || '[]');

  favBtns.forEach(btn => {
    const artId = btn.getAttribute('data-art-id');
    if (favorites.includes(artId)) {
      btn.style.color = '#e74c3c';
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      let currentFavs = JSON.parse(localStorage.getItem('lumiere_favorites') || '[]');
      if (currentFavs.includes(artId)) {
        currentFavs = currentFavs.filter(id => id !== artId);
        btn.style.color = 'var(--text-muted)';
        showToast('Removed from your collection favorites.');
      } else {
        currentFavs.push(artId);
        btn.style.color = '#e74c3c';
        showToast('Added to your collection favorites!');
      }
      localStorage.setItem('lumiere_favorites', JSON.stringify(currentFavs));
    });
  });
}
