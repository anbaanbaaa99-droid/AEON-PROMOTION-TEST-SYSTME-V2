(function () {
  'use strict';

  const cfg = window.APP_CONFIG;
  const isConfigured = /^https:\/\/script\.google\.com\/.+\/exec(?:\?.*)?$/i.test(cfg.API_URL || '');
  const demoMode = !isConfigured && cfg.ENABLE_DEMO_WHEN_UNCONFIGURED;
  const SESSION_KEY = 'aeon_session_v2';
  const DEMO_RESULTS_KEY = 'aeon_demo_results_v2';
  const DEMO_EXAMS_KEY = 'aeon_demo_exams_v2';

  const demoUsers = [
    { id: '001', name: 'Demo User', department: 'Store Operation', level: 'JO', password: '12345', role: 'User', active: true },
    { id: 'ADMIN', name: 'Trainer Demo', department: 'Training', level: 'Admin', password: 'admin123', role: 'Admin', active: true }
  ];

  const demoQuestions = [
    q('HOR-01','HORENSO','Easy','HoRenSo terdiri dari?',['Hokoku, Renraku, Sodan','Plan, Do, Check, Action','Jiseki, KYO, OJT','Safety, Quality, Delivery'],'A','HoRenSo merupakan singkatan dari Hokoku (lapor), Renraku (menghubungi), dan Sodan (berkonsultasi).'),
    q('HOR-02','HORENSO','Medium','Ketika pekerjaan berpotensi terlambat, tindakan paling tepat adalah…',['Menunggu sampai masalah selesai','Melakukan Hokoku secepatnya','Menyalahkan rekan kerja','Mengubah target sendiri'],'B','Hambatan dan potensi keterlambatan perlu dilaporkan lebih awal agar atasan dapat membantu mengambil keputusan.'),
    q('HOR-03','HORENSO','Medium','Informasi perubahan jadwal yang harus diketahui rekan kerja termasuk…',['Hokoku','Renraku','Sodan','Kaizen'],'B','Renraku adalah menyampaikan informasi yang dibutuhkan pihak terkait secara tepat dan jelas.'),
    q('HOR-04','HORENSO','Hard','Sebelum mengambil keputusan pada masalah di luar kewenangan, peserta sebaiknya…',['Mengabaikan masalah','Membuat keputusan sepihak','Melakukan Sodan kepada pihak berwenang','Menunggu pelanggan mengeluh'],'C','Sodan membantu memperoleh arahan sebelum keputusan penting dibuat.'),
    q('HOR-05','HORENSO','Easy','Laporan kerja yang baik seharusnya…',['Panjang dan banyak istilah','Faktual, ringkas, dan tepat waktu','Hanya berisi keberhasilan','Disampaikan saat akhir bulan'],'B','Laporan efektif berfokus pada fakta, dampak, tindakan, dan kebutuhan bantuan.'),

    q('JIS-01','JISEKI','Easy','Jiseki paling dekat dengan sikap…',['Ownership dan tanggung jawab','Menunggu instruksi terus-menerus','Menghindari risiko apa pun','Mengutamakan alasan'],'A','Jiseki menekankan tanggung jawab pribadi terhadap tugas, masalah, dan hasil.'),
    q('JIS-02','JISEKI','Medium','Saat menemukan kesalahan sendiri, perilaku Jiseki adalah…',['Menutupinya','Mengakui, memperbaiki, dan mencegah pengulangan','Menyalahkan sistem','Menunggu audit'],'B','Ownership terlihat dari keberanian mengakui fakta, melakukan koreksi, dan membuat pencegahan.'),
    q('JIS-03','JISEKI','Hard','Tindakan terbaik setelah masalah terselesaikan adalah…',['Melupakan kejadian','Mencari siapa yang salah','Mendokumentasikan akar masalah dan tindakan pencegahan','Mengurangi komunikasi'],'C','Penyelesaian yang matang mencakup pembelajaran dan pencegahan agar masalah tidak berulang.'),
    q('JIS-04','JISEKI','Medium','Kalimat yang mencerminkan ownership adalah…',['Itu bukan bagian saya','Saya cek faktanya dan koordinasikan solusinya','Tunggu saja instruksi','Yang penting tugas saya selesai'],'B','Ownership berarti aktif memahami dampak dan mengawal penyelesaian, bukan sekadar batas tugas pribadi.'),
    q('JIS-05','JISEKI','Easy','Dalam Jiseki, fokus utama ketika terjadi masalah adalah…',['Alasan','Solusi dan tanggung jawab','Popularitas','Kecepatan tanpa kualitas'],'B','Fokus utama adalah mengambil tanggung jawab dan mengarahkan energi pada solusi.'),

    q('KYO-01','KYO','Easy','Johari Window membantu seseorang memahami…',['Hubungan diri dengan orang lain','Target penjualan harian','Layout gudang','Perhitungan stok'],'A','Johari Window digunakan untuk meningkatkan kesadaran diri dan keterbukaan dalam hubungan interpersonal.'),
    q('KYO-02','KYO','Medium','Cara memperluas area terbuka pada Johari Window adalah…',['Menghindari umpan balik','Berbagi informasi relevan dan menerima umpan balik','Menutup komunikasi','Hanya berbicara kepada atasan'],'B','Self-disclosure dan feedback yang sehat memperluas area yang diketahui diri sendiri dan orang lain.'),
    q('KYO-03','KYO','Medium','Saat menerima feedback, respons yang konstruktif adalah…',['Langsung membantah','Mendengarkan, klarifikasi, lalu menentukan perbaikan','Menyebarkan kesalahan orang lain','Mengabaikan pemberi feedback'],'B','Feedback perlu diterima secara terbuka, diperjelas faktanya, dan diterjemahkan menjadi tindakan.'),
    q('KYO-04','KYO','Hard','Perbedaan sudut pandang dalam tim paling baik diselesaikan dengan…',['Komunikasi berbasis fakta dan tujuan bersama','Voting tanpa diskusi','Menghindari orang yang berbeda','Menunggu konflik membesar'],'A','Fakta dan tujuan bersama membantu tim memisahkan persoalan dari individu.'),
    q('KYO-05','KYO','Easy','Empati dalam komunikasi berarti…',['Selalu setuju','Memahami perasaan dan sudut pandang orang lain','Mengambil alih semua tugas','Menghindari keputusan'],'B','Empati adalah upaya memahami perspektif orang lain tanpa harus selalu menyetujui.'),

    q('TWI-01','TWIJI','Easy','Dalam Job Instruction, tahap pertama adalah…',['Persiapkan peserta','Uji peserta','Tinggalkan peserta','Nilai hasil akhir saja'],'A','Instruktur perlu mempersiapkan peserta agar siap dan tertarik mempelajari pekerjaan.'),
    q('TWI-02','TWIJI','Medium','Saat mendemonstrasikan pekerjaan, instruktur perlu menjelaskan…',['Langkah penting, key point, dan alasannya','Hanya hasil akhir','Riwayat perusahaan','Semua teori tanpa praktik'],'A','Job Instruction menguraikan langkah penting, titik kunci, dan alasan setiap titik kunci.'),
    q('TWI-03','TWIJI','Medium','Setelah demonstrasi, peserta sebaiknya…',['Langsung bekerja sendiri tanpa pengawasan','Mencoba kembali sambil menjelaskan langkahnya','Membaca ulang tanpa praktik','Menghafal nama alat'],'B','Praktik ulang dan penjelasan peserta membantu memastikan pemahaman proses.'),
    q('TWI-04','TWIJI','Hard','Jika peserta berulang kali salah pada satu langkah, instruktur harus…',['Memarahi peserta','Mengulang penjelasan titik kunci dan alasan dengan cara berbeda','Menghapus langkah tersebut','Menurunkan standar kerja'],'B','Instruktur perlu menyesuaikan penjelasan dan memastikan key point dipahami.'),
    q('TWI-05','TWIJI','Easy','Tujuan OJT terstruktur adalah…',['Mempercepat tanpa standar','Membangun kemampuan sesuai standar kerja','Mengurangi komunikasi','Menggantikan semua SOP'],'B','OJT terstruktur membantu peserta mampu melakukan pekerjaan dengan benar, aman, dan konsisten.'),

    q('DOU-01','DOUKIZUKE','Easy','Motivasi intrinsik berasal dari…',['Ancaman','Keinginan berkembang dari dalam diri','Hadiah semata','Tekanan rekan kerja'],'B','Motivasi intrinsik muncul dari minat, makna, dan dorongan berkembang dalam diri.'),
    q('DOU-02','DOUKIZUKE','Medium','Pemberian apresiasi yang efektif sebaiknya…',['Spesifik pada perilaku atau hasil yang baik','Umum dan tanpa contoh','Hanya diberikan setahun sekali','Diberikan hanya kepada orang tertentu'],'A','Apresiasi yang spesifik membantu orang memahami perilaku positif yang perlu dipertahankan.'),
    q('DOU-03','DOUKIZUKE','Medium','Untuk memotivasi anggota tim, atasan perlu memahami…',['Kebutuhan dan karakter setiap individu','Satu metode untuk semua orang','Hanya target angka','Hanya kesalahan masa lalu'],'A','Pemicu motivasi dapat berbeda, sehingga pendekatan perlu disesuaikan secara adil.'),
    q('DOU-04','DOUKIZUKE','Hard','Delegasi yang dapat meningkatkan motivasi harus disertai…',['Target tidak jelas','Wewenang, ekspektasi, dukungan, dan feedback','Kontrol setiap menit','Ancaman hukuman'],'B','Delegasi yang baik memberi kejelasan, kepercayaan, sumber daya, dan ruang belajar.'),
    q('DOU-05','DOUKIZUKE','Easy','Tujuan feedback positif adalah…',['Membuat orang bergantung pada pujian','Memperkuat perilaku kerja yang efektif','Menghindari evaluasi','Mengurangi tanggung jawab'],'B','Feedback positif menguatkan perilaku yang sesuai standar dan tujuan tim.'),

    q('ALE-01','ALEC','Easy','Active listening membantu…',['Membangun pemahaman dan kepercayaan','Mempercepat memotong pembicaraan','Mengurangi informasi','Menghindari pertanyaan'],'A','Mendengar aktif menunjukkan perhatian dan membantu menangkap pesan secara akurat.'),
    q('ALE-02','ALEC','Medium','Contoh pertanyaan terbuka adalah…',['Apakah Anda setuju?','Apa kendala utama yang Anda alami?','Benar atau salah?','Sudah selesai?'],'B','Pertanyaan terbuka mendorong lawan bicara menjelaskan situasi lebih lengkap.'),
    q('ALE-03','ALEC','Medium','Paraphrasing digunakan untuk…',['Menunjukkan bahwa kita memahami isi pesan','Mengganti topik','Memberi penilaian cepat','Mengakhiri percakapan'],'A','Paraphrasing mengulang inti pesan dengan kata sendiri untuk mengonfirmasi pemahaman.'),
    q('ALE-04','ALEC','Hard','Saat menangani keluhan pelanggan, urutan paling tepat adalah…',['Dengarkan, klarifikasi, empati, tawarkan solusi, konfirmasi','Bantah, jelaskan aturan, akhiri','Berikan janji tanpa cek fakta','Alihkan ke pihak lain tanpa penjelasan'],'A','Penanganan keluhan perlu dimulai dengan mendengar dan memahami fakta sebelum menawarkan solusi.'),
    q('ALE-05','ALEC','Easy','Kontak mata dan bahasa tubuh terbuka berfungsi untuk…',['Mendukung komunikasi yang penuh perhatian','Menekan lawan bicara','Menggantikan semua kata','Menghindari empati'],'A','Sinyal nonverbal yang tepat membantu menunjukkan perhatian dan keterbukaan.'),

    q('BAS-01','8 BASIC','Easy','Standar kerja dibuat terutama untuk…',['Menjaga proses aman, konsisten, dan berkualitas','Membatasi semua ide','Mengurangi tanggung jawab','Menggantikan komunikasi'],'A','Standar menjadi dasar pelaksanaan kerja yang konsisten serta perbaikan berkelanjutan.'),
    q('BAS-02','8 BASIC','Medium','Saat menemukan kondisi tidak aman, tindakan pertama adalah…',['Melanjutkan pekerjaan','Mengamankan kondisi dan melaporkan sesuai prosedur','Merekam untuk media sosial','Menunggu pergantian shift'],'B','Keselamatan didahulukan dengan menghentikan atau mengamankan kondisi dan melakukan pelaporan.'),
    q('BAS-03','8 BASIC','Medium','5S membantu area kerja menjadi…',['Teratur, bersih, dan mudah dikendalikan','Lebih penuh barang','Bebas standar','Tergantung kebiasaan individu'],'A','5S membangun lingkungan kerja yang tertata, bersih, terpelihara, dan disiplin.'),
    q('BAS-04','8 BASIC','Hard','Perbaikan kecil yang dilakukan terus-menerus disebut…',['Kaizen','Sodan','Audit','Rotasi'],'A','Kaizen adalah perbaikan berkelanjutan yang melibatkan kebiasaan mencari cara kerja lebih baik.'),
    q('BAS-05','8 BASIC','Easy','Pelayanan yang baik harus berorientasi pada…',['Kebutuhan pelanggan dan standar perusahaan','Kenyamanan petugas saja','Kecepatan tanpa akurasi','Janji tanpa kepastian'],'A','Pelayanan berkualitas menyeimbangkan kebutuhan pelanggan dengan standar dan kemampuan perusahaan.')
  ];

  function q(id, module, level, text, choices, answer, explanation) {
    return { id, module, level, type: 'PG', text, options: choices.map((value, i) => ({ key: String.fromCharCode(65 + i), text: value })), answer, explanation };
  }

  function getStoredSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (_) { return null; }
  }

  function setStoredSession(session) {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  }

  async function request(action, payload = {}, options = {}) {
    if (demoMode) return demoRequest(action, payload);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || cfg.REQUEST_TIMEOUT_MS);
    const session = getStoredSession();
    try {
      const response = await fetch(cfg.API_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, token: session?.token || '', payload }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || data.success === false) {
        const error = new Error(data?.message || 'Permintaan gagal diproses.');
        error.code = data?.code || 'API_ERROR';
        throw error;
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Koneksi ke server terlalu lama. Silakan coba lagi.');
      throw error;
    } finally { clearTimeout(timeout); }
  }

  async function login(id, password) {
    const result = await request('login', { id: String(id).trim(), password: String(password) });
    setStoredSession({ token: result.token, user: result.user, expiresAt: result.expiresAt });
    return result;
  }

  async function logout() {
    try { await request('logout'); } catch (_) { /* clear local session anyway */ }
    setStoredSession(null);
  }

  function readDemoResults() {
    try {
      const stored = JSON.parse(localStorage.getItem(DEMO_RESULTS_KEY) || 'null');
      if (Array.isArray(stored)) return stored;
    } catch (_) { /* seed below */ }
    const seed = [
      demoResult('D-001','2026-07-21T08:10:00.000Z','001','Demo User','Store Operation','HORENSO',80,4,5,410),
      demoResult('D-002','2026-07-23T09:15:00.000Z','001','Demo User','Store Operation','JISEKI',60,3,5,522),
      demoResult('D-003','2026-07-25T07:22:00.000Z','001','Demo User','Store Operation','KYO',80,4,5,385),
      demoResult('D-004','2026-07-24T06:18:00.000Z','002','Siti Rahma','Fresh Food','Staff','TWIJI',90,9,10,820),
      demoResult('D-005','2026-07-24T10:30:00.000Z','003','Budi Santoso','Customer Service','ALEC',70,7,10,910),
      demoResult('D-006','2026-07-26T08:00:00.000Z','004','Rina Putri','Store Operation','DOUKIZUKE',55,11,20,1300)
    ];
    localStorage.setItem(DEMO_RESULTS_KEY, JSON.stringify(seed));
    return seed;
  }

  function demoResult(attemptId, date, id, name, department, module, score, correct, total, durationSec) {
    return { attemptId, date, id, name, department, module, score, correct, total, durationSec, grade: grade(score) };
  }

  function grade(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Promotion Ready';
    if (score >= 60) return 'Need Improvement';
    return 'Remedial';
  }

  function demoSessionUser() {
    const session = getStoredSession();
    if (!session?.user) throw authError();
    return session.user;
  }

  function authError() {
    const e = new Error('Sesi berakhir. Silakan login kembali.'); e.code = 'UNAUTHORIZED'; return e;
  }

  function randomToken(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
  }

  function shuffle(array) {
    const output = array.slice();
    for (let i = output.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [output[i], output[j]] = [output[j], output[i]];
    }
    return output;
  }

  function moduleList() {
    return [...new Set(demoQuestions.map(item => item.module))].map(name => ({
      name,
      questionCount: demoQuestions.filter(item => item.module === name).length,
      description: ({HORENSO:'Pelaporan, informasi, dan konsultasi',JISEKI:'Ownership dan tanggung jawab',KYO:'Kesadaran diri dan kolaborasi',TWIJI:'Job instruction dan OJT',DOUKIZUKE:'Motivasi dan pengembangan',ALEC:'Mendengar dan komunikasi efektif','8 BASIC':'Dasar perilaku dan standar kerja'})[name] || 'Materi promotion test'
    }));
  }

  function userResults(userId) { return readDemoResults().filter(item => String(item.id) === String(userId)); }

  function createProgress(results) {
    return moduleList().map(module => {
      const subset = results.filter(item => item.module === module.name);
      const scores = subset.map(item => Number(item.score) || 0);
      const bestScore = scores.length ? Math.max(...scores) : 0;
      const averageScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0) / scores.length) : 0;
      return { module: module.name, attempts: subset.length, bestScore, averageScore, lastScore: scores.at(-1) || 0, status: bestScore >= cfg.PASSING_SCORE ? 'Passed' : subset.length ? 'Remedial' : 'Not Started' };
    });
  }

  async function demoRequest(action, payload) {
    await new Promise(resolve => setTimeout(resolve, 180));
    if (action === 'health') return { success: true, mode: 'demo', version: '2.0.0' };
    if (action === 'login') {
      const user = demoUsers.find(item => item.id.toLowerCase() === String(payload.id).toLowerCase() && item.password === payload.password && item.active);
      if (!user) { const e = new Error('Employee ID atau password salah.'); e.code = 'INVALID_CREDENTIALS'; throw e; }
      const safeUser = { id: user.id, name: user.name, department: user.department, level: user.level, role: user.role };
      return { success: true, token: randomToken('demo-session'), user: safeUser, expiresAt: Date.now() + 6 * 60 * 60 * 1000 };
    }
    if (action === 'logout') return { success: true };

    const user = demoSessionUser();
    if (action === 'bootstrap') {
      const results = userResults(user.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
      const progress = createProgress(results);
      const scores = results.map(item => item.score);
      return { success:true, user, modules:moduleList(), progress, results, summary:{ attempts:results.length, averageScore:scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0, bestScore:scores.length?Math.max(...scores):0 } };
    }
    if (action === 'startQuiz') {
      const module = String(payload.module || '').toUpperCase();
      const available = demoQuestions.filter(item => item.module === module);
      if (!available.length) throw new Error('Modul tidak ditemukan atau belum memiliki soal aktif.');
      const count = Math.min(Math.max(Number(payload.count) || 10, 1), available.length);
      const quizId = randomToken('demo-quiz');
      const picked = shuffle(available).slice(0, count);
      const exams = JSON.parse(sessionStorage.getItem(DEMO_EXAMS_KEY) || '{}');
      exams[quizId] = { userId:user.id, module, startedAt:Date.now(), durationSec:Number(payload.durationSec)||1200, questions:picked };
      sessionStorage.setItem(DEMO_EXAMS_KEY, JSON.stringify(exams));
      return { success:true, quizId, module, durationSec:Number(payload.durationSec)||1200, questions:picked.map(({answer,explanation,...safe})=>safe) };
    }
    if (action === 'submitQuiz') {
      const exams = JSON.parse(sessionStorage.getItem(DEMO_EXAMS_KEY) || '{}');
      const exam = exams[payload.quizId];
      if (!exam || exam.userId !== user.id) throw new Error('Sesi ujian tidak ditemukan atau sudah berakhir.');
      const answers = payload.answers || {};
      let correct = 0;
      const review = exam.questions.map((question, index) => {
        const selected = String(answers[question.id] || '');
        const isCorrect = selected === question.answer;
        if (isCorrect) correct++;
        return { number:index+1, id:question.id, question:question.text, selectedAnswer:selected, selectedText:question.options.find(o=>o.key===selected)?.text || 'Tidak dijawab', correctAnswer:question.answer, correctText:question.options.find(o=>o.key===question.answer)?.text || '', isCorrect, explanation:question.explanation };
      });
      const total = exam.questions.length;
      const score = total ? Math.round(correct / total * 100) : 0;
      const durationSec = Math.max(0, Math.min(Number(payload.durationSec)||Math.floor((Date.now()-exam.startedAt)/1000), exam.durationSec));
      const result = demoResult(randomToken('D'),new Date().toISOString(),user.id,user.name,user.department,exam.module,score,correct,total,durationSec);
      const results = readDemoResults(); results.push(result); localStorage.setItem(DEMO_RESULTS_KEY, JSON.stringify(results));
      delete exams[payload.quizId]; sessionStorage.setItem(DEMO_EXAMS_KEY, JSON.stringify(exams));
      return { success:true, result:{...result, review, recommendation:score>=cfg.PASSING_SCORE?'Pertahankan hasil dan lanjutkan ke modul berikutnya.':`Ulangi materi ${exam.module}, pelajari pembahasan, lalu kerjakan remedial.`} };
    }
    if (action === 'adminDashboard') {
      if (String(user.role).toLowerCase() !== 'admin') throw authError();
      const results = readDemoResults().sort((a,b)=>new Date(b.date)-new Date(a.date));
      const participantIds = [...new Set(results.map(item=>item.id).filter(id=>id!=='ADMIN'))];
      const avg = results.length ? Math.round(results.reduce((s,r)=>s+Number(r.score),0)/results.length) : 0;
      const moduleStats = moduleList().map(module=>{
        const rows=results.filter(r=>r.module===module.name); return {module:module.name, attempts:rows.length, averageScore:rows.length?Math.round(rows.reduce((s,r)=>s+Number(r.score),0)/rows.length):0};
      });
      return { success:true, summary:{totalUsers:participantIds.length,totalAttempts:results.length,averageScore:avg,remedialCount:results.filter(r=>r.score<cfg.PASSING_SCORE).length},moduleStats,results };
    }
    throw new Error(`Aksi demo tidak dikenal: ${action}`);
  }

  window.AEON_API = Object.freeze({
    demoMode,
    isConfigured,
    getSession:getStoredSession,
    login,
    logout,
    bootstrap:()=>request('bootstrap'),
    startQuiz:payload=>request('startQuiz',payload),
    submitQuiz:payload=>request('submitQuiz',payload,{timeout:45000}),
    adminDashboard:()=>request('adminDashboard'),
    clearSession:()=>setStoredSession(null)
  });
})();
