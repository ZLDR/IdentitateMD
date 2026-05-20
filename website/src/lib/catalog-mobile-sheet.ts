export function attachCatalogMobileSheet(loadInstitution: (slug: string) => void) {
  const mobileFab = document.getElementById('mobile-fab');
  const mobileShareBtn = document.getElementById('mobile-share-btn');
  const mobileShareLabel = document.getElementById('mobile-share-label');
  const mobileSheet = document.getElementById('mobile-sheet');
  const mobileBackdrop = document.getElementById('mobile-sheet-backdrop');
  const sheetClose = document.getElementById('mobile-sheet-close');
  const sheetSearch = document.getElementById('mobile-sheet-search');
  const sheetSearchClear = document.getElementById('mobile-sheet-search-clear');

  let mobileShareResetTimer: ReturnType<typeof setTimeout> | undefined;
  let mobileShareCollapseTimer: ReturnType<typeof setTimeout> | undefined;

  function openSheet() {
    mobileSheet?.classList.remove('translate-y-full');
    mobileSheet?.classList.add('translate-y-0');
    mobileBackdrop?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    setTimeout(() => sheetSearch?.focus(), 50);
  }

  function closeSheet() {
    mobileSheet?.classList.add('translate-y-full');
    mobileSheet?.classList.remove('translate-y-0');
    mobileBackdrop?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  mobileFab?.addEventListener('click', openSheet);
  mobileShareBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      clearTimeout(mobileShareResetTimer);
      clearTimeout(mobileShareCollapseTimer);
      mobileShareBtn.classList.add('border-green-400', 'text-green-600', 'bg-green-50');
      mobileShareBtn.classList.remove('text-surface-500', 'border-surface-200');
      mobileShareBtn.classList.remove('w-11', 'px-0', 'gap-0');
      mobileShareBtn.classList.add('w-auto', 'px-3', 'gap-1.5');
      requestAnimationFrame(() => {
        mobileShareLabel?.classList.remove('max-w-0', 'opacity-0', '-translate-x-1');
        mobileShareLabel?.classList.add('max-w-24', 'opacity-100', 'translate-x-0');
      });
      mobileShareResetTimer = setTimeout(() => {
        mobileShareLabel?.classList.remove('max-w-24', 'opacity-100', 'translate-x-0');
        mobileShareLabel?.classList.add('max-w-0', 'opacity-0', '-translate-x-1');
        mobileShareBtn.classList.remove('border-green-400', 'text-green-600', 'bg-green-50');
        mobileShareBtn.classList.add('text-surface-500', 'border-surface-200');
        mobileShareCollapseTimer = setTimeout(() => {
          mobileShareBtn.classList.remove('w-auto', 'px-3', 'gap-1.5');
          mobileShareBtn.classList.add('w-11', 'px-0', 'gap-0');
        }, 300);
      }, 2000);
    } catch { /* ignore */ }
  });
  sheetClose?.addEventListener('click', closeSheet);
  mobileBackdrop?.addEventListener('click', closeSheet);

  sheetSearch?.addEventListener('input', () => {
    const q = (sheetSearch.value || '').toLowerCase().trim();
    sheetSearchClear?.classList.toggle('hidden', !q);
    document.querySelectorAll('.mobile-sheet-group').forEach(group => {
      const btns = [...group.querySelectorAll('.mobile-sheet-inst-btn')];
      let visible = false;
      btns.forEach(btn => {
        const match = !q || (btn.dataset.name || '').toLowerCase().includes(q);
        btn.classList.toggle('hidden', !match);
        if (match) visible = true;
      });
      const hdr = group.querySelector('div');
      if (hdr) hdr.classList.toggle('hidden', !visible);
      group.classList.toggle('hidden', !visible);
    });
  });

  sheetSearchClear?.addEventListener('click', () => {
    if (sheetSearch) sheetSearch.value = '';
    sheetSearchClear?.classList.add('hidden');
    document.querySelectorAll('.mobile-sheet-group, .mobile-sheet-inst-btn').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.mobile-sheet-group > div').forEach(el => el.classList.remove('hidden'));
  });

  document.querySelectorAll('.mobile-sheet-inst-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loadInstitution(btn.dataset.sheetInstBtn || '');
      closeSheet();
    });
  });

  return { openSheet, closeSheet };
}
