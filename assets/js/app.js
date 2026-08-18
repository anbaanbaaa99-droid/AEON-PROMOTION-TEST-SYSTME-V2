(function () {
  'use strict';

  const api = window.AEON_API;
  const cfg = window.APP_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const state = {
    user: null,
    bootstrap: null,
    selectedModule: '',
    currentQuiz: null,
    timerId: null,
    latestResult: null,
    adminData: null,
    reading: null,
    cms: { overview:null, editing:null, questions:[], users:[], tab:'' },
    pendingConfirm: null
  };

  const moduleDescriptions = {
    "HORENSO": "Pelaporan, penyampaian informasi, konsultasi, dan PDCA",
    "JISEKI": "Ownership, tanggung jawab, dan penyelesaian masalah proaktif",
    "KYO": "Johari Window, Egogram, ego state, dan komunikasi adaptif",
    "TWIJI": "OJT, Job Breakdown, dan cara mengajarkan pekerjaan",
    "DOUKIZUKE": "Motivasi, self-efficacy, feedback, dan pengembangan tim",
    "ALEC": "Active listening, questioning, HORENSO, dan kemandirian tim",
    "AEON_FIGURE": "Perhitungan retail, gross profit, inventory, dan stock rotation",
    "FUTURE_VISION": "Future Vision, customer orientation, relationships, attitudes, dan promise",
    "FOUNDATIONAL_IDEAL": "Customer First, peace, humanity, local community, dan innovation",
    "MANAGEMENT": "Management, performance, customer, marketing, innovation, dan mission",
    "SEMUA_DEMI_PELANGGAN": "Customer First, sejarah AEON, merger, dan people development",
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    bindGlobalEvents();
    restoreTheme();
    initRevealAnimations();

    const session = api.getSession();
    if (session?.token && session?.user) {
      // Jangan kirim health-check bersamaan dengan bootstrap.
      // Bootstrap sendiri sudah menjadi bukti koneksi server.
      state.user = session.user;
      loadApplication().catch(handleFatalSessionError);
    } else {
      showLogin();
      scheduleServerStatusCheck();
    }

    // Service worker ditunda sampai halaman selesai agar tidak ikut
    // berebut bandwidth/main-thread pada critical rendering path.
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        const register = () => navigator.serviceWorker.register('service-worker.js').catch(() => {});
        if ('requestIdleCallback' in window) requestIdleCallback(register, { timeout: 2500 });
        else setTimeout(register, 900);
      }, { once:true });
    }
  }

  function scheduleServerStatusCheck() {
    const run = () => updateServerStatus();
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1200 });
    else setTimeout(run, 350);
  }

  function bindGlobalEvents() {
    $$('[data-auth-mode]').forEach(button => button.addEventListener('click', () => switchAuthMode(button.dataset.authMode)));
    $('#loginForm').addEventListener('submit', handleLogin);
    $('#registerForm').addEventListener('submit', handleRegister);
    $('#togglePassword').addEventListener('click', togglePassword);
    $('#toggleRegisterPassword').addEventListener('click', () => togglePasswordField('#registerPassword', '#toggleRegisterPassword'));
    $('#logoutButton').addEventListener('click', confirmLogout);
    $('#themeToggle').addEventListener('click', toggleTheme);
    $('#startPracticeButton').addEventListener('click', () => navigate('practice'));
    $('#startReadingButton').addEventListener('click', () => navigate('modules'));
    $('#readerPrevious').addEventListener('click', () => moveReadingSection(-1));
    $('#readerNext').addEventListener('click', () => moveReadingSection(1));
    $('#readerPracticeButton').addEventListener('click', startPracticeFromReader);
    $('#readerPdfToggle').addEventListener('click', toggleReaderPdf);
    $('#beginQuizButton').addEventListener('click', beginQuiz);
    $('#questionCount').addEventListener('change', validateQuizSettings);
    $('#durationMinutes').addEventListener('change', validateQuizSettings);
    $('#previousQuestion').addEventListener('click', () => moveQuestion(-1));
    $('#nextQuestion').addEventListener('click', () => moveQuestion(1));
    $('#flagQuestion').addEventListener('change', toggleCurrentFlag);
    $('#finishQuizAside').addEventListener('click', () => confirmFinishQuiz(false));
    $('#readQuestionButton').addEventListener('click', readCurrentQuestion);
    $('#backDashboardButton').addEventListener('click', async () => { await refreshBootstrap(); navigate('dashboard'); });
    $('#reviewAnswersButton').addEventListener('click', () => $('#answerReviewPanel').classList.remove('hidden'));
    $('#closeReviewButton').addEventListener('click', () => $('#answerReviewPanel').classList.add('hidden'));
    $('#historyModuleFilter').addEventListener('change', renderHistory);
    $('#historySearch').addEventListener('input', debounce(renderHistory, 150));
    $('#adminModuleFilter').addEventListener('change', renderAdminResults);
    $('#adminStatusFilter').addEventListener('change', renderAdminResults);
    $('#adminSearch').addEventListener('input', debounce(renderAdminResults, 150));
    $('#adminAccountStatusFilter').addEventListener('change', renderAdminAccounts);
    $('#adminAccountSearch').addEventListener('input', debounce(renderAdminAccounts, 150));
    $('#refreshAdminUsers').addEventListener('click', loadAdminDashboard);
    $('#exportMyHistory').addEventListener('click', exportMyHistory);
    $('#exportAdminReport').addEventListener('click', exportAdminReport);
    $$('[data-admin-tab]').forEach(button => button.addEventListener('click', () => activateAdminTab(button.dataset.adminTab)));
    $('#cmsAddSection')?.addEventListener('click', () => addCmsSection());
    $('#cmsSaveDraft')?.addEventListener('click', saveCmsDraft);
    $('#cmsPublishModule')?.addEventListener('click', publishCmsModule);
    $('#cmsPreviewDraft')?.addEventListener('click', previewCmsDraft);
    $('#cmsRefreshVersions')?.addEventListener('click', loadCmsVersions);
    $('#cmsSections')?.addEventListener('click', handleCmsSectionAction);
    $('#cmsSections')?.addEventListener('change', handleCmsSectionChange);
    $('#cmsAddQuestion')?.addEventListener('click', () => openQuestionEditor());
    $('#cmsQuestionModule')?.addEventListener('change', () => loadCmsQuestions($('#cmsQuestionModule').value));
    $('#cmsQuestionSearch')?.addEventListener('input', debounce(renderCmsQuestions, 150));
    $('#cmsQuestionList')?.addEventListener('click', handleQuestionListAction);
    $('#saveQuestionButton')?.addEventListener('click', saveCmsQuestion);
    $('#refreshRoleUsers')?.addEventListener('click', loadRoleUsers);
    $('#roleManagementBody')?.addEventListener('change', handleRoleChange);
    window.addEventListener('hashchange', route);
    window.addEventListener('keydown', handleQuizKeyboard);
    window.addEventListener('beforeunload', event => {
      if (state.currentQuiz && !state.currentQuiz.submitting) {
        event.preventDefault(); event.returnValue = '';
      }
    });
    $('#confirmDialog').addEventListener('close', () => {
      const action = state.pendingConfirm;
      state.pendingConfirm = null;
      if ($('#confirmDialog').returnValue === 'confirm' && typeof action === 'function') action();
    });
  }

  async function updateServerStatus() {
    const box = $('#serverStatus');
    const text = $('#serverStatusText');
    const demoBox = $('#demoCredentials');
    if (!box || !text) return;
    box.classList.remove('ok','demo','error');
    if (api.demoMode) {
      box.classList.add('demo');
      text.textContent = 'Mode demo â€” backend belum digunakan';
      demoBox?.classList.remove('hidden');
      return;
    }
    demoBox?.classList.add('hidden');
    if (!api.isConfigured) {
      box.classList.add('error');
      text.textContent = 'API belum dikonfigurasi';
      return;
    }
    text.textContent = 'Memeriksa koneksi server...';
    try {
      const health = await api.health();
      box.classList.add('ok');
      text.textContent = `Server terhubung${health?.version ? ' Â· v'+health.version : ''}`;
    } catch (error) {
      box.classList.add('error');
      text.textContent = 'Server tidak dapat dijangkau';
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    clearLoginErrors();
    const id = $('#employeeId').value.trim();
    const password = $('#password').value;
    let invalid = false;
    if (!id) { $('#employeeIdError').textContent = 'Employee ID wajib diisi.'; invalid = true; }
    if (!password) { $('#passwordError').textContent = 'Password wajib diisi.'; invalid = true; }
    if (invalid) return;

    setButtonLoading($('#loginButton'), true);
    let loginSucceeded = false;
    try {
      const result = await api.login(id, password);
      loginSucceeded = true;
      state.user = result.user;
      toast('Login berhasil. Memuat dashboardâ€¦', 'success');
      await loadApplication();
      toast(`Selamat datang, ${state.user.name}.`, 'success');
    } catch (error) {
      const message = error.message || 'Login gagal.';
      if (loginSucceeded) {
        // Kredensial sudah valid; kegagalan berikutnya berasal dari pemuatan dashboard/bootstrap.
        $('#passwordError').textContent = 'Login berhasil, tetapi dashboard terlalu lama dimuat. Coba tekan Masuk lagi atau muat ulang halaman.';
        toast('Login berhasil, tetapi dashboard belum selesai dimuat.', 'error');
      } else {
        $('#passwordError').textContent = message;
        toast(message, 'error');
      }
    } finally { setButtonLoading($('#loginButton'), false); }
  }


  function switchAuthMode(mode) {
    const registerMode = mode === 'register';
    $('#loginPanel').classList.toggle('hidden', registerMode);
    $('#registerPanel').classList.toggle('hidden', !registerMode);
    $('#loginTab').classList.toggle('active', !registerMode);
    $('#registerTab').classList.toggle('active', registerMode);
    $('#loginTab').setAttribute('aria-selected', String(!registerMode));
    $('#registerTab').setAttribute('aria-selected', String(registerMode));
    if (registerMode) {
      $('#registrationSuccess').classList.add('hidden');
      setTimeout(() => $('#registerId').focus(), 30);
    } else {
      setTimeout(() => $('#employeeId').focus(), 30);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    clearRegisterErrors();
    $('#registrationSuccess').classList.add('hidden');

    const payload = {
      id: $('#registerId').value.trim(),
      name: $('#registerName').value.trim(),
      department: $('#registerDepartment').value.trim(),
      level: $('#registerLevel').value.trim(),
      password: $('#registerPassword').value
    };
    const confirmPassword = $('#registerPasswordConfirm').value;
    let invalid = false;

    if (!/^[A-Za-z0-9._-]{4,30}$/.test(payload.id)) {
      $('#registerIdError').textContent = 'Gunakan 4â€“30 karakter: huruf, angka, titik, strip, atau underscore.'; invalid = true;
    }
    if (payload.name.length < 3) { $('#registerNameError').textContent = 'Nama lengkap wajib diisi.'; invalid = true; }
    if (!payload.department) { $('#registerDepartmentError').textContent = 'Departemen / divisi wajib diisi.'; invalid = true; }
    if (payload.password.length < 6) { $('#registerPasswordError').textContent = 'Password minimal 6 karakter.'; invalid = true; }
    if (confirmPassword !== payload.password) { $('#registerPasswordConfirmError').textContent = 'Konfirmasi password belum sama.'; invalid = true; }
    if (!$('#registerConsent').checked) { $('#registerConsentError').textContent = 'Konfirmasi data terlebih dahulu.'; invalid = true; }
    if (invalid) return;

    setButtonLoading($('#registerButton'), true);
    try {
      const result = await api.register(payload);
      const registeredId = result.user?.id || payload.id;
      $('#registrationSuccessText').textContent = `ID ${registeredId} sudah dibuat dan berstatus menunggu approval. Setelah admin ACC, gunakan ID dan password ini untuk login.`;
      $('#registrationSuccess').classList.remove('hidden');
      $('#employeeId').value = registeredId;
      $('#registerForm').reset();
      toast('Permintaan akun berhasil dikirim ke admin.', 'success');
    } catch (error) {
      const message = error?.message || 'Registrasi gagal diproses.';
      if (error?.code === 'DUPLICATE_ID' || /sudah.*(digunakan|terdaftar|ada)/i.test(message)) $('#registerIdError').textContent = message;
      else toast(message, 'error');
    } finally { setButtonLoading($('#registerButton'), false); }
  }

  async function loadApplication() {
    await refreshBootstrap();
    configureUserUI();
    const requested = (location.hash.replace('#/', '') || 'dashboard').split('?')[0];
    const allowed = ['dashboard','modules','practice','history','admin'];
    if (!allowed.includes(requested) || (requested === 'admin' && !hasAdminArea())) location.hash = '#/dashboard';
    else route();
  }

  async function refreshBootstrap() {
    const data = await api.bootstrap();
    state.bootstrap = data;
    state.user = data.user || state.user;
    renderDashboard();
    renderReadingLibrary();
    renderPractice();
    renderHistoryFilters();
    renderHistory();
  }

  function configureUserUI() {
    $('#headerUserName').textContent = state.user.name || 'Peserta';
    $('#headerUserRole').textContent = state.user.role || 'User';
    $('#userAvatar').textContent = initials(state.user.name || state.user.id);
    $$('.admin-only').forEach(el => el.classList.toggle('hidden', !hasAdminArea()));
    $$('.monitoring-only').forEach(el => el.classList.toggle('hidden', !canMonitor()));
    $$('.content-only').forEach(el => el.classList.toggle('hidden', !canManageContent()));
    $$('.superadmin-only').forEach(el => el.classList.toggle('hidden', !isSuperAdmin()));
    $('#demoCredentials').classList.toggle('hidden', !api.demoMode);
  }

  function showLogin() {
    clearQuizTimer();
    state.currentQuiz = null;
    $('#appHeader').classList.add('hidden');
    $('#dashboardView').classList.add('hidden');
    $('#quizView').classList.add('hidden');
    $('#resultView').classList.add('hidden');
    $('#loginView').classList.remove('hidden');
    document.title = `Login Â· ${cfg.APP_NAME}`;
    switchAuthMode('login');
    const demoBox = $('#demoCredentials');
    if (demoBox) demoBox.classList.toggle('hidden', !api.demoMode);
  }

  function route() {
    if (!state.user) return showLogin();
    const routeName = (location.hash.replace('#/', '') || 'dashboard').split('?')[0];
    if (routeName === 'admin' && !hasAdminArea()) return navigate('dashboard');
    if (!['dashboard','modules','practice','history','admin'].includes(routeName)) return navigate('dashboard');

    $('#loginView').classList.add('hidden');
    $('#quizView').classList.add('hidden');
    $('#resultView').classList.add('hidden');
    $('#dashboardView').classList.remove('hidden');
    $('#appHeader').classList.remove('hidden');
    $$('.page-section').forEach(section => section.classList.add('hidden'));
    $(`#${routeName}Page`).classList.remove('hidden');
    $$('[data-route-link]').forEach(link => link.classList.toggle('active', link.dataset.routeLink === routeName));
    document.title = `${capitalize(routeName)} Â· ${cfg.APP_NAME}`;
    if (routeName === 'admin') initializeAdminArea();
    if (routeName === 'modules') renderReadingLibrary();
    window.scrollTo({ top:0, behavior:'auto' });
  }

  function navigate(routeName) {
    if (location.hash === `#/${routeName}`) route();
    else location.hash = `#/${routeName}`;
  }

  function renderDashboard() {
    if (!state.bootstrap) return;
    const data = state.bootstrap;
    $('#dashboardGreeting').textContent = `Halo, ${firstName(state.user.name)}!`;
    $('#averageScore').textContent = data.summary?.averageScore ?? 0;
    $('#bestScore').textContent = data.summary?.bestScore ?? 0;
    $('#attemptCount').textContent = data.summary?.attempts ?? 0;
    $('#readinessStatus').textContent = readinessText(data.summary?.averageScore || 0, data.summary?.attempts || 0);

    const progress = data.progress || [];
    $('#moduleProgress').innerHTML = progress.length ? progress.map(item => `
      <div class="module-progress-row">
        <strong>${escapeHtml(item.module)}</strong>
        <div class="progress-track" title="Target kelulusan ${cfg.PASSING_SCORE}"><div class="progress-fill ${item.bestScore < cfg.PASSING_SCORE ? 'low' : ''}" style="width:${clamp(item.bestScore,0,100)}%"></div></div>
        <span>${Number(item.bestScore)||0}</span>
      </div>`).join('') : '<p class="muted">Belum ada progres.</p>';

    const target = progress.filter(item => item.attempts > 0 && item.bestScore < cfg.PASSING_SCORE).sort((a,b)=>a.bestScore-b.bestScore)[0]
      || progress.filter(item => item.attempts === 0)[0]
      || progress.sort((a,b)=>a.bestScore-b.bestScore)[0];
    $('#recommendationCard').innerHTML = target ? `
      <span class="big-icon">ðŸŽ¯</span><h3>${target.attempts ? 'Perkuat ' : 'Mulai dari '}${escapeHtml(target.module)}</h3>
      <p>${target.attempts ? `Nilai terbaik saat ini ${target.bestScore}. Pelajari ulang bagian yang belum dikuasai dan coba latihan baru.` : 'Modul ini belum pernah dikerjakan. Mulai latihan singkat untuk mengukur pemahaman.'}</p>
      <button class="button button-primary button-small" type="button" data-recommend-module="${escapeAttr(target.module)}">Latihan modul</button>` : '<p class="muted">Belum ada rekomendasi.</p>';
    $('[data-recommend-module]')?.addEventListener('click', event => { selectModule(event.currentTarget.dataset.recommendModule); navigate('practice'); });

    const totalReadingModules = Number(data.summary?.totalModules) || (data.modules || []).length;
    const completedReadingModules = Number(data.summary?.modulesRead) || (data.readingProgress || []).filter(item => Number(item.progress) >= 100).length;
    const readingPercent = totalReadingModules ? Math.round(completedReadingModules / totalReadingModules * 100) : 0;
    $('#dashboardReadingCompleted').textContent = `${completedReadingModules}/${totalReadingModules}`;
    $('#dashboardReadingPercent').textContent = `${readingPercent}%`;
    $('#dashboardReadingProgressBar').style.width = `${readingPercent}%`;

    const latest = (data.results || []).slice(0, 3);
    $('#recentResultsBody').innerHTML = latest.length ? latest.map(resultRow).join('') : emptyRow(4, 'Belum ada hasil ujian.');
  }


  function readingProgressMap() {
    return Object.fromEntries((state.bootstrap?.readingProgress || []).map(item => [String(item.module || '').toUpperCase(), item]));
  }

  function renderReadingLibrary() {
    if (!state.bootstrap) return;
    const map = readingProgressMap();
    const progressFor = module => clamp(map[String(module.name).toUpperCase()]?.progress || 0, 0, 100);
    const modules = (state.bootstrap.modules || [])
      .filter(module => module.hasMaterial !== false)
      .slice()
      .sort((a,b) => {
        const pa = progressFor(a), pb = progressFor(b);
        const rank = p => p > 0 && p < 100 ? 0 : p === 0 ? 1 : 2;
        return rank(pa) - rank(pb) || pb - pa || String(a.title || a.name).localeCompare(String(b.title || b.name));
      });
    const completed = modules.filter(module => progressFor(module) >= 100).length;
    const percent = modules.length ? Math.round(completed / modules.length * 100) : 0;
    const featured = modules.find(module => {
      const p = progressFor(module); return p > 0 && p < 100;
    }) || modules.find(module => progressFor(module) === 0) || null;
    $('#readingOverallPercent').textContent = `${percent}%`;
    $('#readingOverallBar').style.width = `${percent}%`;
    $('#readingCompletedCount').textContent = `${completed}/${modules.length}`;

    $('#readingModuleList').innerHTML = modules.length ? modules.map(module => {
      const progress = progressFor(module);
      const active = state.reading?.module?.name === module.name;
      const isFeatured = featured?.name === module.name;
      return `<button class="reading-module-item ${active ? 'active' : ''} ${isFeatured ? 'featured' : ''}" type="button" data-read-module="${escapeAttr(module.name)}">
        <header><h3>${escapeHtml(module.title || module.name)}</h3><span class="account-status ${progress >= 100 ? 'approved' : progress > 0 ? 'pending' : 'rejected'}">${progress >= 100 ? 'Selesai' : progress > 0 ? `${progress}%` : 'Mulai'}</span></header>
        <p>${escapeHtml(module.description || moduleDescriptions[module.name] || '')}</p>
        <div class="module-meta-line"><span>${Number(module.readingMinutes)||5} menit baca</span><span>${Number(module.questionCount)||0} soal</span></div>
        <div class="mini-progress"><span style="width:${progress}%"></span></div>
      </button>`;
    }).join('') : '<p class="muted">Belum ada materi baca aktif.</p>';
    $$('[data-read-module]', $('#readingModuleList')).forEach(button => button.addEventListener('click', () => openReadingModule(button.dataset.readModule)));
  }

  async function openReadingModule(moduleName) {
    try {
      const response = await api.getModule(moduleName);
      const sections = Array.isArray(response.module?.sections) ? response.module.sections : [];
      if (!sections.length) throw new Error('Isi modul belum tersedia.');
      const saved = response.progress || {};
      const savedIndex = clamp(Number(saved.lastSection) || 0, 0, sections.length - 1);
      state.reading = { module:response.module, sections, sectionIndex:savedIndex, progress:clamp(saved.progress || 0,0,100), saving:false, pdfOpen:false };
      renderReadingLibrary();
      renderReader();
      if (window.matchMedia('(max-width: 980px)').matches) {
        requestAnimationFrame(() => $('#moduleReader')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block:'start'}));
      }
    } catch (error) { handleApiError(error); }
  }

  function renderReader() {
    const reading = state.reading;
    if (!reading) {
      $('#readingEmpty').classList.remove('hidden');
      $('#readerContent').classList.add('hidden');
      return;
    }
    const module = reading.module;
    const sections = reading.sections;
    const index = clamp(reading.sectionIndex, 0, sections.length - 1);
    const section = sections[index] || {};
    const progress = clamp(reading.progress || 0,0,100);
    $('#readingEmpty').classList.add('hidden');
    $('#readerContent').classList.remove('hidden');
    $('#readerModuleCode').textContent = module.name || 'MODULE';
    $('#readerTitle').textContent = module.title || module.name || 'Modul';
    $('#readerSummary').textContent = module.summary || module.description || '';
    $('#readerMinutes').textContent = `Â± ${Number(module.readingMinutes)||5} menit`;
    $('#readerProgressText').textContent = `${progress}%`;
    $('#readerProgressBar').style.width = `${progress}%`;
    $('#readerSectionIndex').textContent = `Bagian ${index + 1}/${sections.length}`;
    const sourcePages = String(section.sourcePages || '').trim();
    $('#readerSourcePages').textContent = sourcePages ? `Sumber PDF: halaman ${sourcePages}` : 'Ringkasan materi';
    const pdfUrl = String(module.pdfUrl || module.sourcePdf || '').trim();
    $('#readerPdfTools').classList.toggle('hidden', !pdfUrl);
    $('#readerPdfOpen').href = pdfUrl || '#';
    $('#readerPdfToggle').textContent = reading.pdfOpen ? 'Sembunyikan PDF' : 'Tampilkan PDF';
    $('#readerPdfPanel').classList.toggle('hidden', !reading.pdfOpen || !pdfUrl);
    if (reading.pdfOpen && pdfUrl) {
      const firstPage = (sourcePages.match(/\d+/) || [''])[0];
      const desiredSrc = `${pdfUrl}${firstPage ? `#page=${firstPage}` : ''}`;
      if ($('#readerPdfFrame').getAttribute('src') !== desiredSrc) $('#readerPdfFrame').src = desiredSrc;
    } else if ($('#readerPdfFrame').getAttribute('src')) {
      $('#readerPdfFrame').removeAttribute('src');
    }
    $('#readerSectionTitle').textContent = section.title || `Bagian ${index + 1}`;
    $('#readerSectionBody').innerHTML = String(section.body || '').split(/\n{2,}/).filter(Boolean).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
    const bullets = Array.isArray(section.bullets) ? section.bullets : [];
    $('#readerSectionBullets').innerHTML = bullets.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    $('#readerSectionBullets').classList.toggle('hidden', !bullets.length);
    $('#readerBlocks').innerHTML = renderLearningBlocks(Array.isArray(section.blocks) ? section.blocks : []);
    bindEmbedLoaders($('#readerBlocks'));
    $('#readerPrevious').disabled = index === 0;
    $('#readerNext').textContent = index === sections.length - 1 ? (progress >= 100 ? 'Sudah selesai âœ“' : 'Tandai selesai âœ“') : 'Berikutnya â†’';
    $('#readerNext').disabled = reading.saving || (index === sections.length - 1 && progress >= 100);
    $('#readerCompleteBadge').textContent = progress >= 100 ? 'Selesai' : progress > 0 ? 'Sedang dibaca' : 'Belum selesai';
    $('#readerCompleteBadge').className = `account-status ${progress >= 100 ? 'approved' : 'pending'}`;
  }

  function toggleReaderPdf() {
    if (!(state.reading?.module?.pdfUrl || state.reading?.module?.sourcePdf)) return toast('PDF asli belum tersedia untuk modul ini.', 'error');
    state.reading.pdfOpen = !state.reading.pdfOpen;
    renderReader();
  }

  async function moveReadingSection(delta) {
    const reading = state.reading;
    if (!reading || reading.saving) return;
    const last = reading.sections.length - 1;
    if (delta < 0) {
      reading.sectionIndex = clamp(reading.sectionIndex - 1, 0, last);
      renderReader();
      return;
    }

    const completedThrough = reading.sectionIndex + 1;
    const nextProgress = Math.max(reading.progress, Math.round(completedThrough / reading.sections.length * 100));
    const completing = reading.sectionIndex === last;
    reading.saving = true;
    renderReader();
    try {
      const response = await api.saveReadingProgress({module:reading.module.name, progress:completing ? 100 : nextProgress, lastSection:completing ? last : reading.sectionIndex + 1});
      const saved = response.progress || {module:reading.module.name,progress:completing?100:nextProgress,lastSection:completing?last:reading.sectionIndex+1};
      upsertLocalReadingProgress(saved);
      reading.progress = clamp(saved.progress,0,100);
      if (!completing) reading.sectionIndex = clamp(reading.sectionIndex + 1, 0, last);
      else toast('Modul selesai dibaca. Anda bisa lanjut ke latihan soal.', 'success');
    } catch (error) { handleApiError(error); }
    finally {
      reading.saving = false;
      renderReadingLibrary();
      renderReader();
      renderDashboard();
    }
  }

  function upsertLocalReadingProgress(progress) {
    if (!state.bootstrap) return;
    const list = Array.isArray(state.bootstrap.readingProgress) ? state.bootstrap.readingProgress : [];
    const key = String(progress.module || '').toUpperCase();
    const index = list.findIndex(item => String(item.module || '').toUpperCase() === key);
    if (index >= 0) list[index] = {...list[index], ...progress}; else list.push(progress);
    state.bootstrap.readingProgress = list;
    const total = (state.bootstrap.modules || []).filter(module => module.hasMaterial !== false).length;
    const done = list.filter(item => Number(item.progress) >= 100).length;
    state.bootstrap.summary = {...(state.bootstrap.summary || {}), totalModules:total, modulesRead:done, readingPercent:total?Math.round(done/total*100):0};
  }

  function startPracticeFromReader() {
    if (!state.reading?.module?.name) return;
    selectModule(state.reading.module.name);
    navigate('practice');
  }

  function renderPractice() {
    if (!state.bootstrap) return;
    const progressMap = Object.fromEntries((state.bootstrap.progress || []).map(item => [item.module, item]));
    $('#moduleCards').innerHTML = (state.bootstrap.modules || []).map(module => {
      const progress = progressMap[module.name] || {};
      return `<button class="module-card ${state.selectedModule === module.name ? 'selected' : ''}" type="button" data-module="${escapeAttr(module.name)}">
        <header><h3>${escapeHtml(module.name)}</h3><small>${Number(module.questionCount)||0} soal</small></header>
        <p>${escapeHtml(module.description || moduleDescriptions[module.name] || 'Materi promotion test')}</p>
        <p><strong>Nilai terbaik: ${Number(progress.bestScore)||0}</strong> Â· ${Number(progress.attempts)||0} percobaan Â· ${module.hasMaterial === false ? 'tanpa materi baca' : 'materi baca tersedia'}</p>
      </button>`;
    }).join('');
    $$('[data-module]', $('#moduleCards')).forEach(button => button.addEventListener('click', () => selectModule(button.dataset.module)));
    validateQuizSettings();
  }

  function selectModule(module) {
    state.selectedModule = module;
    $('#selectedModuleDisplay').value = module || 'Belum dipilih';
    $$('[data-module]', $('#moduleCards')).forEach(card => card.classList.toggle('selected', card.dataset.module === module));
    const info = (state.bootstrap?.modules || []).find(item => item.name === module);
    const countSelect = $('#questionCount');
    const available = Math.max(1, Number(info?.questionCount) || 1);
    const choices = [...new Set([5,10,15,20].filter(value => value <= available).concat([available]))].sort((a,b)=>a-b);
    countSelect.innerHTML = choices.map(value => `<option value="${value}">${value} soal</option>`).join('');
    countSelect.value = String(choices.reduce((best,value)=>Math.abs(value-Math.min(10,available))<Math.abs(best-Math.min(10,available))?value:best,choices[0]));
    validateQuizSettings();
  }

  function validateQuizSettings() {
    $('#beginQuizButton').disabled = !state.selectedModule || !Number($('#questionCount').value) || !Number($('#durationMinutes').value);
  }

  async function beginQuiz() {
    if (!state.selectedModule) return;
    setButtonLoading($('#beginQuizButton'), true);
    try {
      const payload = {
        module: state.selectedModule,
        count: Number($('#questionCount').value),
        durationSec: Number($('#durationMinutes').value) * 60
      };
      const quiz = await api.startQuiz(payload);
      if (!quiz.questions?.length) throw new Error('Soal pada modul ini belum tersedia.');
      const shouldShuffle = $('#shuffleAnswers').checked;
      state.currentQuiz = {
        quizId: quiz.quizId,
        module: quiz.module,
        questions: quiz.questions.map(question => ({...question, options:shouldShuffle ? shuffle(question.options) : question.options})),
        durationSec: Number(quiz.durationSec),
        remainingSec: Number(quiz.durationSec),
        startedAt: Date.now(),
        answers: {},
        flags: new Set(),
        index: 0,
        submitting: false
      };
      showQuiz();
    } catch (error) { handleApiError(error); }
    finally { setButtonLoading($('#beginQuizButton'), false); }
  }

  function showQuiz() {
    $('#appHeader').classList.add('hidden');
    $('#dashboardView').classList.add('hidden');
    $('#resultView').classList.add('hidden');
    $('#quizView').classList.remove('hidden');
    $('#quizModuleLabel').textContent = state.currentQuiz.module;
    document.title = `${state.currentQuiz.module} Â· Ujian`;
    renderQuestionPalette();
    renderCurrentQuestion();
    startQuizTimer();
    window.scrollTo(0,0);
  }

  function renderQuestionPalette() {
    const quiz = state.currentQuiz;
    $('#questionPalette').innerHTML = quiz.questions.map((q,index) => `<button type="button" class="palette-button" data-question-index="${index}" aria-label="Soal ${index+1}">${index+1}</button>`).join('');
    $$('[data-question-index]').forEach(button => button.addEventListener('click', () => goToQuestion(Number(button.dataset.questionIndex))));
    updatePaletteState();
  }

  function renderCurrentQuestion() {
    const quiz = state.currentQuiz;
    if (!quiz) return;
    const question = quiz.questions[quiz.index];
    $('#quizCounter').textContent = `Soal ${quiz.index + 1}/${quiz.questions.length}`;
    $('#quizProgressBar').style.width = `${((quiz.index + 1) / quiz.questions.length) * 100}%`;
    $('#questionLevel').textContent = question.level || 'General';
    $('#questionText').textContent = question.text;
    $('#answerOptions').innerHTML = question.options.map((option,index) => `
      <button class="answer-option ${quiz.answers[question.id] === option.key ? 'selected' : ''}" type="button" role="radio" aria-checked="${quiz.answers[question.id] === option.key}" data-answer-key="${escapeAttr(option.key)}">
        <span class="answer-key">${index + 1}</span><span class="answer-text">${escapeHtml(option.text)}</span>
      </button>`).join('');
    $$('[data-answer-key]', $('#answerOptions')).forEach(button => button.addEventListener('click', () => chooseAnswer(button.dataset.answerKey)));
    $('#flagQuestion').checked = quiz.flags.has(question.id);
    $('#previousQuestion').disabled = quiz.index === 0;
    $('#nextQuestion').textContent = quiz.index === quiz.questions.length - 1 ? 'Selesaikan â†’' : 'Berikutnya â†’';
    updatePaletteState();
  }

  function chooseAnswer(key) {
    const quiz = state.currentQuiz;
    const question = quiz.questions[quiz.index];
    quiz.answers[question.id] = key;
    renderCurrentQuestion();
  }

  function moveQuestion(delta) {
    const quiz = state.currentQuiz;
    if (!quiz) return;
    if (delta > 0 && quiz.index === quiz.questions.length - 1) return confirmFinishQuiz(false);
    goToQuestion(clamp(quiz.index + delta, 0, quiz.questions.length - 1));
  }

  function goToQuestion(index) {
    if (!state.currentQuiz) return;
    state.currentQuiz.index = clamp(index,0,state.currentQuiz.questions.length-1);
    renderCurrentQuestion();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function toggleCurrentFlag() {
    const quiz = state.currentQuiz;
    const id = quiz.questions[quiz.index].id;
    if ($('#flagQuestion').checked) quiz.flags.add(id); else quiz.flags.delete(id);
    updatePaletteState();
  }

  function updatePaletteState() {
    const quiz = state.currentQuiz;
    if (!quiz) return;
    $$('[data-question-index]').forEach((button,index) => {
      const id = quiz.questions[index].id;
      button.classList.toggle('current', index === quiz.index);
      button.classList.toggle('answered', Boolean(quiz.answers[id]) && index !== quiz.index);
      button.classList.toggle('flagged', quiz.flags.has(id));
    });
  }

  function startQuizTimer() {
    clearQuizTimer();
    updateTimerDisplay();
    state.timerId = setInterval(() => {
      if (!state.currentQuiz || state.currentQuiz.submitting) return;
      state.currentQuiz.remainingSec--;
      updateTimerDisplay();
      if (state.currentQuiz.remainingSec <= 0) {
        clearQuizTimer();
        toast('Waktu habis. Jawaban sedang dikirim.', 'error');
        submitQuiz(true);
      }
    }, 1000);
  }

  function clearQuizTimer() { if (state.timerId) clearInterval(state.timerId); state.timerId = null; }

  function updateTimerDisplay() {
    const remaining = Math.max(0, state.currentQuiz?.remainingSec || 0);
    $('#timerDisplay').textContent = formatDuration(remaining);
    $('#timerBox').classList.toggle('warning', remaining <= 300 && remaining > 60);
    $('#timerBox').classList.toggle('danger', remaining <= 60);
  }

  function confirmFinishQuiz(autoSubmit) {
    const quiz = state.currentQuiz;
    if (!quiz) return;
    if (autoSubmit) return submitQuiz(true);
    const unanswered = quiz.questions.filter(q => !quiz.answers[q.id]).length;
    showConfirm('Selesaikan ujian?', unanswered ? `${unanswered} soal belum dijawab. Jawaban kosong akan dinilai salah.` : 'Semua soal telah dijawab. Kirim jawaban sekarang?', 'Ya, kirim', () => submitQuiz(false));
  }

  async function submitQuiz(autoSubmit) {
    const quiz = state.currentQuiz;
    if (!quiz || quiz.submitting) return;
    quiz.submitting = true;
    clearQuizTimer();
    $('#finishQuizAside').disabled = true;
    try {
      const elapsed = Math.min(quiz.durationSec, Math.max(0, Math.floor((Date.now() - quiz.startedAt) / 1000)));
      const response = await api.submitQuiz({ quizId:quiz.quizId, answers:quiz.answers, durationSec:elapsed, autoSubmit:Boolean(autoSubmit) });
      state.latestResult = response.result;
      state.currentQuiz = null;
      showResult(response.result);
    } catch (error) {
      quiz.submitting = false;
      $('#finishQuizAside').disabled = false;
      startQuizTimer();
      handleApiError(error);
    }
  }

  function showResult(result) {
    $('#quizView').classList.add('hidden');
    $('#dashboardView').classList.add('hidden');
    $('#appHeader').classList.add('hidden');
    $('#resultView').classList.remove('hidden');
    $('#answerReviewPanel').classList.add('hidden');
    const passed = Number(result.score) >= cfg.PASSING_SCORE;
    $('#resultStatusIcon').textContent = passed ? 'âœ“' : '!';
    $('#resultStatusIcon').classList.toggle('fail', !passed);
    $('#resultHeadline').textContent = passed ? 'Selamat, target tercapai!' : 'Tetap semangat, perlu penguatan';
    $('#resultMessage').textContent = `${result.module} telah selesai dikerjakan.`;
    $('#resultScore').textContent = Number(result.score) || 0;
    $('#scoreRing').style.background = `conic-gradient(${passed ? 'var(--success)' : 'var(--primary)'} ${clamp(result.score,0,100)*3.6}deg,#eceef3 0deg)`;
    $('#resultCorrect').textContent = `${result.correct}/${result.total}`;
    $('#resultDuration').textContent = formatDuration(result.durationSec);
    $('#resultGrade').textContent = result.grade || grade(result.score);
    $('#resultRecommendation').textContent = result.recommendation || (passed ? 'Lanjutkan ke modul berikutnya.' : 'Pelajari kembali pembahasan dan lakukan remedial.');
    renderAnswerReview(result.review || []);
    $('#reviewAnswersButton').classList.toggle('hidden', !(result.review || []).length);
    document.title = `Hasil ${result.module} Â· ${cfg.APP_NAME}`;
    window.scrollTo(0,0);
  }

  function renderAnswerReview(review) {
    $('#answerReviewList').innerHTML = review.map(item => `
      <article class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
        <h3>${item.number}. ${escapeHtml(item.question)}</h3>
        <p><strong>Jawaban Anda:</strong> ${escapeHtml(item.selectedText || 'Tidak dijawab')} ${item.isCorrect ? 'âœ“' : 'âœ•'}</p>
        ${item.isCorrect ? '' : `<p><strong>Jawaban benar:</strong> ${escapeHtml(item.correctText || '')}</p>`}
        <p class="explanation"><strong>Pembahasan:</strong> ${escapeHtml(item.explanation || 'Belum tersedia.')}</p>
      </article>`).join('');
  }

  function renderHistoryFilters() {
    const options = (state.bootstrap?.modules || []).map(m => `<option value="${escapeAttr(m.name)}">${escapeHtml(m.name)}</option>`).join('');
    const current1 = $('#historyModuleFilter').value;
    const current2 = $('#adminModuleFilter').value;
    $('#historyModuleFilter').innerHTML = `<option value="">Semua modul</option>${options}`;
    $('#adminModuleFilter').innerHTML = `<option value="">Semua modul</option>${options}`;
    $('#historyModuleFilter').value = current1;
    $('#adminModuleFilter').value = current2;
  }

  function renderHistory() {
    const results = state.bootstrap?.results || [];
    const module = $('#historyModuleFilter').value;
    const query = $('#historySearch').value.trim().toLowerCase();
    const filtered = results.filter(row => (!module || row.module === module) && (!query || `${row.module} ${row.grade}`.toLowerCase().includes(query)));
    $('#historyTableBody').innerHTML = filtered.length ? filtered.map(row => `
      <tr><td>${formatDate(row.date)}</td><td><strong>${escapeHtml(row.module)}</strong></td><td>${Number(row.correct)||0}/${Number(row.total)||0}</td><td>${scorePill(row.score)}</td><td>${formatDuration(row.durationSec)}</td><td>${statusPill(row.grade,row.score)}</td></tr>`).join('') : emptyRow(6,'Data tidak ditemukan.');
  }


  function roleKey(role = state.user?.role) {
    const key = String(role || 'User').toLowerCase().replace(/[\s_-]+/g,'');
    if (key === 'admin' || key === 'superadmin') return 'superadmin';
    if (key === 'contentadmin' || key === 'editor' || key === 'contenteditor') return 'contentadmin';
    if (key === 'trainer') return 'trainer';
    return 'user';
  }
  function hasAdminArea() { return roleKey() !== 'user'; }
  function canMonitor() { return ['superadmin','trainer'].includes(roleKey()); }
  function canManageContent() { return ['superadmin','contentadmin'].includes(roleKey()); }
  function isSuperAdmin() { return roleKey() === 'superadmin'; }

  function initializeAdminArea() {
    configureUserUI();
    const requested = state.cms.tab;
    const allowed = requested && adminTabAllowed(requested) ? requested : (canMonitor() ? 'monitoring' : canManageContent() ? 'content' : isSuperAdmin() ? 'roles' : '');
    if (allowed) activateAdminTab(allowed);
  }

  function adminTabAllowed(tab) {
    if (tab === 'monitoring') return canMonitor();
    if (tab === 'content' || tab === 'questions') return canManageContent();
    if (tab === 'roles') return isSuperAdmin();
    return false;
  }

  async function activateAdminTab(tab) {
    if (!adminTabAllowed(tab)) return;
    state.cms.tab = tab;
    $$('[data-admin-tab]').forEach(button => button.classList.toggle('active', button.dataset.adminTab === tab));
    $$('[data-admin-panel]').forEach(panel => panel.classList.toggle('hidden', panel.dataset.adminPanel !== tab));
    if (tab === 'monitoring') await loadAdminDashboard();
    if (tab === 'content') await loadCmsOverview();
    if (tab === 'questions') { await loadCmsOverview(); populateCmsQuestionModules(); const value=$('#cmsQuestionModule')?.value; if(value) await loadCmsQuestions(value); }
    if (tab === 'roles') await loadRoleUsers();
  }

  async function loadCmsOverview(force = false) {
    if (!canManageContent()) return;
    if (state.cms.overview && !force) { renderCmsModules(); populateCmsQuestionModules(); return; }
    const list = $('#cmsModuleList');
    if (list) list.innerHTML = '<p class="muted">Memuat katalog materiâ€¦</p>';
    try {
      state.cms.overview = await api.adminCmsOverview();
      renderCmsModules();
      populateCmsQuestionModules();
    } catch (error) { handleApiError(error); }
  }

  function renderCmsModules() {
    const modules = state.cms.overview?.modules || [];
    const container = $('#cmsModuleList');
    if (!container) return;
    container.innerHTML = modules.length ? modules.map(module => `
      <article class="cms-module-card">
        <header><div><p class="eyebrow">${escapeHtml(module.name)}</p><h3>${escapeHtml(module.title)}</h3></div><span class="account-status ${String(module.status).toLowerCase()==='draft'?'pending':'approved'}">${escapeHtml(module.status || 'Published')}</span></header>
        <p>${escapeHtml(module.description || '')}</p>
        <div class="cms-card-meta"><span>${Number(module.sectionCount)||0} bagian</span><span>${Number(module.questionCount)||0} soal</span><span>v${Number(module.version)||1}</span></div>
        <small>Update: ${module.updatedAt ? formatDate(module.updatedAt) : '-'} Â· ${escapeHtml(module.updatedBy || 'SYSTEM')}</small>
        <div class="cms-card-actions"><button class="button button-primary button-small" type="button" data-cms-edit="${escapeAttr(module.name)}">Edit materi</button><button class="button button-secondary button-small" type="button" data-cms-questions="${escapeAttr(module.name)}">Kelola soal</button></div>
      </article>`).join('') : '<p class="muted">Belum ada modul.</p>';
    $$('[data-cms-edit]', container).forEach(button => button.addEventListener('click', () => openModuleEditor(button.dataset.cmsEdit)));
    $$('[data-cms-questions]', container).forEach(button => button.addEventListener('click', async () => { await activateAdminTab('questions'); $('#cmsQuestionModule').value=button.dataset.cmsQuestions; await loadCmsQuestions(button.dataset.cmsQuestions); }));
  }

  function populateCmsQuestionModules() {
    const modules = state.cms.overview?.modules || [];
    const select = $('#cmsQuestionModule');
    const editorSelect = $('#questionEditorModule');
    const options = modules.map(m=>`<option value="${escapeAttr(m.name)}">${escapeHtml(m.title || m.name)}</option>`).join('');
    if (select) { const current=select.value; select.innerHTML='<option value="">Pilih modul</option>'+options; if(modules.some(m=>m.name===current)) select.value=current; }
    if (editorSelect) editorSelect.innerHTML=options;
  }

  async function openModuleEditor(moduleName) {
    try {
      const response = await api.adminGetModuleDraft(moduleName);
      state.cms.editing = response.module;
      $('#cmsEditorHeading').textContent = response.module.title || response.module.name;
      $('#cmsEditorMeta').textContent = `${response.module.name} Â· ${response.module.status} Â· v${response.module.version}`;
      $('#cmsModuleTitle').value = response.module.title || '';
      $('#cmsModuleDescription').value = response.module.description || '';
      $('#cmsModuleMinutes').value = response.module.readingMinutes || 5;
      $('#cmsModulePdf').value = response.module.sourcePdf || '';
      renderCmsSections();
      $('#cmsVersionList').innerHTML = '';
      showDialog($('#moduleEditorDialog'));
    } catch(error) { handleApiError(error); }
  }

  function blankSection() { return {title:'Bagian baru',body:'',bullets:[],sourcePages:'',blocks:[]}; }
  function addCmsSection() { if(!state.cms.editing) return; state.cms.editing.sections = Array.isArray(state.cms.editing.sections)?state.cms.editing.sections:[]; state.cms.editing.sections.push(blankSection()); renderCmsSections(); }

  function renderCmsSections() {
    const sections = state.cms.editing?.sections || [];
    const container = $('#cmsSections'); if(!container) return;
    container.innerHTML = sections.length ? sections.map((section,index)=>cmsSectionHtml(section,index)).join('') : '<div class="cms-empty"><p>Belum ada bagian materi.</p><button class="button button-secondary button-small" type="button" data-section-action="add">+ Tambah bagian pertama</button></div>';
  }

  function cmsSectionHtml(section,index) {
    const blocks = Array.isArray(section.blocks)?section.blocks:[];
    return `<article class="cms-section-card" data-section-index="${index}">
      <header><span>${String(index+1).padStart(2,'0')}</span><strong>${escapeHtml(section.title || `Bagian ${index+1}`)}</strong><div><button class="icon-button mini" type="button" data-section-action="up">â†‘</button><button class="icon-button mini" type="button" data-section-action="down">â†“</button><button class="icon-button mini danger" type="button" data-section-action="delete">Ã—</button></div></header>
      <label class="field"><span>Judul bagian</span><input class="cms-section-title" value="${escapeAttr(section.title||'')}" placeholder="Contoh: Kesamaan persepsi sebagai dasar komunikasi" aria-label="Judul bagian"/></label>
      <label class="field"><span>Paragraf utama</span><textarea class="cms-section-body" rows="4" placeholder="Tuliskan penjelasan utama bagian ini" aria-label="Paragraf utama">${escapeHtml(section.body||'')}</textarea></label>
      <label class="field"><span>Bullet (1 baris = 1 poin)</span><textarea class="cms-section-bullets" rows="3" placeholder="Satu poin per baris" aria-label="Bullet">${escapeHtml((section.bullets||[]).join('\n'))}</textarea></label>
      <label class="field"><span>Referensi halaman</span><input class="cms-section-pages" value="${escapeAttr(section.sourcePages||'')}" placeholder="Contoh halaman sumber: 12-15" aria-label="Referensi halaman"/></label>
      <div class="cms-block-heading"><strong>Konten visual tambahan</strong><button class="button button-ghost button-small" type="button" data-section-action="add-block">+ Tambah blok</button></div>
      <div class="cms-block-list">${blocks.map((block,blockIndex)=>cmsBlockHtml(block,blockIndex)).join('')}</div>
    </article>`;
  }

  function cmsBlockHtml(block,index) {
    const type=block.type||'paragraph';
    const isMedia=['image','embed'].includes(type), isBullets=type==='bullets';
    const textValue=isBullets?(block.items||[]).join('\n'):(block.text||block.alt||block.label||'');
    return `<div class="cms-block-card" data-block-index="${index}"><div class="cms-block-top"><select class="cms-block-type"><option value="paragraph" ${type==='paragraph'?'selected':''}>Paragraf</option><option value="heading" ${type==='heading'?'selected':''}>Subjudul</option><option value="bullets" ${type==='bullets'?'selected':''}>Bullet</option><option value="highlight" ${type==='highlight'?'selected':''}>Highlight</option><option value="formula" ${type==='formula'?'selected':''}>Formula</option><option value="image" ${type==='image'?'selected':''}>Gambar</option><option value="embed" ${type==='embed'?'selected':''}>Embed PPT/Doc</option></select><button class="icon-button mini" type="button" data-block-action="up">â†‘</button><button class="icon-button mini" type="button" data-block-action="down">â†“</button><button class="icon-button mini danger" type="button" data-block-action="delete">Ã—</button></div>
      ${isMedia?`<label class="field"><span>URL</span><input class="cms-block-url" value="${escapeAttr(block.url||'')}" placeholder="https://... atau assets/..."/></label><label class="field"><span>${type==='image'?'Alt text':'Label tombol'}</span><input class="cms-block-text" value="${escapeAttr(textValue)}"/></label><label class="field"><span>Caption</span><input class="cms-block-meta" value="${escapeAttr(block.caption||'')}"/></label>`:`<label class="field"><span>${isBullets?'Isi (1 baris = 1 poin)':'Isi blok'}</span><textarea class="cms-block-text" rows="3" placeholder="Isi konten blok ini" aria-label="Isi blok">${escapeHtml(textValue)}</textarea></label>`}
    </div>`;
  }

  function syncCmsEditorFromDom() {
    if(!state.cms.editing) return;
    const sections=[];
    $$('.cms-section-card', $('#cmsSections')).forEach(card=>{
      const section={title:$('.cms-section-title',card).value.trim(),body:$('.cms-section-body',card).value.trim(),bullets:$('.cms-section-bullets',card).value.split(/\n+/).map(x=>x.trim()).filter(Boolean),sourcePages:$('.cms-section-pages',card).value.trim(),blocks:[]};
      $$('.cms-block-card',card).forEach(blockCard=>{
        const type=$('.cms-block-type',blockCard).value, text=$('.cms-block-text',blockCard)?.value.trim()||'';
        if(type==='bullets') section.blocks.push({type,items:text.split(/\n+/).map(x=>x.trim()).filter(Boolean)});
        else if(type==='image') section.blocks.push({type,url:$('.cms-block-url',blockCard)?.value.trim()||'',alt:text,caption:$('.cms-block-meta',blockCard)?.value.trim()||''});
        else if(type==='embed') section.blocks.push({type,url:$('.cms-block-url',blockCard)?.value.trim()||'',label:text||'Buka materi visual',caption:$('.cms-block-meta',blockCard)?.value.trim()||''});
        else section.blocks.push({type,text});
      });
      sections.push(section);
    });
    state.cms.editing.sections=sections;
    state.cms.editing.title=$('#cmsModuleTitle').value.trim();
    state.cms.editing.description=$('#cmsModuleDescription').value.trim();
    state.cms.editing.readingMinutes=Number($('#cmsModuleMinutes').value)||5;
    state.cms.editing.sourcePdf=$('#cmsModulePdf').value.trim();
  }

  function handleCmsSectionChange(event) {
    if(event.target.matches('.cms-block-type')) { syncCmsEditorFromDom(); renderCmsSections(); }
  }

  function handleCmsSectionAction(event) {
    const button=event.target.closest('[data-section-action],[data-block-action]'); if(!button||!state.cms.editing) return;
    syncCmsEditorFromDom();
    const sectionCard=button.closest('.cms-section-card');
    if(button.dataset.sectionAction==='add') return addCmsSection();
    if(!sectionCard) return;
    const si=Number(sectionCard.dataset.sectionIndex), sections=state.cms.editing.sections;
    const sa=button.dataset.sectionAction;
    if(sa==='up'&&si>0) [sections[si-1],sections[si]]=[sections[si],sections[si-1]];
    if(sa==='down'&&si<sections.length-1) [sections[si+1],sections[si]]=[sections[si],sections[si+1]];
    if(sa==='delete') sections.splice(si,1);
    if(sa==='add-block') sections[si].blocks.push({type:'paragraph',text:''});
    const blockCard=button.closest('.cms-block-card');
    if(blockCard&&button.dataset.blockAction){ const bi=Number(blockCard.dataset.blockIndex), blocks=sections[si].blocks, ba=button.dataset.blockAction; if(ba==='up'&&bi>0)[blocks[bi-1],blocks[bi]]=[blocks[bi],blocks[bi-1]]; if(ba==='down'&&bi<blocks.length-1)[blocks[bi+1],blocks[bi]]=[blocks[bi],blocks[bi+1]]; if(ba==='delete')blocks.splice(bi,1); }
    renderCmsSections();
  }

  function cmsPayload() { syncCmsEditorFromDom(); const m=state.cms.editing; return {module:m.name,title:m.title,description:m.description,readingMinutes:m.readingMinutes,sourcePdf:m.sourcePdf,sections:m.sections,active:m.active!==false}; }

  async function saveCmsDraft() { if(!state.cms.editing)return false; setButtonBusyText($('#cmsSaveDraft'),true,'Menyimpanâ€¦'); try{ const result=await api.adminSaveModuleDraft(cmsPayload()); state.cms.editing=result.module; toast(result.message||'Draft tersimpan.','success'); state.cms.overview=null; renderCmsSections(); $('#cmsEditorMeta').textContent=`${result.module.name} Â· Draft Â· v${result.module.version}`; return true; }catch(e){handleApiError(e);return false;}finally{setButtonBusyText($('#cmsSaveDraft'),false,'Simpan draft');} }
  async function publishCmsModule() { if(!state.cms.editing)return; const saved=await saveCmsDraft(); if(!saved)return; showConfirm('Publish materi?','Versi yang sedang digunakan peserta akan diganti dengan draft ini. Riwayat versi lama tetap disimpan.','Publish',async()=>{ try{ const result=await api.adminPublishModule(state.cms.editing.name); toast(result.message,'success'); state.cms.overview=null; const fresh=await api.adminGetModuleDraft(state.cms.editing.name); state.cms.editing=fresh.module; $('#cmsEditorMeta').textContent=`${fresh.module.name} Â· Published Â· v${fresh.module.version}`; await loadCmsOverview(true); await refreshBootstrap(); }catch(e){handleApiError(e);} }); }

  function previewCmsDraft() { if(!state.cms.editing)return; syncCmsEditorFromDom(); $('#previewModuleTitle').textContent=state.cms.editing.title||state.cms.editing.name; $('#previewSections').innerHTML=(state.cms.editing.sections||[]).map((section,i)=>`<article class="preview-section"><p class="eyebrow">BAGIAN ${i+1}/${state.cms.editing.sections.length}</p><h3>${escapeHtml(section.title||'')}</h3>${String(section.body||'').split(/\n{2,}/).filter(Boolean).map(x=>`<p>${escapeHtml(x)}</p>`).join('')}${section.bullets?.length?`<ul>${section.bullets.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`:''}${renderLearningBlocks(section.blocks||[])}</article>`).join(''); bindEmbedLoaders($('#previewSections')); showDialog($('#draftPreviewDialog')); }

  async function loadCmsVersions(){ if(!state.cms.editing)return; const box=$('#cmsVersionList'); box.innerHTML='<p class="muted">Memuat versiâ€¦</p>'; try{const result=await api.adminModuleVersions(state.cms.editing.name); box.innerHTML=(result.versions||[]).map(v=>`<div class="version-row"><span><strong>v${v.version}</strong><small>${v.publishedAt?formatDate(v.publishedAt):'-'} Â· ${escapeHtml(v.publishedBy||'-')}</small></span><button class="button button-ghost button-small" type="button" data-rollback-version="${v.version}">Rollback</button></div>`).join('')||'<p class="muted">Belum ada riwayat versi.</p>'; $$('[data-rollback-version]',box).forEach(btn=>btn.addEventListener('click',()=>showConfirm(`Rollback ke v${btn.dataset.rollbackVersion}?`,'Konten versi lama akan dipublish sebagai versi baru.','Rollback',async()=>{try{const r=await api.adminRollbackModule(state.cms.editing.name,Number(btn.dataset.rollbackVersion));toast(r.message,'success');state.cms.overview=null;await openModuleEditor(state.cms.editing.name);}catch(e){handleApiError(e);}})));}catch(e){handleApiError(e);} }

  async function loadCmsQuestions(moduleName){ if(!canManageContent()||!moduleName)return; $('#cmsQuestionList').innerHTML='<p class="muted">Memuat soalâ€¦</p>'; try{const result=await api.adminQuestions(moduleName); state.cms.questions=result.questions||[]; renderCmsQuestions();}catch(e){handleApiError(e);} }
  function renderCmsQuestions(){ const q=$('#cmsQuestionSearch')?.value.trim().toLowerCase()||''; const rows=(state.cms.questions||[]).filter(x=>!q||`${x.id} ${x.question}`.toLowerCase().includes(q)); $('#cmsQuestionList').innerHTML=rows.length?rows.map(x=>`<article class="cms-question-card ${x.active?'':'inactive'}"><div><span class="badge">${escapeHtml(x.level)}</span><strong>${escapeHtml(x.id)}</strong><p>${escapeHtml(x.question)}</p><small>Kunci: ${escapeHtml(x.answer)} Â· ${x.active?'Aktif':'Nonaktif'}</small></div><div><button class="button button-secondary button-small" type="button" data-question-edit="${escapeAttr(x.id)}">Edit</button><button class="button button-ghost button-small" type="button" data-question-toggle="${escapeAttr(x.id)}" data-active="${x.active?'0':'1'}">${x.active?'Nonaktifkan':'Aktifkan'}</button></div></article>`).join(''):'<p class="muted">Soal tidak ditemukan.</p>'; }
  function handleQuestionListAction(event){ const edit=event.target.closest('[data-question-edit]'), toggle=event.target.closest('[data-question-toggle]'); if(edit){const item=state.cms.questions.find(x=>x.id===edit.dataset.questionEdit);openQuestionEditor(item);} if(toggle)toggleCmsQuestion(toggle.dataset.questionToggle,toggle.dataset.active==='1'); }
  function openQuestionEditor(item=null){ populateCmsQuestionModules(); const selected=item?.module||$('#cmsQuestionModule').value||(state.cms.overview?.modules?.[0]?.name||''); $('#questionEditorHeading').textContent=item?'Edit soal':'Tambah soal'; $('#questionEditorId').value=item?.id||''; $('#questionEditorModule').value=selected; $('#questionEditorLevel').value=item?.level||'Medium'; $('#questionEditorText').value=item?.question||''; $('#questionOptionA').value=item?.optionA||''; $('#questionOptionB').value=item?.optionB||''; $('#questionOptionC').value=item?.optionC||''; $('#questionOptionD').value=item?.optionD||''; $('#questionAnswer').value=item?.answer||'A'; $('#questionExplanation').value=item?.explanation||''; $('#questionActive').checked=item?.active!==false; showDialog($('#questionEditorDialog')); }
  async function saveCmsQuestion(){const payload={id:$('#questionEditorId').value,module:$('#questionEditorModule').value,level:$('#questionEditorLevel').value,question:$('#questionEditorText').value,optionA:$('#questionOptionA').value,optionB:$('#questionOptionB').value,optionC:$('#questionOptionC').value,optionD:$('#questionOptionD').value,answer:$('#questionAnswer').value,explanation:$('#questionExplanation').value,active:$('#questionActive').checked};setButtonBusyText($('#saveQuestionButton'),true,'Menyimpanâ€¦');try{const r=await api.adminSaveQuestion(payload);toast(r.message,'success');$('#questionEditorDialog').close();state.cms.overview=null;await loadCmsOverview(true);$('#cmsQuestionModule').value=payload.module;await loadCmsQuestions(payload.module);}catch(e){handleApiError(e);}finally{setButtonBusyText($('#saveQuestionButton'),false,'Simpan soal');}}
  async function toggleCmsQuestion(id,active){try{const r=await api.adminSetQuestionActive({id,active});toast(r.message,'success');await loadCmsQuestions($('#cmsQuestionModule').value);}catch(e){handleApiError(e);}}

  async function loadRoleUsers(){ if(!isSuperAdmin())return; $('#roleManagementBody').innerHTML=emptyRow(5,'Memuat akunâ€¦'); try{const result=await api.adminUsers();state.cms.users=result.users||[];renderRoleUsers();}catch(e){handleApiError(e);} }
  function renderRoleUsers(){ const users=state.cms.users||[]; $('#roleManagementBody').innerHTML=users.length?users.map(user=>`<tr><td><strong>${escapeHtml(user.id)}</strong></td><td>${escapeHtml(user.name||'-')}</td><td>${accountStatusPill(user.status)}</td><td>${escapeHtml(user.role||'User')}</td><td><select class="role-select" data-role-user="${escapeAttr(user.id)}" ${String(user.id).toUpperCase()==='ADMIN'?'disabled':''}><option value="User" ${roleKey(user.role)==='user'?'selected':''}>User</option><option value="Trainer" ${roleKey(user.role)==='trainer'?'selected':''}>Trainer</option><option value="ContentAdmin" ${roleKey(user.role)==='contentadmin'?'selected':''}>ContentAdmin</option><option value="SuperAdmin" ${roleKey(user.role)==='superadmin'?'selected':''}>SuperAdmin</option></select></td></tr>`).join(''):emptyRow(5,'Belum ada akun.'); }
  async function handleRoleChange(event){ const select=event.target.closest('[data-role-user]'); if(!select)return; const id=select.dataset.roleUser,role=select.value; showConfirm('Ubah role akun?',`${id} akan memiliki role ${role}.`,'Simpan role',async()=>{try{const r=await api.adminUpdateUserRole({id,role});toast(r.message,'success');await loadRoleUsers();if(id===state.user.id){await refreshBootstrap();configureUserUI();initializeAdminArea();}}catch(e){handleApiError(e);await loadRoleUsers();}}); }

  function renderLearningBlocks(blocks){ return (Array.isArray(blocks)?blocks:[]).map(block=>{const type=String(block.type||'paragraph');if(type==='heading')return `<h4 class="learning-block-heading">${escapeHtml(block.text||'')}</h4>`;if(type==='paragraph')return `<p class="learning-block-paragraph">${escapeHtml(block.text||'')}</p>`;if(type==='highlight')return `<aside class="learning-highlight">${escapeHtml(block.text||'')}</aside>`;if(type==='formula')return `<pre class="learning-formula">${escapeHtml(block.text||'')}</pre>`;if(type==='bullets')return `<ul class="learning-block-bullets">${(block.items||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`;if(type==='image'&&block.url)return `<figure class="learning-image"><img loading="lazy" decoding="async" src="${escapeAttr(block.url)}" alt="${escapeAttr(block.alt||'Visual materi')}"/>${block.caption?`<figcaption>${escapeHtml(block.caption)}</figcaption>`:''}</figure>`;if(type==='embed'&&block.url)return `<div class="learning-embed"><button class="button button-secondary button-small" type="button" data-embed-url="${escapeAttr(block.url)}">${escapeHtml(block.label||'Buka materi visual')}</button><a class="text-link" href="${escapeAttr(block.url)}" target="_blank" rel="noopener">Buka tab baru â†—</a>${block.caption?`<p>${escapeHtml(block.caption)}</p>`:''}<div class="embed-slot"></div></div>`;return '';}).join(''); }
  function bindEmbedLoaders(root){ if(!root)return; $$('[data-embed-url]',root).forEach(btn=>btn.addEventListener('click',()=>{const wrap=btn.closest('.learning-embed'),slot=$('.embed-slot',wrap);if(slot.querySelector('iframe')){slot.innerHTML='';btn.textContent='Tampilkan materi';return;}const iframe=document.createElement('iframe');iframe.loading='lazy';iframe.src=btn.dataset.embedUrl;iframe.title=btn.textContent;iframe.referrerPolicy='no-referrer-when-downgrade';slot.appendChild(iframe);btn.textContent='Sembunyikan materi';})); }
  function showDialog(dialog){ if(!dialog)return;if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open',''); }
  function setButtonBusyText(button,busy,label){ if(!button)return;button.disabled=busy;button.textContent=label; }
  function initRevealAnimations(){ if(!('IntersectionObserver' in window))return; const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.12}); $$('.reveal-on-scroll').forEach(el=>observer.observe(el)); }

  async function loadAdminDashboard() {
    if (!canMonitor()) return;
    const refreshButton = $('#refreshAdminUsers');
    if (refreshButton) refreshButton.disabled = true;
    try {
      const data = await api.adminDashboard();
      state.adminData = data;
      const accounts = data.accounts || [];
      $('#adminPendingUsers').textContent = data.summary?.pendingUsers ?? accounts.filter(user => String(user.status).toLowerCase() === 'pending').length;
      $('#adminTotalUsers').textContent = data.summary?.totalUsers ?? accounts.length;
      $('#adminTotalAttempts').textContent = data.summary?.totalAttempts ?? 0;
      $('#adminAverageScore').textContent = data.summary?.averageScore ?? 0;
      $('#adminRemedialCount').textContent = data.summary?.remedialCount ?? 0;
      renderAdminAccounts();
      renderAdminModuleChart(data.moduleStats || []);
      renderAdminRecommendation(data.moduleStats || []);
      renderAdminResults();
    } catch (error) { handleApiError(error); }
    finally { if (refreshButton) refreshButton.disabled = false; }
  }

  function renderAdminAccounts() {
    const accounts = state.adminData?.accounts || [];
    const status = $('#adminAccountStatusFilter').value.trim().toLowerCase();
    const query = $('#adminAccountSearch').value.trim().toLowerCase();
    const filtered = accounts.filter(account => {
      const accountStatus = String(account.status || (account.active ? 'approved' : 'pending')).toLowerCase();
      const text = `${account.id} ${account.name} ${account.department} ${account.level}`.toLowerCase();
      return (!status || accountStatus === status) && (!query || text.includes(query));
    });

    $('#adminAccountsBody').innerHTML = filtered.length ? filtered.map(account => {
      const accountStatus = String(account.status || (account.active ? 'approved' : 'pending')).toLowerCase();
      const actions = accountStatus === 'pending'
        ? `<div class="account-actions"><button class="button button-primary button-small" type="button" data-account-id="${escapeAttr(account.id)}" data-account-action="approved">ACC</button><button class="button button-secondary button-small" type="button" data-account-id="${escapeAttr(account.id)}" data-account-action="rejected">Tolak</button></div>`
        : accountStatus === 'approved'
          ? `<button class="button button-secondary button-small" type="button" data-account-id="${escapeAttr(account.id)}" data-account-action="rejected">Cabut akses</button>`
          : `<button class="button button-primary button-small" type="button" data-account-id="${escapeAttr(account.id)}" data-account-action="approved">Setujui</button>`;
      return `<tr><td><strong>${escapeHtml(account.id)}</strong></td><td>${escapeHtml(account.name)}</td><td>${escapeHtml(account.department || '-')}</td><td>${escapeHtml(account.level || '-')}</td><td>${accountStatusPill(accountStatus)}</td><td>${Number(account.modulesRead)||0}</td><td>${formatDate(account.createdAt)}</td><td>${actions}</td></tr>`;
    }).join('') : emptyRow(8, status === 'pending' ? 'Tidak ada akun yang menunggu approval.' : 'Akun tidak ditemukan.');

    $$('[data-account-action]', $('#adminAccountsBody')).forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.accountId;
      const nextStatus = button.dataset.accountAction;
      const approve = nextStatus === 'approved';
      showConfirm(
        approve ? 'Setujui akun peserta?' : 'Cabut / tolak akses akun?',
        approve ? `Akun ${id} akan dapat login dan mengakses promotion test.` : `Akun ${id} tidak akan dapat login sampai disetujui kembali.`,
        approve ? 'Ya, ACC' : 'Ya, batasi akses',
        () => updateAccountStatus(id, nextStatus)
      );
    }));
  }

  async function updateAccountStatus(id, status) {
    try {
      await api.adminUpdateUserStatus({ id, status });
      toast(status === 'approved' ? `Akun ${id} berhasil di-ACC.` : `Akses akun ${id} dibatasi.`, 'success');
      await loadAdminDashboard();
    } catch (error) { handleApiError(error); }
  }

  function accountStatusPill(status) {
    const normalized = String(status || 'pending').toLowerCase();
    const label = normalized === 'approved' ? 'Disetujui' : normalized === 'rejected' ? 'Ditolak' : 'Menunggu';
    return `<span class="account-status ${escapeAttr(normalized)}">${label}</span>`;
  }

  function renderAdminModuleChart(stats) {
    $('#adminModuleChart').innerHTML = stats.map(item => `
      <div class="bar-row"><span class="bar-label">${escapeHtml(item.module)}</span><div class="bar-track"><div class="bar-fill" style="width:${clamp(item.averageScore,0,100)}%"></div></div><strong>${Number(item.averageScore)||0}</strong></div>`).join('') || '<p class="muted">Belum ada data.</p>';
  }

  function renderAdminRecommendation(stats) {
    const active = stats.filter(item => item.attempts > 0).sort((a,b)=>a.averageScore-b.averageScore);
    const lowest = active[0];
    $('#adminRecommendation').innerHTML = lowest ? `
      <div class="recommendation-card"><span class="big-icon">ðŸ“Œ</span><h3>${escapeHtml(lowest.module)}</h3><p>Rata-rata ${Number(lowest.averageScore)||0} dari ${Number(lowest.attempts)||0} percobaan. Prioritaskan refresh materi, diskusi kasus, dan remedial terarah.</p></div>` : '<p class="muted">Belum ada data evaluasi.</p>';
  }

  function renderAdminResults() {
    const results = state.adminData?.results || [];
    const module = $('#adminModuleFilter').value;
    const status = $('#adminStatusFilter').value;
    const query = $('#adminSearch').value.trim().toLowerCase();
    const filtered = results.filter(row => {
      const statusMatch = !status || (status === 'remedial' ? Number(row.score) < cfg.PASSING_SCORE : Number(row.score) >= cfg.PASSING_SCORE);
      const text = `${row.id} ${row.name} ${row.department}`.toLowerCase();
      return (!module || row.module === module) && statusMatch && (!query || text.includes(query));
    });
    $('#adminResultsBody').innerHTML = filtered.length ? filtered.map(row => `<tr><td>${formatDate(row.date)}</td><td>${escapeHtml(row.id)}</td><td><strong>${escapeHtml(row.name)}</strong></td><td>${escapeHtml(row.department||'-')}</td><td>${escapeHtml(row.module)}</td><td>${scorePill(row.score)}</td><td>${statusPill(row.grade,row.score)}</td></tr>`).join('') : emptyRow(7,'Data tidak ditemukan.');
  }

  function exportMyHistory() {
    const rows = state.bootstrap?.results || [];
    exportCsv(`riwayat-${safeFilename(state.user.id)}.csv`, ['Tanggal','ID','Nama','Modul','Nilai','Benar','Total','Durasi Detik','Grade'], rows.map(r=>[r.date,r.id,r.name,r.module,r.score,r.correct,r.total,r.durationSec,r.grade]));
  }

  function exportAdminReport() {
    const rows = state.adminData?.results || [];
    exportCsv(`laporan-promotion-test-${dateStamp()}.csv`, ['Tanggal','Attempt ID','ID','Nama','Departemen','Modul','Nilai','Benar','Total','Durasi Detik','Grade'], rows.map(r=>[r.date,r.attemptId,r.id,r.name,r.department,r.module,r.score,r.correct,r.total,r.durationSec,r.grade]));
  }

  function exportCsv(filename, headers, rows) {
    if (!rows.length) return toast('Tidak ada data untuk diekspor.', 'error');
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('File CSV berhasil dibuat.', 'success');
  }

  function confirmLogout() {
    showConfirm('Keluar dari aplikasi?', 'Sesi Anda akan diakhiri pada perangkat ini.', 'Keluar', async () => {
      await api.logout(); state.user=null; state.bootstrap=null; state.reading=null; location.hash=''; showLogin();
    });
  }

  function showConfirm(title, message, actionLabel, action) {
    $('#confirmTitle').textContent = title;
    $('#confirmMessage').textContent = message;
    $('#confirmAction').textContent = actionLabel;
    state.pendingConfirm = action;
    const dialog = $('#confirmDialog');
    if (typeof dialog.showModal === 'function') dialog.showModal(); else if (window.confirm(`${title}\n\n${message}`)) action();
  }

  function readCurrentQuestion() {
    if (!('speechSynthesis' in window) || !state.currentQuiz) return toast('Fitur suara tidak didukung browser ini.', 'error');
    speechSynthesis.cancel();
    const q = state.currentQuiz.questions[state.currentQuiz.index];
    const text = `${q.text}. ${q.options.map((o,i)=>`Pilihan ${i+1}: ${o.text}`).join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'id-ID'; utterance.rate = .92; speechSynthesis.speak(utterance);
  }

  function handleQuizKeyboard(event) {
    if (!state.currentQuiz || $('#quizView').classList.contains('hidden') || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
    if (['1','2','3','4'].includes(event.key)) {
      const q = state.currentQuiz.questions[state.currentQuiz.index];
      const option = q.options[Number(event.key)-1]; if (option) chooseAnswer(option.key);
    } else if (event.key === 'ArrowRight') moveQuestion(1);
    else if (event.key === 'ArrowLeft') moveQuestion(-1);
  }

  function handleFatalSessionError(error) {
    api.clearSession(); state.user=null; state.bootstrap=null; state.reading=null; showLogin();
    toast(error.message || 'Sesi tidak valid. Silakan login kembali.', 'error');
  }

  function handleApiError(error) {
    if (error?.code === 'UNAUTHORIZED' || /sesi|unauthorized/i.test(error?.message || '')) return handleFatalSessionError(error);
    toast(error?.message || 'Terjadi kesalahan. Silakan coba lagi.', 'error');
  }

  function togglePassword() { togglePasswordField('#password', '#togglePassword'); }
  function togglePasswordField(inputSelector, buttonSelector) {
    const input = $(inputSelector); const button = $(buttonSelector);
    if (!input || !button) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    const hidden = input.type === 'password';
    button.textContent = hidden ? 'Lihat' : 'Sembunyikan';
    button.setAttribute('aria-label', hidden ? 'Tampilkan password' : 'Sembunyikan password');
  }

  function clearLoginErrors() { $('#employeeIdError').textContent=''; $('#passwordError').textContent=''; }
  function clearRegisterErrors() { ['registerId','registerName','registerDepartment','registerLevel','registerPassword','registerPasswordConfirm','registerConsent'].forEach(id => { const el=$(`#${id}Error`); if(el) el.textContent=''; }); }
  function setButtonLoading(button, loading) { button.disabled=loading; $('.button-label',button)?.classList.toggle('hidden',loading); $('.spinner',button)?.classList.toggle('hidden',!loading); }
  function isAdmin() { return hasAdminArea(); }
  function firstName(name) { return String(name || 'Peserta').trim().split(/\s+/)[0]; }
  function initials(name) { return String(name||'U').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase(); }
  function readinessText(score, attempts) { if (!attempts) return 'Belum ada data'; if (score>=90) return 'Sangat siap'; if (score>=cfg.PASSING_SCORE) return 'Siap promosi'; if (score>=60) return 'Perlu penguatan'; return 'Perlu remedial'; }
  function grade(score) { score=Number(score)||0; if(score>=90)return'Excellent';if(score>=75)return'Promotion Ready';if(score>=60)return'Need Improvement';return'Remedial'; }
  function scoreClass(score) { return Number(score)>=75?'good':Number(score)>=60?'mid':'bad'; }
  function scorePill(score) { return `<span class="score-pill ${scoreClass(score)}">${Number(score)||0}</span>`; }
  function statusPill(text,score) { return `<span class="status-pill ${scoreClass(score)}">${escapeHtml(text||grade(score))}</span>`; }
  function resultRow(row) { return `<tr><td>${formatDate(row.date)}</td><td><strong>${escapeHtml(row.module)}</strong></td><td>${scorePill(row.score)}</td><td>${statusPill(row.grade,row.score)}</td></tr>`; }
  function emptyRow(span,text) { return `<tr><td colspan="${span}" class="empty-cell">${escapeHtml(text)}</td></tr>`; }
  function formatDate(value) { const d=new Date(value); return Number.isNaN(d.getTime())?'-':new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Jakarta'}).format(d); }
  function formatDuration(seconds) { seconds=Math.max(0,Number(seconds)||0); const m=Math.floor(seconds/60); const s=Math.floor(seconds%60); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
  function clamp(value,min,max) { return Math.min(max,Math.max(min,Number(value)||0)); }
  function capitalize(text) { return String(text).charAt(0).toUpperCase()+String(text).slice(1); }
  function shuffle(items) { const out=[...items]; for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];} return out; }
  function escapeHtml(value) { return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function escapeAttr(value) { return escapeHtml(value); }
  function csvCell(value) { const text=String(value??''); return /[",\r\n]/.test(text)?`"${text.replace(/"/g,'""')}"`:text; }
  function safeFilename(value) { return String(value||'data').replace(/[^a-z0-9_-]+/gi,'-'); }
  function dateStamp() { return new Date().toISOString().slice(0,10); }
  function debounce(fn,wait) { let timer; return (...args)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...args),wait);}; }
  function toast(message,type='') { const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;$('#toastRegion').appendChild(el);setTimeout(()=>el.remove(),3800); }
  function toggleTheme() { const dark=!document.body.classList.contains('dark');document.body.classList.toggle('dark',dark);localStorage.setItem('aeon_theme',dark?'dark':'light'); }
  function restoreTheme() { const preference=localStorage.getItem('aeon_theme');const dark=preference==='dark'||(!preference&&matchMedia('(prefers-color-scheme: dark)').matches);document.body.classList.toggle('dark',dark); }
})();