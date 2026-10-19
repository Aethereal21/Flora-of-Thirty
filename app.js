(() => {
  function playSiteIntro() {
    const intro = document.getElementById('siteIntro');
    if (!intro) return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem('flora-of-thirty-intro-seen') === '1';
      if (!alreadySeen && !reduceMotion) sessionStorage.setItem('flora-of-thirty-intro-seen', '1');
    } catch { /* intro remains available if session storage is unavailable */ }

    if (alreadySeen || reduceMotion) {
      intro.remove();
      return;
    }

    intro.hidden = false;
    intro.addEventListener('animationend', (event) => {
      if (event.target === intro && event.animationName === 'intro-screen-exit') intro.remove();
    });
    window.setTimeout(() => intro.remove(), 3200);
  }

  playSiteIntro();

  const plants = Array.isArray(window.FLORA_PLANTS) ? window.FLORA_PLANTS : [];
  const areaNames = [...new Set(plants.flatMap((plant) => plant.locations || []))].sort((a, b) => a.localeCompare(b, 'id'));
  const favoriteStorageKey = 'flora-of-thirty-favorites';
  function loadFavoriteKeys() {
    try {
      const saved = JSON.parse(localStorage.getItem(favoriteStorageKey) || '[]');
      if (!Array.isArray(saved)) return new Set();
      const validKeys = new Set(plants.map((plant) => slugify(plant.name)));
      return new Set(saved.filter((key) => typeof key === 'string' && validKeys.has(key)));
    } catch {
      return new Set();
    }
  }
  const state = { query: '', area: '', letter: '', favoritesOnly: false, favorites: loadFavoriteKeys() };
  const nodes = {
    count: document.getElementById('plantCount'),
    areaCount: document.getElementById('areaCount'),
    search: document.getElementById('plantSearch'),
    areaFilter: document.getElementById('areaFilter'),
    alphabet: document.getElementById('alphabet'),
    grid: document.getElementById('plantGrid'),
    summary: document.getElementById('resultsSummary'),
    empty: document.getElementById('emptyState'),
    clear: document.getElementById('clearFilters'),
    favoritesFilter: document.getElementById('favoritesFilter'),
    favoriteCount: document.getElementById('favoriteCount'),
    hero: document.querySelector('.hero'),
    catalog: document.getElementById('katalog'),
    detailPage: document.getElementById('detailPage'),
    detailContent: document.getElementById('detailContent'),
    detailNotFound: document.getElementById('detailNotFound'),
    detailPhoto: document.getElementById('detailPhoto'),
    photoZoom: document.getElementById('photoZoom'),
    detailPhotoImage: document.getElementById('detailPhotoImage'),
    detailPhotoCaption: document.getElementById('detailPhotoCaption'),
    photoLightbox: document.getElementById('photoLightbox'),
    photoLightboxImage: document.getElementById('photoLightboxImage'),
    photoLightboxCaption: document.getElementById('photoLightboxCaption'),
    closePhotoLightbox: document.getElementById('closePhotoLightbox'),
    detailInitial: document.getElementById('detailInitial'),
    detailName: document.getElementById('detailName'),
    detailAreaSummary: document.getElementById('detailAreaSummary'),
    detailLead: document.getElementById('detailLead'),
    detailLocations: document.getElementById('detailLocations'),
    botanyIdStatus: document.getElementById('botanyIdStatus'),
    botanyScientific: document.getElementById('botanyScientific'),
    botanyCharacteristics: document.getElementById('botanyCharacteristics'),
    botanyBenefits: document.getElementById('botanyBenefits'),
    botanyCaution: document.getElementById('botanyCaution'),
    botanySource: document.getElementById('botanySource'),
    botanySourceLabel: document.getElementById('botanySourceLabel'),
    botanyProfileFields: document.getElementById('botanyProfileFields'),
    botanyFlower: document.getElementById('botanyFlower'),
    botanyHabitat: document.getElementById('botanyHabitat'),
    botanyCare: document.getElementById('botanyCare'),
    botanyFact: document.getElementById('botanyFact'),
    botanyCrossCheck: document.getElementById('botanyCrossCheck'),
    botanyReferences: document.getElementById('botanyReferences'),
    botanyReferenceList: document.getElementById('botanyReferenceList'),
    sharePlant: document.getElementById('sharePlant'),
    favoriteDetail: document.getElementById('favoriteDetail'),
    favoriteDetailIcon: document.getElementById('favoriteDetailIcon'),
    favoriteDetailLabel: document.getElementById('favoriteDetailLabel'),
    suggestionDialog: document.getElementById('suggestionDialog'),
    suggestionArea: document.getElementById('suggestionArea'),
    suggestionForm: document.getElementById('suggestionForm'),
    suggestionName: document.getElementById('suggestionName'),
    suggestionNotes: document.getElementById('suggestionNotes'),
    formStatus: document.getElementById('formStatus'),
    exportSuggestions: document.getElementById('exportSuggestions'),
    toast: document.getElementById('toast'),
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);

  function fillAreaOptions(select) {
    for (const area of areaNames) {
      const option = document.createElement('option');
      option.value = area;
      option.textContent = area;
      select.append(option);
    }
  }

  function setupAlphabet() {
    const letters = ['Semua', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
    nodes.alphabet.innerHTML = '';
    for (const label of letters) {
      const letter = label === 'Semua' ? '' : label;
      const hasResults = !letter || plants.some((plant) => plant.name.toLocaleUpperCase('id').startsWith(letter));
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label === 'Semua' ? 'Semua' : label;
      button.setAttribute('aria-pressed', String(state.letter === letter));
      button.disabled = !hasResults;
      button.addEventListener('click', () => {
        state.letter = letter;
        renderAlphabetState();
        renderPlants();
      });
      nodes.alphabet.append(button);
    }
  }

  function renderAlphabetState() {
    for (const button of nodes.alphabet.querySelectorAll('button')) {
      const letter = button.textContent === 'Semua' ? '' : button.textContent;
      button.setAttribute('aria-pressed', String(state.letter === letter));
    }
  }

  function currentPlants() {
    const query = state.query.trim().toLocaleLowerCase('id');
    return plants.filter((plant) => {
      const matchesQuery = !query || plant.name.toLocaleLowerCase('id').includes(query);
      const matchesArea = !state.area || plant.locations.includes(state.area);
      const matchesLetter = !state.letter || plant.name.toLocaleUpperCase('id').startsWith(state.letter);
      const matchesFavorite = !state.favoritesOnly || state.favorites.has(slugify(plant.name));
      return matchesQuery && matchesArea && matchesLetter && matchesFavorite;
    });
  }

  function refreshFavoriteControls() {
    nodes.favoriteCount.textContent = state.favorites.size.toLocaleString('id-ID');
    nodes.favoritesFilter.setAttribute('aria-pressed', String(state.favoritesOnly));
    nodes.favoritesFilter.disabled = state.favorites.size === 0 && !state.favoritesOnly;
  }

  function updateFavoriteDetail(plant) {
    if (!plant) return;
    const saved = state.favorites.has(slugify(plant.name));
    nodes.favoriteDetail.hidden = false;
    nodes.favoriteDetail.setAttribute('aria-pressed', String(saved));
    nodes.favoriteDetail.setAttribute('aria-label', saved ? `Hapus ${plant.name} dari favorit` : `Simpan ${plant.name} ke favorit`);
    nodes.favoriteDetailIcon.textContent = saved ? String.fromCodePoint(9829) : String.fromCodePoint(9825);
    nodes.favoriteDetailLabel.textContent = saved ? 'Tersimpan' : 'Simpan favorit';
  }

  function persistFavorites() {
    try {
      localStorage.setItem(favoriteStorageKey, JSON.stringify([...state.favorites]));
      return true;
    } catch {
      return false;
    }
  }

  function toggleFavorite(plant) {
    const key = slugify(plant.name);
    const removing = state.favorites.has(key);
    if (removing) state.favorites.delete(key);
    else state.favorites.add(key);
    const stored = persistFavorites();
    renderPlants();
    if (document.documentElement.dataset.page === 'detail') updateFavoriteDetail(plant);
    else {
      const nextButton = nodes.grid.querySelector(`[data-plant-key="${key}"] .favorite-toggle`);
      (nextButton || nodes.favoritesFilter).focus();
    }
    const action = removing ? 'dihapus dari' : 'ditambahkan ke';
    showToast(stored ? `“${plant.name}” ${action} favorit.` : 'Perubahan favorit hanya tersimpan selama halaman ini terbuka.');
  }

  function renderPlants() {
    const filtered = currentPlants();
    const hasFilter = Boolean(state.query || state.area || state.letter || state.favoritesOnly);
    nodes.count.textContent = plants.length.toLocaleString('id-ID');
    nodes.areaCount.textContent = areaNames.length.toLocaleString('id-ID');
    refreshFavoriteControls();
    nodes.summary.innerHTML = hasFilter
      ? `<strong>${filtered.length.toLocaleString('id-ID')}</strong> nama ditemukan${state.favoritesOnly ? ' di favorit' : ''}`
      : `Menampilkan <strong>${filtered.length.toLocaleString('id-ID')}</strong> nama tanaman`;
    nodes.grid.innerHTML = '';
    nodes.empty.hidden = filtered.length !== 0;
    nodes.grid.hidden = filtered.length === 0;
    nodes.clear.hidden = !hasFilter;

    const fragment = document.createDocumentFragment();
    filtered.forEach((plant) => {
      const card = document.createElement('div');
      card.className = 'plant-card-wrap';
      card.dataset.plantKey = slugify(plant.name);
      const link = document.createElement('a');
      link.className = 'plant-card';
      link.href = `./index.html?tanaman=${encodeURIComponent(slugify(plant.name))}`;
      link.setAttribute('aria-label', `${plant.name}. Buka halaman detail tanaman.`);
      const profile = window.FLORA_DETAILS?.forPlant(plant.name);
      if (profile?.photoFileName) {
        const photoPath = `assets/flora/${profile.photoFileName.split('/').map(encodeURIComponent).join('/')}`;
        link.classList.add('has-image');
        link.style.setProperty('--card-image', `url("${photoPath.replaceAll('"', '%22')}")`);
      }
      link.innerHTML = `
        <span class="card-top"><span class="card-index">${escapeHtml(plant.name.trim().charAt(0).toLocaleUpperCase('id'))}</span></span>
        <div class="card-title-glass"><h3>${escapeHtml(plant.name)}</h3><span class="card-open" aria-hidden="true">&#8599;</span></div>`;
      const favorite = state.favorites.has(slugify(plant.name));
      const favoriteButton = document.createElement('button');
      favoriteButton.className = 'favorite-toggle';
      favoriteButton.type = 'button';
      favoriteButton.textContent = favorite ? String.fromCodePoint(9829) : String.fromCodePoint(9825);
      favoriteButton.setAttribute('aria-pressed', String(favorite));
      favoriteButton.setAttribute('aria-label', favorite ? `Hapus ${plant.name} dari favorit` : `Simpan ${plant.name} ke favorit`);
      favoriteButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(plant);
      });
      card.append(link, favoriteButton);
      fragment.append(card);
    });
    nodes.grid.append(fragment);
  }
  function slugify(name) {
    return String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('id')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function renderRoute() {
    const requestedSlug = new URLSearchParams(window.location.search).get('tanaman');
    const plant = requestedSlug ? plants.find((item) => slugify(item.name) === requestedSlug
      || (item.aliases || []).some((alias) => slugify(alias) === requestedSlug)) : null;
    const isDetailRoute = Boolean(requestedSlug);
    document.documentElement.dataset.page = isDetailRoute ? 'detail' : 'home';
    nodes.hero.hidden = isDetailRoute;
    nodes.catalog.hidden = isDetailRoute;
    nodes.detailPage.hidden = !isDetailRoute;
    nodes.detailNotFound.hidden = Boolean(plant);
    nodes.detailContent.hidden = !plant;
    nodes.favoriteDetail.hidden = !plant;
    nodes.sharePlant.hidden = !plant;

    if (!isDetailRoute) {
      document.title = 'Flora of Thirty — KIR SMAN 30 Jakarta';
      return;
    }
    if (!plant) {
      document.title = 'Tanaman tidak ditemukan — Flora of Thirty';
      return;
    }

    document.title = `${plant.name} — Flora of Thirty`;
    updateFavoriteDetail(plant);
    nodes.detailName.textContent = plant.name;
    nodes.detailInitial.textContent = plant.name.trim().charAt(0).toLocaleUpperCase('id');
    const areaCount = plant.locations.length;
    nodes.detailAreaSummary.textContent = `${areaCount} area sekolah tercatat`;
    nodes.detailLead.textContent = `${plant.name} tercatat di ${areaCount} area sekolah berikut.`;
    nodes.detailLocations.replaceChildren();
    for (const location of plant.locations) {
      const item = document.createElement('div');
      item.className = 'detail-location';
      item.textContent = location;
      nodes.detailLocations.append(item);
    }

    const profile = window.FLORA_DETAILS?.forPlant(plant.name) || null;
    nodes.detailPhoto.hidden = !profile?.photoFileName;
    nodes.detailPhotoCaption.replaceChildren();
    if (profile?.photoFileName) {
      const photoSrc = `assets/flora/${profile.photoFileName.split('/').map(encodeURIComponent).join('/')}`;
      nodes.detailPhotoImage.src = photoSrc;
      nodes.detailPhotoImage.alt = `Gambar referensi ${profile.photoCommonName || plant.name} (${profile.photoScientificName || profile.scientificName})`;
      nodes.photoZoom.setAttribute('aria-label', `Perbesar foto ${profile.photoCommonName || plant.name}`);
      nodes.photoLightboxImage.src = photoSrc;
      nodes.photoLightboxImage.alt = nodes.detailPhotoImage.alt;
      nodes.photoLightboxCaption.textContent = `${profile.photoCommonName || plant.name}. Foto: ${profile.photoCredit}. Lisensi: ${profile.photoLicense}.`;
      const context = document.createElement('span');
      context.className = 'photo-context';
      context.textContent = 'Gambar referensi; bukan dokumentasi spesimen di SMAN 30.';
      const attribution = document.createElement('span');
      attribution.className = 'photo-attribution';
      attribution.textContent = `Foto: ${profile.photoCredit}. Lisensi: ${profile.photoLicense}.`;
      const source = document.createElement('a');
      source.href = profile.photoSource;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      source.textContent = 'Halaman sumber foto ↗';
      nodes.detailPhotoCaption.append(context, attribution, source);
    } else {
      nodes.photoLightboxImage.removeAttribute('src');
      nodes.photoLightboxImage.alt = '';
      nodes.photoLightboxCaption.textContent = '';
    }
    const botany = window.FLORA_BOTANY?.forPlant(plant.name) || {
      scientific: 'Belum terverifikasi',
      characteristics: `Nama “${plant.name}” belum cukup spesifik untuk menentukan jenis botani. Nama lokal yang sama bisa dipakai untuk beberapa tanaman berbeda.`,
      benefits: 'Manfaat spesifik belum dicantumkan agar tidak keliru. Foto seluruh tanaman, daun, bunga, dan buah akan membantu tim KIR mengidentifikasinya.',
      source: 'https://powo.science.kew.org/',
      sourceName: 'Kew POWO — basis data nama botani',
      confidence: 'unknown',
    };
    const profileScientific = profile?.scientificName || '';
    const unresolvedProfile = /belum dapat dipastikan|belum terverifikasi|perlu foto|dugaan|indet|\bsp(?:p)?\./i.test(profileScientific);
    nodes.botanyIdStatus.textContent = profile
      ? window.FLORA_DETAILS.status(profile)
      : (window.FLORA_BOTANY?.status(botany) || 'Data botani perlu diverifikasi dengan foto tanaman.');
    nodes.botanyScientific.textContent = profileScientific || botany.scientific;
    nodes.botanyCharacteristics.textContent = profile?.specification || botany.characteristics;
    nodes.botanyBenefits.textContent = (unresolvedProfile || profile?.crossCheckNote)
      ? 'Manfaat spesifik belum dapat dipastikan sebelum identitas tanaman dikonfirmasi melalui foto.'
      : botany.benefits;
    nodes.botanyCaution.hidden = !botany.caution;
    nodes.botanyCaution.textContent = botany.caution || '';
    nodes.botanySource.hidden = unresolvedProfile || Boolean(profile?.crossCheckNote);
    nodes.botanySource.href = botany.source;
    nodes.botanySourceLabel.textContent = `Sumber: ${botany.sourceName}`;

    nodes.botanyProfileFields.hidden = !profile;
    nodes.botanyFlower.textContent = profile?.flower || '';
    nodes.botanyHabitat.textContent = profile?.habitat || '';
    nodes.botanyCare.textContent = profile?.care || '';
    nodes.botanyFact.textContent = profile?.fact || '';
    nodes.botanyCrossCheck.hidden = !profile?.crossCheckNote;
    nodes.botanyCrossCheck.textContent = profile?.crossCheckNote || '';
    nodes.botanyReferenceList.replaceChildren();
    const references = profile?.references || [];
    nodes.botanyReferences.hidden = references.length === 0;
    for (const reference of references) {
      if (!reference.url) continue;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = reference.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = reference.label || reference.url;
      item.append(link);
      nodes.botanyReferenceList.append(item);
    }
  }

  function setupHeroSlideshow() {
    const host = document.getElementById('heroSlideshow');
    if (!host || document.documentElement.dataset.page !== 'home') return;
    const slots = [document.getElementById('heroSlideA'), document.getElementById('heroSlideB')];
    const preferredNames = ['Bunga telang', 'Kemuning', 'Jawer kotok', 'Ceri Suriname', 'Puring emas', 'Sirih gading', 'Bunga kertas / bougenville'];
    const slides = preferredNames.map((name) => {
      const plant = plants.find((item) => item.name === name);
      const profile = plant && window.FLORA_DETAILS?.forPlant(plant.name);
      if (!plant || !profile?.photoFileName) return null;
      return {
        plant,
        src: `assets/flora/${profile.photoFileName.split('/').map(encodeURIComponent).join('/')}`,
      };
    }).filter(Boolean);
    if (slots.some((slot) => !slot) || slides.length < 2) return;

    function fillSlot(slot, slide, active) {
      const image = slot.querySelector('img');
      const title = slot.querySelector('.hero-slide-caption strong');
      image.src = slide.src;
      image.alt = '';
      title.textContent = slide.plant.name;
      slot.href = `./index.html?tanaman=${encodeURIComponent(slugify(slide.plant.name))}`;
      slot.setAttribute('aria-label', `Lihat detail tanaman ${slide.plant.name}`);
      slot.setAttribute('aria-hidden', String(!active));
      slot.tabIndex = active ? 0 : -1;
      slot.classList.toggle('is-active', active);
    }

    let activeSlot = 0;
    let activeSlide = 0;
    fillSlot(slots[0], slides[activeSlide], true);
    fillSlot(slots[1], slides[(activeSlide + 1) % slides.length], false);
    for (const slide of slides.slice(2)) {
      const preload = new Image();
      preload.src = slide.src;
    }

    function advance() {
      const nextSlot = 1 - activeSlot;
      const nextSlide = (activeSlide + 1) % slides.length;
      fillSlot(slots[nextSlot], slides[nextSlide], true);
      fillSlot(slots[activeSlot], slides[activeSlide], false);
      activeSlot = nextSlot;
      activeSlide = nextSlide;
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reduceMotion?.matches) return;
    let timer = 0;
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    const start = () => {
      if (!timer && !document.hidden && !host.contains(document.activeElement)) {
        timer = window.setInterval(advance, 5000);
      }
    };
    host.addEventListener('focusin', stop);
    host.addEventListener('focusout', (event) => {
      if (!host.contains(event.relatedTarget)) start();
    });
    host.addEventListener('mouseenter', stop);
    host.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    reduceMotion?.addEventListener?.('change', (event) => event.matches ? stop() : start());
    start();
  }

  function navigateToPlant(plant) {
    window.location.href = `./index.html?tanaman=${encodeURIComponent(slugify(plant.name))}`;
  }

  async function copyPlantLink() {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      showToast('Tautan tanaman disalin.');
      return;
    } catch {
      const field = document.createElement('textarea');
      field.value = link;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.append(field);
      field.select();
      const copied = document.execCommand('copy');
      field.remove();
      showToast(copied ? 'Tautan tanaman disalin.' : 'Salin URL dari bilah alamat browser.');
    }
  }

  function chooseRandomPlant() {
    const choices = currentPlants();
    if (!choices.length) {
      showToast('Belum ada tanaman yang cocok untuk diacak.');
      return;
    }
    navigateToPlant(choices[Math.floor(Math.random() * choices.length)]);
  }

  let toastTimer;
  function showToast(message) {
    nodes.toast.textContent = message;
    nodes.toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => nodes.toast.classList.remove('is-visible'), 3000);
  }

  function clearFilters() {
    state.query = '';
    state.area = '';
    state.letter = '';
    state.favoritesOnly = false;
    nodes.search.value = '';
    nodes.areaFilter.value = '';
    renderAlphabetState();
    renderPlants();
  }

  function savedSuggestions() {
    try {
      const value = JSON.parse(localStorage.getItem('flora-of-thirty-suggestions') || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function refreshExportButton() {
    const count = savedSuggestions().length;
    nodes.exportSuggestions.hidden = count === 0;
    nodes.exportSuggestions.textContent = count ? `Unduh ${count} usulan tersimpan` : 'Unduh usulan tersimpan';
  }

  function exportSuggestions() {
    const items = savedSuggestions();
    if (!items.length) return;
    const file = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), suggestions: items }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(file);
    link.href = url;
    link.download = 'usulan-flora-of-thirty.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  fillAreaOptions(nodes.areaFilter);
  fillAreaOptions(nodes.suggestionArea);
  refreshExportButton();
  setupAlphabet();
  renderPlants();
  renderRoute();
  setupHeroSlideshow();

  nodes.search.addEventListener('input', () => {
    state.query = nodes.search.value;
    renderPlants();
  });
  nodes.areaFilter.addEventListener('change', () => {
    state.area = nodes.areaFilter.value;
    renderPlants();
  });
  nodes.favoritesFilter.addEventListener('click', () => {
    state.favoritesOnly = !state.favoritesOnly;
    renderPlants();
  });
  nodes.clear.addEventListener('click', clearFilters);
  document.getElementById('emptyClear').addEventListener('click', clearFilters);
  document.getElementById('randomCatalog').addEventListener('click', chooseRandomPlant);

  nodes.sharePlant.addEventListener('click', copyPlantLink);
  nodes.favoriteDetail.addEventListener('click', () => {
    const currentSlug = new URLSearchParams(window.location.search).get('tanaman');
    const plant = plants.find((item) => slugify(item.name) === currentSlug
      || (item.aliases || []).some((alias) => slugify(alias) === currentSlug));
    if (plant) toggleFavorite(plant);
  });
  nodes.photoZoom.addEventListener('click', () => {
    if (typeof nodes.photoLightbox.showModal === 'function') nodes.photoLightbox.showModal();
    else nodes.photoLightbox.setAttribute('open', '');
    nodes.closePhotoLightbox.focus();
  });
  nodes.closePhotoLightbox.addEventListener('click', () => {
    if (typeof nodes.photoLightbox.close === 'function') nodes.photoLightbox.close();
    else nodes.photoLightbox.removeAttribute('open');
  });
  nodes.photoLightbox.addEventListener('click', (event) => {
    if (event.target !== nodes.photoLightbox) return;
    if (typeof nodes.photoLightbox.close === 'function') nodes.photoLightbox.close();
    else nodes.photoLightbox.removeAttribute('open');
  });
  document.getElementById('openSuggestion').addEventListener('click', () => {
    nodes.formStatus.textContent = '';
    nodes.suggestionForm.reset();
    refreshExportButton();
    if (typeof nodes.suggestionDialog.showModal === 'function') nodes.suggestionDialog.showModal();
    else nodes.suggestionDialog.setAttribute('open', '');
    nodes.suggestionName.focus();
  });
  document.getElementById('closeSuggestion').addEventListener('click', () => nodes.suggestionDialog.close());

  nodes.suggestionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const submission = {
      name: nodes.suggestionName.value.trim(),
      area: nodes.suggestionArea.value,
      notes: nodes.suggestionNotes.value.trim(),
      submittedAt: new Date().toISOString(),
    };
    if (!submission.name) return;
    try {
      const key = 'flora-of-thirty-suggestions';
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      saved.push(submission);
      localStorage.setItem(key, JSON.stringify(saved));
      nodes.formStatus.textContent = 'Usulan tersimpan di browser ini. Usulan belum terkirim ke KIR.';
      refreshExportButton();
      nodes.suggestionForm.reset();
      showToast('Usulan tersimpan di perangkat ini.');
    } catch {
      nodes.formStatus.textContent = 'Browser tidak dapat menyimpan usulan saat ini. Coba lagi nanti.';
    }
  });
  nodes.exportSuggestions.addEventListener('click', exportSuggestions);

  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.querySelector('.main-nav');
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Tutup navigasi' : 'Buka navigasi');
  });
  mainNav.addEventListener('click', (event) => {
    if (event.target.closest('a, button')) {
      mainNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Buka navigasi');
    }
  });

  const themeToggle = document.getElementById('themeToggle');
  const mobileThemeToggle = document.getElementById('themeToggleMobile');
  const themeToggles = [themeToggle, mobileThemeToggle];
  const siteHeader = document.querySelector('.site-header');
  const updateHeaderState = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 28);
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  function setTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    themeToggles.forEach((toggle) => {
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.setAttribute('aria-label', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
    });
    mobileThemeToggle.querySelector('.theme-menu-action').textContent = isDark ? 'Mode terang' : 'Mode gelap';
    mobileThemeToggle.querySelector('.nav-menu-icon').textContent = isDark ? '☀' : '☾';
    themeToggle.innerHTML = `<span aria-hidden="true">${isDark ? '☀' : '☾'}</span>`;
  }
  let savedTheme = 'light';
  try {
    savedTheme = localStorage.getItem('flora-of-thirty-theme') === 'dark' ? 'dark' : 'light';
  } catch { /* local file settings may be unavailable in some browsers */ }
  setTheme(savedTheme);
  themeToggles.forEach((toggle) => toggle.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(theme);
    try { localStorage.setItem('flora-of-thirty-theme', theme); } catch { /* theme still works for this page view */ }
  }));
})();
