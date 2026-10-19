// ==========================================================================
// BRAND SIGN — CREATIVE MARKETING AGENCY
// Interactive Portfolio, Replaceable Placeholder Studio & Conversion Logic
// ==========================================================================

(function () {
  'use strict';

  const STORAGE_KEY = 'brandsign_custom_portfolio_v1';
  const HERO_STORAGE_KEY = 'brandsign_custom_hero_services_v1';

  // State
  let projects = [];
  let activeCategory = 'all';
  let showAllArchive = false; // false = Curated 12, true = All 35 Drive Projects
  let displayMode = 'editorial'; // 'editorial' | 'color' | 'placeholder'
  let activeModalSlotId = null;
  let pendingQuickReplaceTarget = null;

  // DOM Elements
  const portfolioGrid = document.getElementById('portfolio-grid');
  const heroShowcase = document.getElementById('hero-showcase');
  const servicesGrid = document.getElementById('services-grid');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const scopeCuratedBtn = document.getElementById('scope-curated-btn');
  const scopeAllBtn = document.getElementById('scope-all-btn');
  const toggleAllBottomBtn = document.getElementById('toggle-all-projects-bottom-btn');
  const portfolioShowingText = document.getElementById('portfolio-showing-text');
  const displayModeBtns = document.querySelectorAll('[data-display-mode]');
  const addPlaceholderSlotBtn = document.getElementById('add-placeholder-slot-btn');
  const resetPortfolioBtn = document.getElementById('reset-portfolio-btn');
  const quickReplaceInput = document.getElementById('quick-replace-file-input');

  // Modal Elements
  const slotModal = document.getElementById('slot-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalSlotCode = document.getElementById('modal-slot-code');
  const modalCategoryBadge = document.getElementById('modal-category-badge');
  const modalProjectImg = document.getElementById('modal-project-img');
  const modalBrandName = document.getElementById('modal-brand-name');
  const modalProjectTitle = document.getElementById('modal-project-title');
  const modalProjectDesc = document.getElementById('modal-project-desc');
  const modalDeliverables = document.getElementById('modal-deliverables');
  const modalMetric = document.getElementById('modal-metric');
  const modalFileInput = document.getElementById('modal-file-input');
  const editSlotTitle = document.getElementById('edit-slot-title');
  const editSlotBrand = document.getElementById('edit-slot-brand');
  const editSlotCategory = document.getElementById('edit-slot-category');
  const modalSaveMetaBtn = document.getElementById('modal-save-meta-btn');
  const modalToggleEmptyBtn = document.getElementById('modal-toggle-empty-btn');

  // Toast
  const toastEl = document.getElementById('studio-toast');
  const toastMsg = document.getElementById('studio-toast-msg');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = message;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3400);
  }

  // Load Initial Data + LocalStorage Overrides
  function loadProjectsData() {
    const baseData = (window.BRAND_SIGN_PROJECTS || []).map((item) => ({ ...item }));
    try {
      const savedRaw = localStorage.getItem(STORAGE_KEY);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (Array.isArray(saved) && saved.length > 0) {
          projects = saved;
          if (resetPortfolioBtn) resetPortfolioBtn.style.display = 'inline-flex';
        } else {
          projects = baseData;
        }
      } else {
        projects = baseData;
      }

      // Check hero/service slot overrides
      const heroSavedRaw = localStorage.getItem(HERO_STORAGE_KEY);
      if (heroSavedRaw) {
        const heroSaved = JSON.parse(heroSavedRaw);
        Object.keys(heroSaved).forEach((targetKey) => {
          applySpecialSlotImage(targetKey, heroSaved[targetKey]);
        });
        if (resetPortfolioBtn) resetPortfolioBtn.style.display = 'inline-flex';
      }
    } catch (err) {
      projects = baseData;
    }
  }

  function saveProjectsData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      if (resetPortfolioBtn) resetPortfolioBtn.style.display = 'inline-flex';
    } catch (err) {
      showToast('Note: Image applied for this session (storage quota reached).');
    }
  }

  function saveSpecialSlotOverride(targetKey, dataUrl) {
    try {
      const existing = JSON.parse(localStorage.getItem(HERO_STORAGE_KEY) || '{}');
      existing[targetKey] = dataUrl;
      localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(existing));
      if (resetPortfolioBtn) resetPortfolioBtn.style.display = 'inline-flex';
    } catch (err) {
      // session fallback
    }
  }

  function applySpecialSlotImage(targetKey, dataUrl) {
    const map = {
      'hero-1': 'hero-img-1',
      'hero-2': 'hero-img-2',
      'hero-3': 'hero-img-3',
      'service-1': 'service-img-1',
      'service-2': 'service-img-2',
      'service-3': 'service-img-3'
    };
    const imgId = map[targetKey];
    if (imgId) {
      const imgEl = document.getElementById(imgId);
      if (imgEl) imgEl.src = dataUrl;
    }
  }

  function getCategoryLabel(cat) {
    if (cat === 'photography') return 'Product Photography';
    if (cat === 'poster') return 'Poster Design';
    if (cat === 'ugc') return 'UGC Ads';
    return 'Creative Asset';
  }

  // Update Filter Tab Counts
  function updateCategoryCounts() {
    const scopedPool = showAllArchive
      ? projects
      : projects.filter((p) => p.featured);

    const countAll = scopedPool.length;
    const countPhoto = scopedPool.filter((p) => p.category === 'photography').length;
    const countPoster = scopedPool.filter((p) => p.category === 'poster').length;
    const countUgc = scopedPool.filter((p) => p.category === 'ugc').length;

    const elAll = document.getElementById('count-all');
    const elPhoto = document.getElementById('count-photography');
    const elPoster = document.getElementById('count-poster');
    const elUgc = document.getElementById('count-ugc');

    if (elAll) elAll.textContent = countAll;
    if (elPhoto) elPhoto.textContent = countPhoto;
    if (elPoster) elPoster.textContent = countPoster;
    if (elUgc) elUgc.textContent = countUgc;

    if (scopeCuratedBtn) {
      const featuredTotal = projects.filter((p) => p.featured).length;
      scopeCuratedBtn.textContent = `Curated (${featuredTotal})`;
    }
    if (scopeAllBtn) {
      scopeAllBtn.textContent = `All Drive Projects (${projects.length})`;
    }
  }

  // Render Portfolio Grid
  function renderPortfolio() {
    if (!portfolioGrid) return;
    updateCategoryCounts();

    const scopedPool = showAllArchive
      ? projects
      : projects.filter((p) => p.featured);

    const filtered = activeCategory === 'all'
      ? scopedPool
      : scopedPool.filter((p) => p.category === activeCategory);

    if (portfolioShowingText) {
      const catText = activeCategory === 'all' ? 'All Categories' : getCategoryLabel(activeCategory);
      const scopeText = showAllArchive ? 'Full Drive Archive' : 'Curated Flagship Selection';
      portfolioShowingText.textContent = `Showing ${filtered.length} Project Slots (${scopeText} · ${catText})`;
    }

    if (toggleAllBottomBtn) {
      toggleAllBottomBtn.textContent = showAllArchive
        ? 'Show Curated Flagship (12)'
        : `Show All ${projects.length} Drive Projects`;
    }

    portfolioGrid.innerHTML = filtered
      .map((item) => {
        const emptyClass = item.isEmptyPlaceholder ? 'is-empty-placeholder' : '';
        return `
        <article class="project-card ${emptyClass}" data-slot-id="${item.id}">
          <div class="project-slot-header">
            <span class="project-slot-code">${escapeHtml(item.slotCode)} · ${escapeHtml(item.ratio || '4:5')}</span>
            <div class="project-slot-actions">
              <button
                type="button"
                class="slot-replace-trigger"
                data-card-replace="${item.id}"
                title="Upload your own project image into ${escapeHtml(item.slotCode)}"
              >
                ⟳ Replace Image
              </button>
            </div>
          </div>

          <div class="project-media-frame" data-open-modal="${item.id}">
            <img
              src="${escapeHtml(item.image)}"
              alt="${escapeHtml(item.title)} — ${escapeHtml(item.categoryLabel)} by Brand Sign"
              loading="lazy"
            />

            <!-- Replaceable Placeholder Wireframe Overlay -->
            <div class="placeholder-wireframe">
              <div class="wireframe-box">
                <div class="wireframe-icon">+</div>
                <div class="wireframe-title">${escapeHtml(item.slotCode)} · REPLACEABLE</div>
                <div class="wireframe-sub">
                  ${escapeHtml(item.categoryLabel)} (${escapeHtml(item.ratio || '4:5')})<br/>
                  Click to upload client work or inspect slot
                </div>
              </div>
            </div>

            <div class="project-hover-bar">
              <span class="hover-bar-label">Click to Inspect / Edit Slot</span>
              <span class="hover-bar-btn">Open Studio ↗</span>
            </div>
          </div>

          <div class="project-info">
            <div class="project-meta-row">
              <span class="project-category">${escapeHtml(item.categoryLabel)}</span>
              <span class="project-metric">${escapeHtml(item.metric || 'CONVERSION AD')}</span>
            </div>
            <h3 class="project-title">${escapeHtml(item.title)}</h3>
            <div class="project-brand">${escapeHtml(item.brand)} · ${escapeHtml(item.deliverables || 'Studio Production')}</div>
          </div>
        </article>
      `;
      })
      .join('');

    bindCardEvents();
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Bind Events on Rendered Portfolio Cards (Click, Replace, Drag & Drop)
  function bindCardEvents() {
    // Direct "Replace Image" button on card
    document.querySelectorAll('[data-card-replace]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slotId = btn.getAttribute('data-card-replace');
        pendingQuickReplaceTarget = { type: 'portfolio', id: slotId };
        if (quickReplaceInput) quickReplaceInput.click();
      });
    });

    // Click media frame to open Studio Inspector Modal
    document.querySelectorAll('[data-open-modal]').forEach((frame) => {
      frame.addEventListener('click', () => {
        const slotId = frame.getAttribute('data-open-modal');
        openSlotModal(slotId);
      });
    });

    // Drag and drop image file onto any project card
    document.querySelectorAll('.project-card').forEach((card) => {
      const slotId = card.getAttribute('data-slot-id');
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over');
      });
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const files = e.dataTransfer && e.dataTransfer.files;
        if (files && files[0] && files[0].type.startsWith('image/')) {
          readImageFile(files[0], (dataUrl) => {
            updatePortfolioSlotImage(slotId, dataUrl);
          });
        }
      });
    });
  }

  function readImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = function (ev) {
      if (ev.target && ev.target.result) {
        callback(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function updatePortfolioSlotImage(slotId, dataUrl) {
    const idx = projects.findIndex((p) => p.id === slotId);
    if (idx === -1) return;
    projects[idx].image = dataUrl;
    projects[idx].isEmptyPlaceholder = false;
    saveProjectsData();
    renderPortfolio();

    if (activeModalSlotId === slotId && modalProjectImg) {
      modalProjectImg.src = dataUrl;
    }
    showToast(`${projects[idx].slotCode} updated with your uploaded project image.`);
  }

  // Open Modal for a Project Slot
  function openSlotModal(slotId) {
    const item = projects.find((p) => p.id === slotId);
    if (!item || !slotModal) return;
    activeModalSlotId = slotId;

    modalSlotCode.textContent = `${item.slotCode} · ${item.ratio || '4:5'} · REPLACEABLE`;
    modalCategoryBadge.textContent = item.categoryLabel;
    modalProjectImg.src = item.image;
    modalProjectImg.alt = item.title;
    modalBrandName.textContent = item.brand;
    modalProjectTitle.textContent = item.title;
    modalProjectDesc.textContent = item.description;
    modalDeliverables.textContent = item.deliverables;
    modalMetric.textContent = item.metric || 'CONVERSION ASSET';

    editSlotTitle.value = item.title;
    editSlotBrand.value = item.brand;
    editSlotCategory.value = item.category;

    modalToggleEmptyBtn.textContent = item.isEmptyPlaceholder
      ? 'Restore Slot Image'
      : 'Show as Empty Placeholder';

    slotModal.classList.add('open');
  }

  function closeSlotModal() {
    if (!slotModal) return;
    slotModal.classList.remove('open');
    activeModalSlotId = null;
  }

  // Initialize Event Listeners
  function initEvents() {
    // Sticky Header Scroll Shadow
    const siteHeader = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
      if (!siteHeader) return;
      if (window.scrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    });

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const primaryNav = document.getElementById('primary-nav');
    if (mobileMenuBtn && primaryNav) {
      mobileMenuBtn.addEventListener('click', () => {
        const isOpen = primaryNav.classList.toggle('mobile-open');
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      });
      primaryNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          primaryNav.classList.remove('mobile-open');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Category Filter Tabs
    filterTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        filterTabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        activeCategory = tab.getAttribute('data-category') || 'all';
        renderPortfolio();
      });
    });

    // Archive Scope Toggle (Curated 12 vs All 35 Drive Projects)
    if (scopeCuratedBtn && scopeAllBtn) {
      scopeCuratedBtn.addEventListener('click', () => {
        showAllArchive = false;
        scopeCuratedBtn.classList.add('active');
        scopeAllBtn.classList.remove('active');
        renderPortfolio();
      });
      scopeAllBtn.addEventListener('click', () => {
        showAllArchive = true;
        scopeAllBtn.classList.add('active');
        scopeCuratedBtn.classList.remove('active');
        renderPortfolio();
      });
    }

    if (toggleAllBottomBtn) {
      toggleAllBottomBtn.addEventListener('click', () => {
        showAllArchive = !showAllArchive;
        if (scopeCuratedBtn && scopeAllBtn) {
          scopeCuratedBtn.classList.toggle('active', !showAllArchive);
          scopeAllBtn.classList.toggle('active', showAllArchive);
        }
        renderPortfolio();
        document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Display Mode Toggle (B&W Luxe Hover | Studio Color | Placeholder Slots)
    displayModeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        displayModeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        displayMode = btn.getAttribute('data-display-mode') || 'editorial';

        portfolioGrid.classList.remove('grade-editorial', 'mode-placeholder');
        heroShowcase?.classList.remove('grade-editorial');
        servicesGrid?.classList.remove('grade-editorial');

        if (displayMode === 'editorial') {
          portfolioGrid.classList.add('grade-editorial');
          heroShowcase?.classList.add('grade-editorial');
          servicesGrid?.classList.add('grade-editorial');
          showToast('B&W Luxe Gallery Grade active — hover any card for full color.');
        } else if (displayMode === 'color') {
          showToast('Full Studio Color mode active across all project slots.');
        } else if (displayMode === 'placeholder') {
          portfolioGrid.classList.add('mode-placeholder');
          showToast('Placeholder Wireframe mode active — click any slot to upload client work.');
        }
      });
    });

    // Hero & Service Slot Replace Triggers
    document.querySelectorAll('[data-replace-target]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = btn.getAttribute('data-replace-target');
        pendingQuickReplaceTarget = { type: 'special', id: target };
        if (quickReplaceInput) quickReplaceInput.click();
      });
    });

    // Hero & Service Media Click -> Open Corresponding Slot Modal
    document.querySelectorAll('[data-inspect-slot]').forEach((mediaEl) => {
      mediaEl.addEventListener('click', () => {
        const slotId = mediaEl.getAttribute('data-inspect-slot');
        openSlotModal(slotId);
      });
    });

    // Quick File Input Change
    if (quickReplaceInput) {
      quickReplaceInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file || !pendingQuickReplaceTarget) return;
        readImageFile(file, (dataUrl) => {
          if (pendingQuickReplaceTarget.type === 'portfolio') {
            updatePortfolioSlotImage(pendingQuickReplaceTarget.id, dataUrl);
          } else if (pendingQuickReplaceTarget.type === 'special') {
            applySpecialSlotImage(pendingQuickReplaceTarget.id, dataUrl);
            saveSpecialSlotOverride(pendingQuickReplaceTarget.id, dataUrl);
            showToast(`Slot ${pendingQuickReplaceTarget.id.toUpperCase()} image replaced.`);
          }
          pendingQuickReplaceTarget = null;
          quickReplaceInput.value = '';
        });
      });
    }

    // Add New Replaceable Placeholder Slot
    if (addPlaceholderSlotBtn) {
      addPlaceholderSlotBtn.addEventListener('click', () => {
        const nextNum = projects.length + 1;
        const padded = String(nextNum).padStart(2, '0');
        const newSlot = {
          id: `slot-custom-${Date.now()}`,
          slotCode: `SLOT ${padded}`,
          title: `Client Project Placeholder #${padded}`,
          brand: 'Your Brand Name',
          category: activeCategory === 'all' ? 'photography' : activeCategory,
          categoryLabel: getCategoryLabel(activeCategory === 'all' ? 'photography' : activeCategory),
          ratio: '4:5',
          metric: 'REPLACEABLE SLOT',
          deliverables: 'Click Replace Image to upload custom work',
          description: 'Custom replaceable project placeholder slot added for new client campaign uploads.',
          image: 'assets/projects/2b53c318ecc95a1bc3196a16bdd4ed5a.jpg',
          featured: true,
          isEmptyPlaceholder: true
        };
        projects.unshift(newSlot);
        saveProjectsData();
        renderPortfolio();
        showToast(`${newSlot.slotCode} placeholder added — click "Replace Image" to upload.`);
      });
    }

    // Reset Portfolio to Original Google Drive Projects
    if (resetPortfolioBtn) {
      resetPortfolioBtn.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(HERO_STORAGE_KEY);
        projects = (window.BRAND_SIGN_PROJECTS || []).map((item) => ({ ...item }));
        resetPortfolioBtn.style.display = 'none';
        renderPortfolio();
        showToast('Restored all 35 original Google Drive Brand Sign projects.');
      });
    }

    // Modal Events
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeSlotModal);
    if (slotModal) {
      slotModal.addEventListener('click', (e) => {
        if (e.target === slotModal) closeSlotModal();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && slotModal?.classList.contains('open')) {
        closeSlotModal();
      }
    });

    if (modalFileInput) {
      modalFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file || !activeModalSlotId) return;
        readImageFile(file, (dataUrl) => {
          updatePortfolioSlotImage(activeModalSlotId, dataUrl);
          modalFileInput.value = '';
        });
      });
    }

    if (modalSaveMetaBtn) {
      modalSaveMetaBtn.addEventListener('click', () => {
        if (!activeModalSlotId) return;
        const idx = projects.findIndex((p) => p.id === activeModalSlotId);
        if (idx === -1) return;
        const newCat = editSlotCategory.value;
        projects[idx].title = editSlotTitle.value.trim() || projects[idx].title;
        projects[idx].brand = editSlotBrand.value.trim() || projects[idx].brand;
        projects[idx].category = newCat;
        projects[idx].categoryLabel = getCategoryLabel(newCat);

        saveProjectsData();
        renderPortfolio();
        openSlotModal(activeModalSlotId);
        showToast(`${projects[idx].slotCode} details saved.`);
      });
    }

    if (modalToggleEmptyBtn) {
      modalToggleEmptyBtn.addEventListener('click', () => {
        if (!activeModalSlotId) return;
        const idx = projects.findIndex((p) => p.id === activeModalSlotId);
        if (idx === -1) return;
        projects[idx].isEmptyPlaceholder = !projects[idx].isEmptyPlaceholder;
        saveProjectsData();
        renderPortfolio();
        openSlotModal(activeModalSlotId);
        showToast(
          projects[idx].isEmptyPlaceholder
            ? `${projects[idx].slotCode} set to Empty Placeholder Frame.`
            : `${projects[idx].slotCode} image restored.`
        );
      });
    }

    // Service "View Work" Jump Buttons
    document.querySelectorAll('[data-filter-jump]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = btn.getAttribute('data-filter-jump') || 'all';
        showAllArchive = true;
        if (scopeCuratedBtn && scopeAllBtn) {
          scopeCuratedBtn.classList.remove('active');
          scopeAllBtn.classList.add('active');
        }
        activeCategory = cat;
        filterTabs.forEach((t) => {
          const isMatch = t.getAttribute('data-category') === cat;
          t.classList.toggle('active', isMatch);
          t.setAttribute('aria-selected', String(isMatch));
        });
        renderPortfolio();
        document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Service "Inquire" Buttons -> Scroll to Contact & Check Service
    document.querySelectorAll('[data-select-service]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const serviceVal = btn.getAttribute('data-select-service');
        const checkboxes = document.querySelectorAll('#project-brief-form input[name="service"]');
        checkboxes.forEach((cb) => {
          cb.checked = cb.value === serviceVal;
        });
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('client-name')?.focus();
      });
    });

    // Copy Email Button
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', () => {
        const email = copyEmailBtn.getAttribute('data-email') || 'services.brandsign@gmail.com';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(() => {
            copyEmailBtn.textContent = '✓ Copied';
            showToast(`Copied ${email} to clipboard.`);
            setTimeout(() => {
              copyEmailBtn.textContent = 'Copy Email';
            }, 2500);
          });
        } else {
          showToast(`Email: ${email}`);
        }
      });
    }

    // Project Brief Form Submission
    const briefForm = document.getElementById('project-brief-form');
    const briefConfirm = document.getElementById('brief-confirmation');
    const briefConfirmText = document.getElementById('brief-confirmation-text');
    const briefMailtoTrigger = document.getElementById('brief-mailto-trigger');

    if (briefForm) {
      briefForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('client-name')?.value.trim();
        const brand = document.getElementById('client-brand')?.value.trim();
        const email = document.getElementById('client-email')?.value.trim();
        const scope = document.getElementById('client-scope')?.value;
        const message = document.getElementById('client-message')?.value.trim();

        const selectedServices = Array.from(
          briefForm.querySelectorAll('input[name="service"]:checked')
        ).map((cb) => cb.value);

        if (!name || !brand || !email || !message) {
          showToast('Please complete all required fields (*) in the brief.');
          return;
        }

        const pillarsText = selectedServices.length > 0
          ? selectedServices.join(', ')
          : 'Product Photography, Poster Design, UGC Ads';

        const subject = encodeURIComponent(`Brand Sign Creative Brief — ${brand} (${pillarsText})`);
        const body = encodeURIComponent(
          `Hello Brand Sign Team,\n\n` +
          `We would like to inquire about a creative campaign:\n\n` +
          `• Client Name: ${name}\n` +
          `• Brand / Company: ${brand}\n` +
          `• Work Email: ${email}\n` +
          `• Service Pillars: ${pillarsText}\n` +
          `• Estimated Scope: ${scope}\n\n` +
          `Project Goals & Product Details:\n${message}\n\n` +
          `Best regards,\n${name}`
        );

        if (briefMailtoTrigger) {
          briefMailtoTrigger.href = `mailto:services.brandsign@gmail.com?subject=${subject}&body=${body}`;
        }
        if (briefConfirmText) {
          briefConfirmText.textContent = `Thank you, ${name}. Your brief for ${brand} (${pillarsText}) is ready. Click below to dispatch directly to services.brandsign@gmail.com.`;
        }
        if (briefConfirm) {
          briefConfirm.style.display = 'block';
        }
        showToast('Creative brief ready for services.brandsign@gmail.com.');
      });
    }
  }

  // Initialize
  loadProjectsData();
  renderPortfolio();
  initEvents();
})();
