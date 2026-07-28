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
    pendingConfirm: null
  };

  const moduleDescriptions = {
    HORENSO: 'Pelaporan, informasi, dan konsultasi',
    JISEKI: 'Ownership dan tanggung jawab',
    KYO: 'Kesadaran diri dan kolaborasi',
    TWIJI: 'Job instruction dan OJT',
    DOUKIZUKE: 'Motivasi dan pengembangan',
    ALEC: 'Mendengar dan komunikasi efektif',
    '8 BASIC': 'Dasar perilaku dan standar kerja'
  };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    bindGlobalEvents();
    restoreTheme();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }
    const session = api.getSession();
    if (session?.token && session?.user) {
      state.user = session.user;
      loadApplication().catch(handleFatalSessionError);
    } else {
      showLogin();
    }
  }

  function bindGlobalEvents() {
    $('#loginForm').addEventListener('submit', handleLogin);
    $('#togglePassword').addEventListener('click', togglePassword);
    $('#logoutButton').addEventListener('click', confirmLogout);
    $('#themeToggle').addEventListener('click', toggleTheme);
    $('#startPracticeButton').addEventListener('click', () => navigate('practice'));
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
    $('#exportMyHistory').addEventListener('click', exportMyHistory);
    $('#exportAdminReport').addEventListener('click', exportAdminReport);
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
    try {
      const result = await api.login(id, password);
      state.user = result.user;
      await loadApplication();
      toast(`Selamat datang, ${state.user.name}.`, 'success');
    } catch (error) {
      $('#passwordError').textContent = error.message || 'Login gagal.';
      toast(error.message || 'Login gagal.', 'error');
    } finally { setButtonLoading($('#loginButton'), false); }
  }

  async function loadApplication() {
    await refreshBootstrap();
    configureUserUI();
    const requested = (location.hash.replace('#/', '') || 'dashboard').split('?')[0];
    const allowed = ['dashboard','practice','history','admin'];
    if (!allowed.includes(requested) || (requested === 'admin' && !isAdmin())) location.hash = '#/dashboard';
    else route();
  }

  async function refreshBootstrap() {
    const data = await api.bootstrap();
    state.bootstrap = data;
    state.user = data.user || state.user;
    renderDashboard();
    renderPractice();
    renderHistoryFilters();
    renderHistory();
  }

  function configureUserUI() {
    $('#headerUserName').textContent = state.user.name || 'Peserta';
    $('#headerUserRole').textContent = state.user.role || 'User';
    $('#userAvatar').textContent = initials(state.user.name || state.user.id);
    $$('.admin-only').forEach(el => el.classList.toggle('hidden', !isAdmin()));
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
    document.title = `Login · ${cfg.APP_NAME}`;
    setTimeout(() => $('#employeeId').focus(), 50);
  }

  function route() {
    if (!state.user) return showLogin();
    const routeName = (location.hash.replace('#/', '') || 'dashboard').split('?')[0];
    if (routeName === 'admin' && !isAdmin()) return navigate('dashboard');
    if (!['dashboard','practice','history','admin'].includes(routeName)) return navigate('dashboard');

    $('#loginView').classList.add('hidden');
    $('#quizView').classList.add('hidden');
    $('#resultView').classList.add('hidden');
    $('#dashboardView').classList.remove('hidden');
    $('#appHeader').classList.remove('hidden');
    $$('.page-section').forEach(section => section.classList.add('hidden'));
    $(`#${routeName}Page`).classList.remove('hidden');
    $$('[data-route-link]').forEach(link => link.classList.toggle('active', link.dataset.routeLink === routeName));
    document.title = `${capitalize(routeName)} · ${cfg.APP_NAME}`;
    if (routeName === 'admin') loadAdminDashboard();
    window.scrollTo({ top:0, behavior:'smooth' });
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
      <span class="big-icon">🎯</span><h3>${target.attempts ? 'Perkuat ' : 'Mulai dari '}${escapeHtml(target.module)}</h3>
      <p>${target.attempts ? `Nilai terbaik saat ini ${target.bestScore}. Pelajari ulang bagian yang belum dikuasai dan coba latihan baru.` : 'Modul ini belum pernah dikerjakan. Mulai latihan singkat untuk mengukur pemahaman.'}</p>
      <button class="button button-primary button-small" type="button" data-recommend-module="${escapeAttr(target.module)}">Latihan modul</button>` : '<p class="muted">Belum ada rekomendasi.</p>';
    $('[data-recommend-module]')?.addEventListener('click', event => { selectModule(event.currentTarget.dataset.recommendModule); navigate('practice'); });

    const latest = (data.results || []).slice(0, 3);
    $('#recentResultsBody').innerHTML = latest.length ? latest.map(resultRow).join('') : emptyRow(4, 'Belum ada hasil ujian.');
  }

  function renderPractice() {
    if (!state.bootstrap) return;
    const progressMap = Object.fromEntries((state.bootstrap.progress || []).map(item => [item.module, item]));
    $('#moduleCards').innerHTML = (state.bootstrap.modules || []).map(module => {
      const progress = progressMap[module.name] || {};
      return `<button class="module-card ${state.selectedModule === module.name ? 'selected' : ''}" type="button" data-module="${escapeAttr(module.name)}">
        <header><h3>${escapeHtml(module.name)}</h3><small>${Number(module.questionCount)||0} soal</small></header>
        <p>${escapeHtml(module.description || moduleDescriptions[module.name] || 'Materi promotion test')}</p>
        <p><strong>Nilai terbaik: ${Number(progress.bestScore)||0}</strong> · ${Number(progress.attempts)||0} percobaan</p>
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
    document.title = `${state.currentQuiz.module} · Ujian`;
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
    $('#nextQuestion').textContent = quiz.index === quiz.questions.length - 1 ? 'Selesaikan →' : 'Berikutnya →';
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
    $('#resultStatusIcon').textContent = passed ? '✓' : '!';
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
    document.title = `Hasil ${result.module} · ${cfg.APP_NAME}`;
    window.scrollTo(0,0);
  }

  function renderAnswerReview(review) {
    $('#answerReviewList').innerHTML = review.map(item => `
      <article class="review-item ${item.isCorrect ? 'correct' : 'incorrect'}">
        <h3>${item.number}. ${escapeHtml(item.question)}</h3>
        <p><strong>Jawaban Anda:</strong> ${escapeHtml(item.selectedText || 'Tidak dijawab')} ${item.isCorrect ? '✓' : '✕'}</p>
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

  async function loadAdminDashboard() {
    if (!isAdmin()) return;
    try {
      const data = await api.adminDashboard();
      state.adminData = data;
      $('#adminTotalUsers').textContent = data.summary?.totalUsers ?? 0;
      $('#adminTotalAttempts').textContent = data.summary?.totalAttempts ?? 0;
      $('#adminAverageScore').textContent = data.summary?.averageScore ?? 0;
      $('#adminRemedialCount').textContent = data.summary?.remedialCount ?? 0;
      renderAdminModuleChart(data.moduleStats || []);
      renderAdminRecommendation(data.moduleStats || []);
      renderAdminResults();
    } catch (error) { handleApiError(error); }
  }

  function renderAdminModuleChart(stats) {
    $('#adminModuleChart').innerHTML = stats.map(item => `
      <div class="bar-row"><span class="bar-label">${escapeHtml(item.module)}</span><div class="bar-track"><div class="bar-fill" style="width:${clamp(item.averageScore,0,100)}%"></div></div><strong>${Number(item.averageScore)||0}</strong></div>`).join('') || '<p class="muted">Belum ada data.</p>';
  }

  function renderAdminRecommendation(stats) {
    const active = stats.filter(item => item.attempts > 0).sort((a,b)=>a.averageScore-b.averageScore);
    const lowest = active[0];
    $('#adminRecommendation').innerHTML = lowest ? `
      <div class="recommendation-card"><span class="big-icon">📌</span><h3>${escapeHtml(lowest.module)}</h3><p>Rata-rata ${Number(lowest.averageScore)||0} dari ${Number(lowest.attempts)||0} percobaan. Prioritaskan refresh materi, diskusi kasus, dan remedial terarah.</p></div>` : '<p class="muted">Belum ada data evaluasi.</p>';
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
      await api.logout(); state.user=null; state.bootstrap=null; location.hash=''; showLogin();
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
    api.clearSession(); state.user=null; state.bootstrap=null; showLogin();
    toast(error.message || 'Sesi tidak valid. Silakan login kembali.', 'error');
  }

  function handleApiError(error) {
    if (error?.code === 'UNAUTHORIZED' || /sesi|unauthorized/i.test(error?.message || '')) return handleFatalSessionError(error);
    toast(error?.message || 'Terjadi kesalahan. Silakan coba lagi.', 'error');
  }

  function togglePassword() {
    const input = $('#password'); input.type = input.type === 'password' ? 'text' : 'password';
    $('#togglePassword').setAttribute('aria-label', input.type === 'password' ? 'Tampilkan password' : 'Sembunyikan password');
  }

  function clearLoginErrors() { $('#employeeIdError').textContent=''; $('#passwordError').textContent=''; }
  function setButtonLoading(button, loading) { button.disabled=loading; $('.button-label',button)?.classList.toggle('hidden',loading); $('.spinner',button)?.classList.toggle('hidden',!loading); }
  function isAdmin() { return String(state.user?.role || '').toLowerCase() === 'admin'; }
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
