import Fuse from 'fuse.js';

interface HomepageControllerOptions {
  data: any[];
  labels: Record<string, string>;
  catalogPaths: Record<string, string>;
}

export function attachHomepageController({ data, labels, catalogPaths }: HomepageControllerOptions) {
  const init = () => {
    const fuse = new Fuse(data, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'shortname', weight: 0.3 },
        { name: 'meta.keywords', weight: 0.2 },
        { name: 'description', weight: 0.1 },
      ],
      threshold: 0.2,
      ignoreLocation: true,
    });

    let activeCategory = 'all';
    let searchQuery = '';

    const mainGrid = document.getElementById('main-grid')!;
    const emptyState = document.getElementById('empty-state')!;
    const emptyMessage = document.getElementById('empty-message')!;
    const countDisplay = document.getElementById('count-display')!;
    const allCards = document.querySelectorAll<HTMLElement>('[data-institution-id]');

    function showToast(message: string, type: 'success' | 'error' = 'success') {
      const container = document.getElementById('toast-container')!;
      const el = document.createElement('div');
      el.className = `px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg ${
        type === 'success' ? 'bg-surface-900 text-white' : 'bg-red-600 text-white'
      }`;
      el.textContent = message;
      container.appendChild(el);
      setTimeout(() => {
        el.style.transition = 'opacity 0.25s';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 260);
      }, 2000);
    }

    function readUrlState() {
      const p = new URLSearchParams(window.location.search);
      const cat = p.get('categorie') || p.get('cat');
      const q = p.get('q');
      if (cat && cat !== 'all') activeCategory = cat;
      if (q) {
        searchQuery = q;
        document.querySelectorAll<HTMLInputElement>('.search-input-field').forEach(el => { el.value = q; });
      }
    }

    function writeUrlState() {
      const p = new URLSearchParams();
      if (activeCategory !== 'all') p.set('categorie', activeCategory);
      if (searchQuery.trim()) p.set('q', searchQuery.trim());
      const qs = p.toString();
      history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
    }

    function filterAndSearch() {
      const query = searchQuery.toLowerCase().trim();
      const hits = query ? new Set(fuse.search(query).map((r: any) => r.item.slug)) : null;
      let visible = 0;

      allCards.forEach(card => {
        const slug = card.dataset.institutionId!;
        const cat = card.dataset.cardCategory!;
        const matchCat = activeCategory === 'all' || cat === activeCategory;
        const matchSearch = !hits || hits.has(slug);
        const show = matchCat && matchSearch;
        card.classList.toggle('hidden', !show);
        if (show) visible++;
      });

      countDisplay.textContent = `${visible} ${visible === 1 ? 'instituție' : 'instituții'}`;

      const isEmpty = visible === 0;
      emptyState.classList.toggle('hidden', !isEmpty);
      mainGrid.classList.toggle('hidden', isEmpty);
      if (isEmpty && query) {
        emptyMessage.textContent = `Nu am găsit nicio instituție pentru „${searchQuery.trim()}".`;
      } else if (isEmpty) {
        emptyMessage.textContent = 'Nu am găsit nicio instituție în această categorie.';
      }

      updateActiveButtons();
      writeUrlState();
    }

    function updateActiveButtons() {
      document.querySelectorAll<HTMLElement>('[data-sidebar-cat]').forEach(btn => {
        btn.classList.toggle('sidebar-cat-active', btn.dataset.sidebarCat === activeCategory);
      });
      document.querySelectorAll<HTMLElement>('[data-mobile-cat]').forEach(btn => {
        const isActive = btn.dataset.mobileCat === activeCategory;
        btn.classList.toggle('category-chip--active', isActive);
        btn.classList.toggle('category-chip--inactive', !isActive);
      });
    }

    const desktopInput = document.getElementById('search-input-desktop') as HTMLInputElement;
    const mobileInput = document.getElementById('search-input-mobile') as HTMLInputElement;

    function syncInputs(value: string, source: HTMLInputElement) {
      [desktopInput, mobileInput].forEach(el => {
        if (el && el !== source) el.value = value;
      });
    }

    desktopInput?.addEventListener('input', e => {
      searchQuery = (e.target as HTMLInputElement).value;
      syncInputs(searchQuery, e.target as HTMLInputElement);
      filterAndSearch();
    });

    desktopInput?.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        desktopInput.value = '';
        searchQuery = '';
        activeCategory = 'all';
        filterAndSearch();
      }
    });

    mobileInput?.addEventListener('input', e => {
      searchQuery = (e.target as HTMLInputElement).value;
      syncInputs(searchQuery, e.target as HTMLInputElement);
      filterAndSearch();
    });

    document.addEventListener('keydown', e => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) &&
        document.activeElement !== desktopInput &&
        document.activeElement !== mobileInput
      ) {
        e.preventDefault();
        (window.innerWidth >= 1024 ? desktopInput : mobileInput)?.focus();
      }
    });

    document.addEventListener('click', async e => {
      const target = e.target as HTMLElement;

      const sidebarBtn = target.closest<HTMLElement>('[data-sidebar-cat]');
      if (sidebarBtn) {
        activeCategory = sidebarBtn.dataset.sidebarCat!;
        filterAndSearch();
        return;
      }

      const mobileChip = target.closest<HTMLElement>('[data-mobile-cat]');
      if (mobileChip) {
        activeCategory = mobileChip.dataset.mobileCat!;
        filterAndSearch();
        return;
      }

      const copyBtn = target.closest<HTMLElement>('[data-action="copy-svg"]');
      if (copyBtn) {
        e.preventDefault();
        const logoPath = copyBtn.dataset.logoPath!;
        const orig = copyBtn.innerHTML;
        const showSuccess = () => {
          showToast('SVG copiat în clipboard!');
          copyBtn.innerHTML = `<svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>`;
          setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
        };
        try {
          if (typeof ClipboardItem !== 'undefined') {
            await navigator.clipboard.write([
              new ClipboardItem({
                'text/plain': fetch(logoPath).then(r => r.ok ? r.text() : Promise.reject()).then(t => new Blob([t], { type: 'text/plain' })),
              }),
            ]);
            showSuccess();
          } else {
            const res = await fetch(logoPath);
            if (!res.ok) throw new Error();
            await navigator.clipboard.writeText(await res.text());
            showSuccess();
          }
        } catch {
          showToast('Eroare la copiere', 'error');
        }
        return;
      }

    });

    readUrlState();
    filterAndSearch();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}
