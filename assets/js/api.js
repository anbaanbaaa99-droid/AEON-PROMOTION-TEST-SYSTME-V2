(function () {
  'use strict';

  const cfg = window.APP_CONFIG;
  const isConfigured = /^https:\/\/script\.google\.com\/.+\/exec(?:\?.*)?$/i.test(cfg.API_URL || '');
  const demoMode = !isConfigured && cfg.ENABLE_DEMO_WHEN_UNCONFIGURED;
  const SESSION_KEY = 'aeon_session_v51';
  const LEGACY_SESSION_KEYS = ['aeon_session_v5','aeon_session_v4','aeon_session_v3'];
  let memorySession = null;
  const DEMO_RESULTS_KEY = 'aeon_demo_results_v5';
  const DEMO_EXAMS_KEY = 'aeon_demo_exams_v5';
  const DEMO_USERS_KEY = 'aeon_demo_users_v5';
  const DEMO_READING_KEY = 'aeon_demo_reading_v5';

  const demoUserSeed = [
    { id:'001', name:'Demo User', department:'Store Operation', level:'JO', password:'12345', role:'User', status:'approved', active:true, createdAt:'2026-07-01T02:00:00.000Z' },
    { id:'002', name:'Siti Rahma', department:'Fresh Food', level:'Staff', password:'12345', role:'User', status:'approved', active:true, createdAt:'2026-07-02T02:00:00.000Z' },
    { id:'003', name:'Budi Santoso', department:'Customer Service', level:'Staff', password:'12345', role:'User', status:'approved', active:true, createdAt:'2026-07-03T02:00:00.000Z' },
    { id:'004', name:'Rina Putri', department:'Store Operation', level:'Staff', password:'12345', role:'User', status:'approved', active:true, createdAt:'2026-07-04T02:00:00.000Z' },
    { id:'ADMIN', name:'Trainer Demo', department:'Training', level:'Admin', password:'admin123', role:'Admin', status:'approved', active:true, createdAt:'2026-07-01T01:00:00.000Z' }
  ];

  const demoModules = [{"name":"HORENSO","title":"HORENSO - Lancar Tanpa Hambatan","summary":"Komunikasi kerja melalui Hokoku, Renraku, dan Sodan, mulai dari menerima instruksi, 5W2H, timing laporan, hingga penerapan dalam PDCA.","description":"Pelaporan, penyampaian informasi, konsultasi, dan PDCA","readingMinutes":12,"pdfUrl":"assets/modules/horenso.pdf","sections":[{"title":"Dasar komunikasi dan menerima instruksi","body":"Komunikasi kerja dimulai dari kemampuan mendengar, merespons, dan menerima instruksi dengan benar. Saat menerima instruksi, siapkan memo, dengarkan sampai selesai, catat hal penting, rangkum kembali, tanyakan hal yang belum jelas, dan pastikan prioritas pekerjaan.","bullets":["Instruksi yang baik perlu jelas dan dapat dipahami.","Gunakan 5W2H untuk melengkapi informasi.","Konfirmasi ulang mencegah perbedaan pemahaman."],"sourcePages":"12-20"},{"title":"Hokoku - melaporkan","body":"Hokoku adalah melaporkan progres atau hasil kepada atasan/senior yang memberikan instruksi. Laporan diperlukan ketika pekerjaan berhenti, berpotensi terlambat, terjadi kesalahan atau masalah, kondisi berubah besar, maupun secara berkala pada pekerjaan panjang.","bullets":["Bad news dilaporkan lebih dulu.","Mulai dari kesimpulan, lalu alasan/proses/progres.","Pisahkan fakta, opini, dan asumsi.","Gunakan dokumen atau data untuk laporan yang kompleks."],"sourcePages":"21-26"},{"title":"Renraku - menyampaikan informasi","body":"Renraku memastikan informasi yang diperlukan sampai kepada pihak yang berkepentingan. Materi menekankan penggunaan 5W2H dan pentingnya kebenaran, ketepatan, timing, media komunikasi, serta cakupan penerima.","bullets":["5W2H: Who, What, Where, When, Why, How, How Much.","Dengarkan informasi sampai selesai dan catat poin penting.","Informasi kompleks harus disampaikan sesederhana mungkin."],"sourcePages":"31-35"},{"title":"Sodan - konsultasi","body":"Sodan dilakukan ketika ada pertanyaan, hambatan, atau kebutuhan pertimbangan. Konsultasi tidak terbatas pada atasan langsung; dapat juga kepada rekan berpengalaman atau pihak yang menguasai bidangnya.","bullets":["Siapkan usulan atau proposal sebelum berkonsultasi.","Pilih orang yang tepat untuk diajak konsultasi.","Perhatikan kondisi dan waktu pihak yang diajak konsultasi."],"sourcePages":"38-39"},{"title":"HORENSO dalam PDCA","body":"Plan-Do-Check-Action berjalan sebagai siklus. Plan dibantu 5W2H, pada Do progres dan bad news perlu segera dilaporkan, sementara Check dan Action dipakai untuk melihat gap, memperbaiki, dan melaporkan hasil pembelajaran.","bullets":["Plan: tetapkan rencana dengan jelas.","Do: jalankan dan lakukan HORENSO sepanjang proses.","Check: bandingkan hasil dengan rencana.","Action: lakukan perbaikan dan ulangi siklus."],"sourcePages":"40-45"}]},{"name":"JISEKI","title":"JISEKI - Bekerja Dengan Ownership","summary":"Membangun Toujisha Ishiki dan Jiseki: memandang masalah sebagai tanggung jawab sendiri, bertindak proaktif, dan menghindari pola Taseki.","description":"Ownership, tanggung jawab, dan penyelesaian masalah proaktif","readingMinutes":10,"pdfUrl":"assets/modules/jiseki.pdf","sections":[{"title":"Dari HORENSO menuju JISEKI","body":"JISEKI melanjutkan fondasi komunikasi HORENSO menuju pola pikir ownership. Toujisha Ishiki adalah kesadaran bahwa diri sendiri terlibat sebagai pihak utama dalam persoalan yang dihadapi.","bullets":["Komunikasi yang jelas mendukung kolaborasi.","Ownership membuat seseorang tidak hanya menunggu pihak lain.","Masalah dipahami sebagai kesempatan bertindak dan belajar."],"sourcePages":"5-10"},{"title":"Jiseki dan Taseki","body":"Jiseki berarti berpikir dan bertindak dengan menempatkan diri sebagai orang yang bertanggung jawab. Kebalikannya, Taseki adalah mengalihkan tanggung jawab kepada orang lain atau keadaan.","bullets":["Jiseki = mindset sekaligus tindakan.","Taseki membuat fokus berpindah dari solusi ke alasan atau pihak lain.","Ownership terlihat dari apa yang dilakukan setelah masalah ditemukan."],"sourcePages":"13-16"},{"title":"Respons ownership dalam situasi kerja","body":"Ketika belum diajari, cari referensi dan bertanya; saat orang lain tidak membantu, coba dahulu dan perbaiki komunikasi; jika kekurangan waktu atau tenaga, atur prioritas dan sederhanakan proses; bila lingkungan tidak tertata, mulai dari diri sendiri sebagai contoh.","bullets":["Belajar proaktif saat belum tahu.","Cari alternatif ketika kolaborasi terhambat.","Mulai perbaikan dari hal yang bisa dikendalikan sendiri."],"sourcePages":"16-17"},{"title":"Dampak pola pikir","body":"Taseki dapat membuat masalah tidak selesai, kualitas stagnan, kepuasan pelanggan gagal tercapai, dan pertumbuhan diri terhambat. Jiseki mendorong penyelesaian lebih cepat, peningkatan kualitas, kepuasan pelanggan, dan pertumbuhan diri.","bullets":["Pilih tindakan yang mendekatkan masalah pada penyelesaian.","Jangan berhenti pada pembenaran diri.","Gunakan hasil penyelesaian sebagai bahan pertumbuhan."],"sourcePages":"18-20"},{"title":"Empat pola pikir saat menghadapi masalah","body":"Materi membedakan menghindari masalah, menyangkal tanggung jawab, membenarkan diri, dan mengambil tanggung jawab. Pola keempat adalah Jiseki: mengakui posisi diri dan bergerak proaktif mencari solusi.","bullets":["Kasus komplain menuntut pengumpulan fakta, bukan menghindar.","Ownership membuat pekerjaan biasa menjadi peluang perbaikan.","Toujisha Ishiki adalah kesadaran terlibat; Jiseki menerjemahkannya menjadi tindakan."],"sourcePages":"20-24"}]},{"name":"KYO","title":"K.Y.O. - Know Yourself and Others","summary":"Memahami diri dan orang lain melalui Johari Window dan Egogram/PAC agar komunikasi lebih efektif, profesional, dan sesuai situasi.","description":"Johari Window, Egogram, ego state, dan komunikasi adaptif","readingMinutes":12,"pdfUrl":"assets/modules/kyo.pdf","sections":[{"title":"Tujuan KYO","body":"KYO membantu memahami karakteristik diri sendiri dan orang lain agar komunikasi lebih lancar, efektif, profesional, serta menciptakan lingkungan kerja yang kondusif. Agenda utamanya mencakup Johari Window, Egogram, dan penyesuaian perilaku.","bullets":["Feedback dan self-disclosure menjadi alat penting.","Pemahaman diri membantu memilih respons yang sesuai situasi.","Tujuan akhirnya adalah kolaborasi kerja yang lebih sehat."],"sourcePages":"2-3"},{"title":"Johari Window","body":"Johari Window dikembangkan Joseph Luft dan Harry Ingham. Empat area adalah Open, Blind, Hidden, dan Unknown. Kondisi ideal memperbesar Open Area agar persepsi diri dan orang lain lebih selaras.","bullets":["Open: diketahui diri sendiri dan orang lain.","Blind: diketahui orang lain tetapi tidak disadari diri sendiri.","Hidden: diketahui diri sendiri tetapi tidak diketahui orang lain.","Unknown: belum diketahui keduanya."],"sourcePages":"8-10"},{"title":"Memperluas Open Area","body":"Open Area diperluas melalui self-disclosure dan feedback. Blind Area dapat diperkecil dengan menerima feedback dan refleksi, sedangkan Unknown Area dapat dieksplorasi melalui tantangan baru, pembelajaran, dan lingkungan suportif.","bullets":["Self-disclosure harus relevan dan tepat.","Feedback jujur membantu menemukan blind spot.","Pengalaman baru dapat mengungkap potensi yang belum diketahui."],"sourcePages":"11-16"},{"title":"Egogram dan PAC","body":"Transactional Analysis menggunakan tiga ego state: Parent, Adult, dan Child. Parent terdiri dari Critical Parent dan Nurturing Parent; Child antara lain Free Child dan Adapted Child; Adult berfokus pada fakta, logika, dan objektivitas.","bullets":["CP berguna untuk disiplin/standar tetapi dapat menjadi terlalu menghakimi.","NP mendukung dan berempati tetapi bisa terlalu melindungi.","FC mendukung kreativitas; AC mendukung adaptasi.","Adult paling ideal untuk komunikasi kerja yang objektif."],"sourcePages":"18-22"},{"title":"Menyesuaikan komunikasi","body":"Komunikasi kerja ideal adalah Adult-Adult. Ketika lawan bicara menggunakan ego state lain, respons dapat disesuaikan sementara lalu diarahkan kembali ke percakapan yang faktual dan dewasa.","bullets":["Ego state lain bukan berarti buruk; semuanya punya fungsi.","Observe, Understand, Adjust menjadi pendekatan memahami orang lain.","Kesadaran diri membantu berkontribusi dan mencapai hal baru."],"sourcePages":"27-33"}]},{"name":"TWIJI","title":"TWIJI - Training Within Industry Job Instruction","summary":"Dasar pendidikan tim, OJT, Job Breakdown Sheet, dan langkah mengajarkan pekerjaan secara terstruktur di tempat kerja.","description":"OJT, Job Breakdown, dan cara mengajarkan pekerjaan","readingMinutes":13,"pdfUrl":"assets/modules/twiji.pdf","sections":[{"title":"Mengapa edukasi penting","body":"Modul menempatkan pendidikan sebagai bagian penting dari kepemimpinan dan pengembangan karyawan. Metode pengembangan mencakup OJT, Off-JT, dan Self Development.","bullets":["Pemimpin bertanggung jawab membantu anggota tim berkembang.","Metode belajar dipilih sesuai kebutuhan pekerjaan.","OJT menghubungkan pembelajaran langsung dengan pekerjaan."],"sourcePages":"2-14"},{"title":"Prinsip OJT","body":"OJT dilakukan oleh atasan langsung di area kerja, saat bekerja, secara terencana dan berkelanjutan. Kerangkanya dapat dipikirkan dengan Who, Whom, What, Where, When, Why, dan How.","bullets":["Who: direct boss.","Where: tempat pekerjaan dilakukan.","Gunakan praktik, diskusi, dan tanya jawab."],"sourcePages":"19-20"},{"title":"Enam langkah OJT","body":"Urutan OJT dimulai dengan memahami level yang diharapkan, menemukan poin edukasi, membuat rencana, menjalankan edukasi, memastikan hasil, lalu mengulang atau memberi edukasi tambahan bila perlu.","bullets":["Tetapkan target kemampuan yang jelas.","Pantau progres dan berikan feedback.","Review skill secara periodik dan lakukan perbaikan terus-menerus."],"sourcePages":"21-25"},{"title":"Standar dan Job Breakdown Sheet","body":"OJT membutuhkan standar seperti SOP/guideline dan Job Breakdown Sheet. Breakdown mendokumentasikan urutan pekerjaan, langkah utama, important points, dan alasan/dampak dari important point tersebut.","bullets":["Bahasa sederhana membantu standardisasi.","Peserta perlu tahu bukan hanya apa, tetapi mengapa.","Dokumentasi memudahkan kontrol dan transfer keterampilan."],"sourcePages":"30-32"},{"title":"Empat tips mengajar","body":"Materi merangkum pengajaran menjadi Preparation, Explaining, Practice, dan Monitor/Follow up. Penjelasan perlu menyampaikan tujuan, manfaat/dampak, langkah, poin penting; peserta kemudian berlatih dan mendapat tindak lanjut.","bullets":["Preparation: siapkan orang dan materi.","Explaining: jelaskan langkah dan alasan.","Practice: peserta mencoba aktif.","Monitor: cek penerapan dan beri feedback."],"sourcePages":"37-39"}]},{"name":"DOUKIZUKE","title":"Doukizuke - Motivation & Feedback","summary":"Teori motivasi, self-efficacy, observasi, apresiasi, corrective feedback, dan anger management untuk mendorong tim secara efektif.","description":"Motivasi, self-efficacy, feedback, dan pengembangan tim","readingMinutes":12,"pdfUrl":"assets/modules/doukizuke.pdf","sections":[{"title":"Apa yang mendorong seseorang bekerja","body":"Materi mengangkat tiga perasaan melalui bekerja: kontribusi, bertumbuh, dan bekerja sama. Motivasi dipahami sebagai dorongan untuk bertindak menuju tujuan, menentukan arah, dan menopang tindakan tersebut.","bullets":["Kontribusi memberi rasa makna.","Pertumbuhan memberi rasa perkembangan.","Kerja sama menghubungkan individu dengan orang lain."],"sourcePages":"3-6"},{"title":"Teori motivasi","body":"Modul membahas Human Relations/Hawthorne, Maslow, McGregor Theory X/Y, Herzberg, dan Motivation 3.0. Hawthorne menyoroti pengaruh perhatian/observasi; Theory Y memandang manusia mampu berusaha dan mengendalikan diri secara sukarela.","bullets":["Maslow membahas lapisan kebutuhan.","Herzberg membedakan hygiene/extrinsic dan motivation/intrinsic factors.","Daniel Pink menggambarkan perkembangan menuju motivasi 3.0 yang terkait pengembangan diri, mastery, makna, dan kontribusi."],"sourcePages":"8-17"},{"title":"Self-efficacy dan observasi","body":"Self-efficacy adalah keyakinan bahwa seseorang mampu mencapai hasil. Percakapan hangat, dukungan, otonomi, pengalaman berhasil, dan apresiasi dapat memperkuatnya. Observasi memberi fakta untuk coaching yang lebih akurat.","bullets":["Bangun pengalaman sukses bertahap.","Berikan dukungan tanpa menghilangkan otonomi.","Gunakan fakta hasil observasi ketika memberi feedback."],"sourcePages":"20-22"},{"title":"Feedback dan apresiasi","body":"Feedback efektif menjelaskan perubahan, pertumbuhan, atau hasil secara objektif. I-message menyampaikan dampak yang dirasakan oleh saya/kita. Apresiasi sebaiknya faktual, tulus, spesifik, dan segera.","bullets":["Sebut perilaku atau hasil yang diamati.","Jelaskan dampak positifnya.","Dorong perilaku baik untuk diteruskan dan tawarkan dukungan."],"sourcePages":"22-25"},{"title":"Corrective feedback dan pengendalian emosi","body":"Koreksi berfokus pada isu, bukan menyerang orang. Lakukan secara langsung tetapi privat, gunakan fakta, beri jeda, ingatkan sisi baik, dan akhiri dengan dorongan. Materi juga memberi teknik anger management seperti diam sejenak, bernapas, dan berpikir sebelum bicara.","bullets":["Bedakan marah pada manusia dengan mengoreksi masalah.","Jaga privasi saat memberi koreksi.","Kelola emosi sebelum menyampaikan pesan penting."],"sourcePages":"26-34"}]},{"name":"ALEC","title":"ALEC - Active Listening for Effective Communication","summary":"Pendekatan komunikasi sesuai kematangan rekan kerja, cara memberi instruksi, bertanya, active listening, dan menerima HORENSO.","description":"Active listening, questioning, HORENSO, dan kemandirian tim","readingMinutes":9,"pdfUrl":"assets/modules/alec.pdf","sections":[{"title":"Tujuan ALEC","body":"ALEC bertujuan menyesuaikan pendekatan dengan tingkat kematangan rekan kerja dan mematangkan keterampilan memberi petunjuk, menjelaskan situasi, bertanya, serta mendengar agar anggota tim semakin mandiri.","bullets":["Pendekatan dapat bergeser dari instruksi langsung menuju dukungan dari belakang.","Keterampilan komunikasi disesuaikan dengan kebutuhan lawan bicara.","HORENSO tetap menjadi fondasi koordinasi."],"sourcePages":"3-4"},{"title":"Memberi petunjuk dan menjelaskan situasi","body":"Perintah diberikan pada waktu yang tepat, menjelaskan tujuan pekerjaan, standar/SLA, kebutuhan persiapan, timing laporan, dan antisipasi kesulitan. Menjelaskan WHY atau tujuan nyata membantu membangun kepercayaan dan motivasi.","bullets":["Jangan hanya menyampaikan apa yang harus dilakukan.","Jelaskan alasan dan hasil yang diharapkan.","Persiapkan jalan keluar jika situasi sulit terjadi."],"sourcePages":"5-6"},{"title":"Bertanya untuk membuat orang berpikir","body":"Pertanyaan dapat digunakan karena kita belum tahu atau justru karena kita tahu dan ingin mendorong orang lain berpikir. Closed question membatasi jawaban, sedangkan open question tidak menentukan jawaban sebelumnya dan membantu pembelajaran.","bullets":["Closed: cocok untuk konfirmasi cepat.","Open: mendorong penjelasan dan pemecahan masalah.","Pertanyaan yang baik membantu melihat perspektif lain."],"sourcePages":"7-8"},{"title":"Lima dasar active listening","body":"Materi menekankan meninggalkan sikap menyalahkan, mendengarkan seluruh hal yang ingin disampaikan anggota, menggunakan feedback, memperhatikan bahasa tubuh, dan mengendalikan emosi.","bullets":["Jangan terburu-buru menghakimi.","Gunakan respons untuk menunjukkan bahwa pesan diterima.","Bahasa tubuh dan emosi memengaruhi kualitas mendengar."],"sourcePages":"10"},{"title":"Menerima HORENSO","body":"Saat menerima HORENSO, berikan instruksi kerja yang jelas, tanyakan bila ada ketidakjelasan, dan respons dengan tenang. Ketika menerima konsultasi, dengarkan inti, tanyakan kondisi yang ingin diubah, alternatif, pilihan terbaik, serta dukungan yang dibutuhkan.","bullets":["Pada laporan, tanyakan tindakan berikutnya, bagaimana, dan kapan.","Berikan acknowledgement dan ucapan terima kasih.","Dorong kemandirian tanpa meninggalkan dukungan."],"sourcePages":"11-12"}]},{"name":"AEON_FIGURE","title":"AEON Figure 1, 2 & 3","summary":"Dasar angka retail: Cost, Retail, Neire/Mark Up, Sales, Gross Profit, Price Alteration, inventory, Turn Over Day, dan Rotation.","description":"Perhitungan retail, gross profit, inventory, dan stock rotation","readingMinutes":14,"pdfUrl":"assets/modules/aeon-figure-1-2-3.pdf","sections":[{"title":"Figure 1 - Cost, Retail, dan Neire","body":"Cost Price adalah harga beli dari supplier, Retail Price adalah harga jual, dan Mark Up/Neire adalah selisih yang menjadi profit. Rumus dasar: Retail - Cost = Mark Up dan Retail = Cost + Mark Up.","bullets":["Retail % dipandang sebagai 100%.","Mark Up % + Cost % = 100%.","Contoh modul: retail Rp15.000, mark up Rp3.000, cost Rp12.000 = 100%, 20%, 80%."],"sourcePages":"4-8"},{"title":"Sales, Gross Profit, dan Price Alteration","body":"Sales adalah nilai saat barang terjual kepada pelanggan. Gross Profit berasal dari bagian Mark Up/Neire, sedangkan Price Alteration (PA) adalah pengurangan harga/markdown yang memengaruhi gross profit.","bullets":["Cost tetap menjadi dasar setelah transaksi.","Markdown mengurangi nilai penjualan dan gross profit.","Rasio perlu dihitung terhadap basis yang ditentukan materi."],"sourcePages":"12-20"},{"title":"Contoh PA dan Gross Profit","body":"Pada contoh retail 100, cost 75, neire 25 dan PA 5, sales menjadi 95 dan gross profit menjadi 20. Materi menghitung GP% = 20/95 = 21,05% dan PA% = 5/95 = 5,26%.","bullets":["Selalu identifikasi basis persentase sebelum menghitung.","Bedakan nominal dengan ratio.","PA memengaruhi nilai sales aktual."],"sourcePages":"18-20"},{"title":"Figure 2 - Inventory","body":"Opening Inventory adalah stok awal, Purchase adalah pembelian, dan Closing Inventory adalah stok akhir. Modul menyediakan rumus hubungan sales, stok, purchase, PA/loss, sales cost, dan gross profit.","bullets":["Contoh modul menghasilkan closing retail Rp66.800 pada data yang diberikan.","Contoh yang sama menghasilkan gross profit sekitar Rp17.330.","GP% contoh tersebut sekitar 21,66%."],"sourcePages":"24-32"},{"title":"Figure 3 - Turn Over Day dan Rotation","body":"Turn Over Day menggunakan Average Stock dibagi Daily Average Sales, sedangkan Rotation menggunakan Monthly Sales dibagi Average Stock. Dalam kerangka contoh bulanan materi, Turn Over Day x Rotation = 30.","bullets":["Turn Over Day menunjukkan hari perputaran stok.","Rotation menunjukkan berapa kali stok berputar.","Keduanya membantu membaca produktivitas inventory."],"sourcePages":"36-37"}]},{"name":"FUTURE_VISION","title":"Visi Masa Depan Grup AEON","summary":"Visi untuk menciptakan gaya hidup masa depan yang membuat senyum berkembang, dengan customer orientation, hubungan, tiga sikap, dan satu janji.","description":"Future Vision, customer orientation, relationships, attitudes, dan promise","readingMinutes":10,"pdfUrl":"assets/modules/future-vision.pdf","sections":[{"title":"Pernyataan visi","body":"Visi Grup AEON adalah menciptakan gaya hidup di masa depan yang dapat membuat senyum mengembang di wajah setiap orang. Hal yang tidak berubah adalah orientasi kepada pelanggan; yang diperkuat adalah memahami setiap individu dan ikut menciptakan gaya hidup masa depan.","bullets":["Pelanggan tetap menjadi pusat.","AEON tidak hanya beradaptasi terhadap perubahan, tetapi ingin ikut menciptakan masa depan.","Senyum menjadi simbol kesejahteraan dan kebahagiaan."],"sourcePages":"3"},{"title":"AEON dan MIRAI","body":"MIRAI berarti masa depan. Cerita di booklet mengajak memandang masa depan bukan sebagai sesuatu yang pasti, tetapi sebagai sesuatu yang dapat dipikirkan, dibayangkan, dan ikut diciptakan dari tindakan hari ini.","bullets":["Perubahan teknologi dan lingkungan membawa peluang sekaligus tantangan.","Masa depan dapat diprediksi sebagian, tetapi tidak sepenuhnya pasti.","Imajinasi menjadi awal untuk menciptakan masa depan."],"sourcePages":"4-7"},{"title":"Posisi dan komposisi visi","body":"Visi berfungsi sebagai roadmap yang dipandu Prinsip Dasar AEON. Komposisinya mencakup masa depan yang ingin diwujudkan, wujud ideal Grup AEON, serta sikap dan janji yang dijunjung tinggi.","bullets":["Masa depan: masyarakat lebih cerah dan kebahagiaan individual yang nyata.","Wujud ideal: grup yang memimpin penciptaan gaya hidup dan meningkatkan kesejahteraan.","Visi menghubungkan arah jangka panjang dengan perilaku sehari-hari."],"sourcePages":"8-9"},{"title":"Relationships","body":"Relationships menjadi kata kunci. AEON ingin memperdalam hubungan dengan individu, menghubungkan individu dengan masyarakat, menghubungkan individu dengan individu, dan memperluas hubungan dari lokal hingga global.","bullets":["Hubungan bukan sekadar transaksi.","Koneksi antarindividu dan masyarakat menciptakan nilai bersama.","Cakupan hubungan dapat berkembang lintas wilayah."],"sourcePages":"10-11"},{"title":"Tiga sikap dan satu janji","body":"Tiga sikap yang ditekankan adalah bertindak atas inisiatif sendiri sesuai hati nurani, terus belajar untuk menciptakan nilai baru, serta membangun dan memelihara hubungan untuk co-creation. Janjinya adalah selalu jujur dan tulus.","bullets":["Initiative dan conscience.","Continuous learning dan new value.","Relationship building dan co-creation.","Promise: honest and sincere."],"sourcePages":"12"}]},{"name":"FOUNDATIONAL_IDEAL","title":"Prinsip Dasar AEON","summary":"Fondasi Customer First: perdamaian, kemanusiaan, komunitas setempat, ketulusan, dan inovasi berkelanjutan sebagai standar keputusan AEON People.","description":"Customer First, peace, humanity, local community, dan innovation","readingMinutes":8,"pdfUrl":"assets/modules/aeon-foundational-ideal.pdf","sections":[{"title":"Empat fondasi","body":"Prinsip Dasar AEON menempatkan orientasi kepada pelanggan bersama dukungan terhadap perdamaian, penghormatan terhadap kemanusiaan, dan kontribusi kepada komunitas setempat.","bullets":["Customer orientation menjadi fondasi.","Peace, humanity, dan local community saling terkait.","Prinsip digunakan dalam tindakan nyata, bukan hanya slogan."],"sourcePages":"1"},{"title":"Perdamaian dan retail","body":"Materi menjelaskan pengalaman pasca Perang Dunia II yang membentuk keyakinan bahwa industri ritel adalah simbol perdamaian. Perdamaian tidak datang dengan sendirinya dan perlu dijaga melalui kesadaran serta keterlibatan aktif.","bullets":["Ritel dapat berkembang dalam kondisi damai.","AEON tidak melakukan hal yang bertentangan dengan perdamaian.","Kontribusi terhadap peace dipandang sebagai tujuan aktif."],"sourcePages":"1"},{"title":"Kemanusiaan","body":"AEON memercayai, menghormati, dan menghargai setiap individu, termasuk karakter, martabat, dan otonominya. Manusia bertumbuh melalui pekerjaan, pembelajaran, dan hubungan antar-manusia.","bullets":["Percaya pada potensi individu.","Perbedaan individu perlu dihormati.","Hubungan antar-manusia menjadi ruang pertumbuhan."],"sourcePages":"1"},{"title":"Komunitas setempat","body":"Ritel berbasis pada komunitas dan berkembang bersama komunitas. Kontribusi dilakukan dengan menghormati keragaman serta kebutuhan lokal dan mendukung kesejahteraan masyarakat secara berkelanjutan.","bullets":["Local needs tidak selalu sama antarwilayah.","Kesejahteraan komunitas membutuhkan upaya berkelanjutan.","Bisnis ritel memiliki misi sosial di wilayah tempatnya tumbuh."],"sourcePages":"1"},{"title":"Customer First dan inovasi","body":"Customer First berarti tidak mendahulukan kenyamanan diri atau perusahaan. Prinsip dasar menjadi cermin untuk keputusan dan tindakan. Agar terus relevan, AEON menekankan inovasi berkelanjutan dan kemampuan membaca perubahan pelanggan serta masyarakat.","bullets":["Utamakan pelanggan dan bertindak tulus.","Tolak keputusan yang hanya nyaman bagi diri/perusahaan bila bertentangan dengan prinsip.","Jangan berpuas diri dengan keadaan sekarang; terus memperbaiki dan berubah."],"sourcePages":"1"}]},{"name":"MANAGEMENT","title":"Management - Tasks, Responsibilities, Practices","summary":"Panduan baca terpilih dari Peter F. Drucker tentang tanggung jawab dan performance, purpose of business, customer, marketing, innovation, mission, dan tugas manajemen.","description":"Management, performance, customer, marketing, innovation, dan mission","readingMinutes":18,"pdfUrl":"assets/modules/management-drucker.pdf","sections":[{"title":"Responsibility dan performance","body":"Pada bagian pembuka, Drucker menekankan responsibility dan performance. Management dipandang sebagai pekerjaan yang memiliki keterampilan dan alat, tetapi fokus utama buku adalah tugas serta kontribusi yang harus dihasilkan institusi.","bullets":["Management bukan sekadar posisi atau authority.","Performance institusi membutuhkan management yang bertanggung jawab.","Kontribusi menjadi ukuran penting bagi organ suatu institusi."],"sourcePages":"3-6"},{"title":"Management sebagai organ institusi","body":"Management dijelaskan sebagai organ khusus dari institusi modern. Tugasnya membuat institusi berfungsi dan menghasilkan kontribusi kepada masyarakat, ekonomi, serta individu.","bullets":["Manajemen berhubungan dengan hasil institusi.","Tugas, disiplin, dan manusia sama-sama penting.","Integritas dan dedikasi manajer memengaruhi pelaksanaan tanggung jawab."],"sourcePages":"6-18"},{"title":"Empat tugas penting","body":"Pembahasan mencakup performance ekonomi, membuat pekerjaan produktif dan pekerja mencapai achievement, mengelola dampak sosial/tanggung jawab, serta menyeimbangkan kebutuhan hari ini dan hari esok.","bullets":["Kinerja ekonomi tetap penting.","Produktivitas pekerjaan dan achievement manusia harus dikelola bersama.","Keputusan hari ini tidak boleh merusak kemampuan masa depan."],"sourcePages":"38"},{"title":"Purpose of business, marketing, innovation","body":"Drucker menyatakan purpose of a business adalah menciptakan customer. Dua fungsi entrepreneurial dasar adalah marketing dan innovation; keduanya menghasilkan result, sedangkan fungsi lain pada dasarnya merupakan cost.","bullets":["Marketing dimulai dari customer, bukan dari produk semata.","Innovation memberi kepuasan ekonomi yang berbeda atau lebih baik.","Profit dipahami sebagai result/test of performance, bukan satu-satunya purpose."],"sourcePages":"45-54"},{"title":"Mission dan pertanyaan tentang customer","body":"Mission yang jelas menjadi dasar objectives, priorities, strategies, plans, dan work assignments. Mendefinisikan bisnis dimulai dari realitas, harapan, dan nilai customer; jawaban seharusnya dicari dari customer, bukan sekadar ditebak oleh management.","bullets":["Tanyakan: siapa customer kita?","Tentukan apa yang bernilai bagi customer.","Gunakan mission untuk menyelaraskan keputusan dan prioritas."],"sourcePages":"56-60"}]},{"name":"SEMUA_DEMI_PELANGGAN","title":"Semua Demi Pelanggan - Sejarah & Semangat AEON","summary":"Comic sejarah AEON tentang jiwa pedagang, customer first, keberanian berubah, penggabungan hati, pendidikan, dan perjalanan organisasi.","description":"Customer First, sejarah AEON, merger, dan people development","readingMinutes":16,"pdfUrl":"assets/modules/semua-demi-pelanggan.pdf","sections":[{"title":"Semua demi pelanggan","body":"Comic menelusuri akar AEON melalui perjalanan keluarga Okada dan menempatkan kebutuhan pelanggan sebagai benang merah. Bagian-bagiannya mencakup Jiwa Pedagang Keliling, Turunkan Harga dan Raihlah Keuntungan, Bangkit dari Reruntuhan, Pasanglah Roda di Pilar Utama, dan Penggabungan Hati.","bullets":["Customer First ditampilkan melalui keputusan bisnis dan pelayanan.","Sejarah dipakai sebagai bahan memahami nilai kerja saat ini.","Perubahan selalu dikaitkan dengan kebutuhan masyarakat dan pelanggan."],"sourcePages":"1-4, 13"},{"title":"Akar dan moto keluarga","body":"Perjalanan Okadaya berawal pada abad ke-18. Dalam perkembangan berikutnya muncul moto \"Pasanglah roda di pilar utama\" dan gagasan menurunkan harga untuk meraih keuntungan, bukan sekadar menaikkan harga.","bullets":["Tradisi dagang menekankan adaptasi terhadap perubahan.","Moto menjadi simbol fleksibilitas dan keberanian bergerak.","Harga dan keuntungan dipandang melalui nilai yang diterima pelanggan."],"sourcePages":"15-25, 38-45"},{"title":"Bangkit dan terus berubah","body":"Kisah pascaperang memperlihatkan upaya membangun kembali bisnis dan merespons perubahan masyarakat. Tokoh-tokoh AEON menggunakan pengalaman sulit sebagai dasar untuk memikirkan kembali perdagangan dan pelayanan.","bullets":["Krisis tidak menghentikan orientasi kepada pelanggan.","Perubahan lingkungan membutuhkan cara kerja baru.","Ketahanan organisasi lahir dari tindakan, bukan nostalgia."],"sourcePages":"26-45"},{"title":"Penggabungan hati","body":"Pada kisah merger, materi menekankan bahwa penyatuan perusahaan tidak cukup dinilai hanya dari untung-rugi. Kepercayaan, pengorbanan, dan penyatuan hati menjadi syarat untuk membangun organisasi bersama.","bullets":["Merger menuntut tujuan yang melampaui kepentingan satu pihak.","Kepercayaan dibangun melalui tindakan konsisten.","\"Penggabungan hati\" menjadi simbol integrasi manusia, bukan hanya struktur."],"sourcePages":"46-64"},{"title":"People development dan Customer First","body":"Dalam perjalanan organisasi, AEON memberi perhatian besar pada pengembangan manusia. Comic mencatat penerapan promotion testing dan sekolah manajemen, serta pandangan bahwa retail adalah human industry dan pendidikan merupakan kontribusi penting perusahaan kepada karyawan.","bullets":["Pengembangan karyawan mendukung kualitas pelayanan.","Sistem promosi dikaitkan dengan pembelajaran dan kemampuan.","Customer First tetap menjadi landasan ketika organisasi berkembang."],"sourcePages":"61-71"}]}];

  const demoQuestions = [
    q("HOR-01","HORENSO","Easy","Dalam HORENSO, Renraku berarti...",["Melaporkan progres hanya kepada atasan","Menyampaikan informasi yang diperlukan kepada pihak terkait","Meminta keputusan kepada pelanggan","Mengevaluasi hasil pekerjaan setelah selesai"],"B","Renraku adalah menyampaikan informasi yang perlu diketahui pihak terkait."),
    q("HOR-02","HORENSO","Easy","Saat menerima instruksi, tindakan yang sesuai materi adalah...",["Langsung mulai tanpa mencatat","Mendengar sebagian lalu menyimpulkan sendiri","Menyiapkan memo, mendengar sampai selesai, lalu mengonfirmasi","Menunggu instruksi tertulis saja"],"C","Materi menekankan respons jelas, menyiapkan memo, mendengar hingga selesai, mencatat, merangkum, dan mengonfirmasi."),
    q("HOR-03","HORENSO","Medium","Huruf tambahan pada 5W2H selain Who, What, Where, When, Why, dan How adalah...",["How Long","How Much","How Often","How Fast"],"B","5W2H pada modul mencakup How Much."),
    q("HOR-04","HORENSO","Medium","Kapan Hokoku perlu segera dilakukan?",["Hanya setelah seluruh pekerjaan selesai","Saat pekerjaan berpotensi terlambat atau muncul masalah","Hanya pada akhir bulan","Setelah masalah diketahui semua orang"],"B","Risiko keterlambatan, error, atau masalah termasuk timing penting untuk Hokoku."),
    q("HOR-05","HORENSO","Medium","Prinsip laporan yang ditekankan untuk informasi buruk adalah...",["Bad news dilaporkan belakangan","Bad news first","Bad news hanya disimpan dalam memo","Bad news cukup disampaikan ke rekan sejawat"],"B","Materi secara eksplisit menekankan BAD NEWS first."),
    q("HOR-06","HORENSO","Medium","Urutan penyampaian Hokoku yang dianjurkan adalah...",["Proses panjang dahulu, kesimpulan terakhir","Kesimpulan terlebih dahulu, lalu alasan/proses/progres","Opini terlebih dahulu, fakta belakangan","Masalah dahulu tanpa menyebut hasil"],"B","Hokoku dianjurkan dimulai dari kesimpulan kemudian detail pendukung."),
    q("HOR-07","HORENSO","Hard","Dalam laporan, materi meminta peserta membedakan...",["Fakta, opini, dan asumsi","Atasan, rekan, dan pelanggan","Waktu, tempat, dan jabatan","Harga, biaya, dan stok"],"A","Pemisahan fakta, opini, dan asumsi membuat laporan lebih jelas."),
    q("HOR-08","HORENSO","Medium","Tujuan utama memakai 5W2H dalam Renraku adalah...",["Membuat pesan lebih panjang","Membuat informasi lebih lengkap dan jelas","Menggantikan kebutuhan konfirmasi","Membatasi informasi hanya untuk atasan"],"B","5W2H membantu memastikan elemen informasi penting tidak tertinggal."),
    q("HOR-09","HORENSO","Hard","Sebelum melakukan Sodan, langkah yang dianjurkan adalah...",["Datang tanpa persiapan agar spontan","Menyiapkan usulan/proposal dan memilih pihak yang tepat","Menunggu masalah membesar","Meminta rekan mengambil keputusan sendiri"],"B","Persiapan usulan dan memilih counselor yang tepat membuat konsultasi lebih fokus."),
    q("HOR-10","HORENSO","Medium","Dalam PDCA, Action terutama berkaitan dengan...",["Membuat improvement berdasarkan hasil Check","Menghindari evaluasi","Menghentikan siklus setelah Do","Menyimpan masalah tanpa tindak lanjut"],"A","Action dipakai untuk melakukan perbaikan dan melanjutkan siklus berikutnya."),
    q("JIS-01","JISEKI","Easy","Jiseki paling tepat diartikan sebagai...",["Menempatkan diri sebagai orang yang bertanggung jawab dan bertindak","Menunggu orang lain menyelesaikan masalah","Menyerahkan semua keputusan ke atasan","Menghindari pekerjaan di luar rutinitas"],"A","Jiseki adalah pola pikir dan tindakan dengan memosisikan diri sebagai pihak yang bertanggung jawab."),
    q("JIS-02","JISEKI","Easy","Taseki adalah pola pikir yang...",["Mencari akar masalah","Mengalihkan tanggung jawab kepada orang lain atau keadaan","Mengambil inisiatif","Membangun ownership"],"B","Taseki merupakan kebalikan Jiseki: memindahkan tanggung jawab keluar diri."),
    q("JIS-03","JISEKI","Medium","Toujisha Ishiki dalam materi berkaitan dengan...",["Kesadaran bahwa diri sendiri terlibat sebagai pemeran utama","Kemampuan menghitung profit","Kemampuan membuat jadwal","Kewajiban memberi hukuman"],"A","Toujisha Ishiki adalah sense of ownership/kesadaran diri sebagai pihak yang terlibat."),
    q("JIS-04","JISEKI","Medium","Jika belum pernah diajari sebuah pekerjaan, respons Jiseki adalah...",["Diam sampai ada training formal","Mencari referensi, belajar proaktif, dan bertanya","Menyalahkan trainer","Menolak tugas"],"B","Materi memberi contoh untuk proaktif belajar, mencari referensi, dan bertanya."),
    q("JIS-05","JISEKI","Medium","Salah satu dampak Taseki adalah...",["Masalah lebih cepat selesai","Kualitas otomatis meningkat","Masalah tidak terselesaikan dan pertumbuhan diri terhambat","Kepuasan pelanggan pasti naik"],"C","Materi mengaitkan Taseki dengan masalah tidak selesai, kualitas tidak meningkat, dan growth terhambat."),
    q("JIS-06","JISEKI","Medium","Salah satu dampak Jiseki adalah...",["Penyelesaian masalah lebih cepat dan kualitas meningkat","Ketergantungan pada orang lain meningkat","Komunikasi menjadi tidak diperlukan","Masalah selalu dipindahkan ke departemen lain"],"A","Jiseki mendorong penyelesaian lebih cepat, kualitas, kepuasan pelanggan, dan pertumbuhan diri."),
    q("JIS-07","JISEKI","Hard","Dari empat pola pikir menghadapi masalah, yang paling mencerminkan Jiseki adalah...",["Menghindari masalah","Menyangkal tanggung jawab","Membenarkan diri","Mengambil tanggung jawab dan mencari solusi"],"D","Pola keempat menempatkan diri sebagai pihak yang bertanggung jawab dan bergerak proaktif."),
    q("JIS-08","JISEKI","Hard","Pada contoh komplain AC, respons yang mencerminkan Jiseki adalah...",["Menyatakan itu urusan vendor","Mengumpulkan detail pembelian/installer lalu menindaklanjuti ke perusahaan AC","Meminta pelanggan menghubungi sendiri siapa pun yang memasang","Mengabaikan karena bukan departemennya"],"B","Kasus digunakan untuk menunjukkan pengumpulan fakta dan tindak lanjut proaktif, bukan menghindar."),
    q("JIS-09","JISEKI","Medium","Dengan perspektif ownership, pekerjaan sehari-hari dapat dipandang sebagai...",["Hal rutin yang tidak boleh diubah","Peluang menemukan masalah dan melakukan perbaikan","Alasan menghindari tanggung jawab tambahan","Tugas yang hanya dinilai dari kecepatan"],"B","Materi menekankan bahwa sudut pandang ownership membuka kesempatan improvement."),
    q("JIS-10","JISEKI","Hard","Hubungan Toujisha Ishiki dan Jiseki yang paling tepat adalah...",["Keduanya sama sekali tidak berhubungan","Toujisha Ishiki adalah kesadaran terlibat; Jiseki menerjemahkannya menjadi tanggung jawab dan tindakan","Jiseki hanya perasaan, Toujisha Ishiki hanya prosedur","Toujisha Ishiki adalah sistem penilaian dan Jiseki adalah nilai ujian"],"B","Toujisha Ishiki adalah ownership awareness; Jiseki memperlihatkan awareness itu dalam mindset dan aksi."),
    q("KYO-01","KYO","Easy","Johari Window dikembangkan oleh...",["Peter Drucker dan Elton Mayo","Joseph Luft dan Harry Ingham","Maslow dan McGregor","Daniel Pink dan Eric Berne"],"B","Materi KYO menyebut Joseph Luft dan Harry Ingham sebagai pengembang Johari Window."),
    q("KYO-02","KYO","Easy","Open Area pada Johari Window adalah area yang...",["Diketahui diri sendiri dan orang lain","Diketahui orang lain tetapi tidak diri sendiri","Diketahui diri sendiri tetapi tidak orang lain","Tidak diketahui siapa pun"],"A","Open Area berisi aspek yang diketahui oleh diri sendiri dan orang lain."),
    q("KYO-03","KYO","Medium","Blind Area adalah bagian diri yang...",["Diketahui diri sendiri dan orang lain","Diketahui orang lain tetapi belum disadari diri sendiri","Hanya diketahui diri sendiri","Tidak pernah dapat berubah"],"B","Blind Area dapat diperkecil melalui feedback dan refleksi."),
    q("KYO-04","KYO","Medium","Cara utama memperluas Open Area adalah...",["Menutup semua informasi pribadi","Self-disclosure dan feedback","Menghindari pengalaman baru","Menolak pandangan orang lain"],"B","Johari Window menggunakan self-disclosure dan feedback untuk memperluas Open Area."),
    q("KYO-05","KYO","Medium","Kondisi Johari Window yang dianggap ideal dalam materi adalah...",["Unknown Area paling besar","Hidden Area paling besar","Open Area paling besar","Blind Area paling besar"],"C","Open Area yang lebih luas membantu mengurangi kesalahpahaman dan menyelaraskan persepsi."),
    q("KYO-06","KYO","Medium","Dalam Transactional Analysis pada modul, PAC adalah...",["Plan, Action, Check","Parent, Adult, Child","People, Ability, Control","Performance, Attitude, Communication"],"B","PAC mengacu pada Parent, Adult, dan Child ego states."),
    q("KYO-07","KYO","Medium","Ego state Adult terutama dicirikan oleh...",["Objektif, rasional, dan berbasis fakta","Spontan tanpa pertimbangan","Menghakimi berdasarkan standar pribadi","Selalu mengikuti orang lain"],"A","Adult menekankan logika, objektivitas, fakta, dan data."),
    q("KYO-08","KYO","Hard","Sisi positif Critical Parent (CP) yang disebut materi adalah...",["Mendorong disiplin dan standar","Menghilangkan semua aturan","Membuat keputusan tanpa data","Menghindari feedback"],"A","CP dapat berguna untuk disiplin dan menjaga standar, walau berisiko menjadi terlalu judgemental."),
    q("KYO-09","KYO","Medium","Pola komunikasi kerja yang paling ideal menurut materi adalah...",["Child-Child","Parent-Child","Adult-Adult","Critical Parent-Free Child"],"C","Adult-Adult diposisikan sebagai komunikasi kerja yang objektif dan profesional."),
    q("KYO-10","KYO","Hard","Pendekatan memahami kemampuan orang lain pada bagian akhir modul diringkas sebagai...",["Observe, Understand, Adjust","Plan, Sell, Close","Command, Punish, Review","Speak, Decide, Leave"],"A","Materi menekankan Observe, Understand, lalu Adjust lingkungan atau peran."),
    q("TWI-01","TWIJI","Easy","Dalam prinsip OJT, siapa yang terutama berperan sebagai pengajar?",["Atasan langsung","Pelanggan","Vendor","Auditor eksternal"],"A","Materi OJT menyebut Who sebagai direct boss."),
    q("TWI-02","TWIJI","Easy","OJT terutama dilakukan di...",["Ruang kelas eksternal saja","Area tempat pekerjaan dilakukan","Rumah peserta","Ruang rapat direksi saja"],"B","Where pada OJT adalah area kerja agar pembelajaran terhubung langsung dengan pekerjaan."),
    q("TWI-03","TWIJI","Medium","Langkah pertama dari enam langkah OJT adalah...",["Mengulang edukasi","Memastikan hasil","Memahami level yang diharapkan","Membuat sertifikat"],"C","Urutan dimulai dengan memahami expected level."),
    q("TWI-04","TWIJI","Medium","Langkah keenam OJT adalah...",["Menghapus standar","Mengulang dan memberi edukasi tambahan bila diperlukan","Menghentikan monitoring","Mengganti trainer setiap hari"],"B","Setelah hasil dipastikan, pendidikan diulang atau ditambah bila diperlukan."),
    q("TWI-05","TWIJI","Medium","Cara memonitor OJT yang sesuai materi adalah...",["Tidak perlu target","Membuat agenda detail, mengecek progres, dan memberi feedback","Hanya menilai di akhir tahun","Mengandalkan ingatan tanpa review"],"B","Target, agenda, komunikasi, periodic progress check, feedback, dan skill review mendukung OJT."),
    q("TWI-06","TWIJI","Hard","Level pemahaman paling tinggi digambarkan ketika peserta...",["Hanya memahami teori","Bisa dengan instruksi terus-menerus","Mampu melakukannya spontan sebagai kebiasaan kerja sehari-hari","Belum pernah mencoba"],"C","Level matang adalah ketika perilaku/skill sudah spontan dan menjadi daily habit."),
    q("TWI-07","TWIJI","Medium","Dua alat standar yang ditekankan untuk OJT adalah...",["SOP/guideline dan Job Breakdown Sheet","Poster promosi dan invoice","Absensi dan slip gaji","Email dan kalender"],"A","Materi menempatkan SOP/guideline dan Job Breakdown Sheet sebagai tools standardisasi OJT."),
    q("TWI-08","TWIJI","Hard","Job Breakdown Sheet antara lain memuat...",["Langkah utama, important points, dan alasan/dampaknya","Hanya nama peserta","Hanya target penjualan","Hanya riwayat perusahaan"],"A","Breakdown menjelaskan urutan, main steps, important points, dan alasan pentingnya."),
    q("TWI-09","TWIJI","Medium","Empat tips mengajar dalam modul adalah...",["Preparation, Explaining, Practice, Monitor","Plan, Sell, Audit, Close","Ask, Punish, Test, Leave","Read, Copy, Memorize, Finish"],"A","Materi merangkum proses menjadi Preparation, Explaining, Practice, dan Monitor/Follow up."),
    q("TWI-10","TWIJI","Easy","Menurut bagian akhir modul, mengajar adalah...",["Tugas HR saja","Kewajiban semua leader","Tugas vendor saja","Pilihan yang tidak terkait kepemimpinan"],"B","Materi menegaskan teaching is obligation of all leaders."),
    q("DOU-01","DOUKIZUKE","Easy","Tiga hal yang dirasakan melalui bekerja menurut modul adalah...",["Kontribusi, bertumbuh, dan bekerja sama","Gaji, jabatan, dan cuti","Cepat, murah, dan banyak","Target, hukuman, dan kontrol"],"A","Modul menyebut feelings of contribution, growth, dan cooperation."),
    q("DOU-02","DOUKIZUKE","Easy","Motivasi dalam modul berfungsi untuk...",["Mendorong tindakan menuju tujuan, memberi arah, dan menopang tindakan","Menghilangkan semua target","Menggantikan standar kerja","Mencegah semua feedback"],"A","Motivasi dipahami sebagai dorongan untuk bertindak, menentukan arah, dan meneruskan tindakan."),
    q("DOU-03","DOUKIZUKE","Medium","Penelitian Hawthorne dalam materi dikaitkan dengan tokoh...",["Elton Mayo","Peter Drucker","Eric Berne","Joseph Luft"],"A","Bagian Human Relations membahas Hawthorne dan Elton Mayo."),
    q("DOU-04","DOUKIZUKE","Medium","Inti yang ditarik dari Hawthorne pada modul adalah produktivitas meningkat ketika...",["Karyawan merasa mendapat perhatian/diamati","Semua aturan dihapus","Gaji selalu diturunkan","Pekerjaan dihentikan"],"A","Materi menyoroti perhatian/observasi terhadap pekerja sebagai faktor yang memengaruhi produktivitas."),
    q("DOU-05","DOUKIZUKE","Medium","Theory Y menggambarkan manusia sebagai pihak yang...",["Pada dasarnya selalu malas dan harus dipaksa","Dapat berusaha sukarela, self-control, dan menyukai tantangan","Tidak mampu mengambil tanggung jawab","Hanya bekerja bila diawasi setiap detik"],"B","Theory Y pada modul lebih positif terhadap inisiatif, self-control, dan challenge."),
    q("DOU-06","DOUKIZUKE","Medium","Contoh faktor motivator Herzberg adalah...",["Achievement dan recognition","Kebijakan perusahaan saja","Kondisi fisik kantor saja","Status administratif saja"],"A","Achievement, recognition, work itself, responsibility, promotion, dan growth opportunities termasuk motivator."),
    q("DOU-07","DOUKIZUKE","Hard","Motivation 3.0 pada materi terutama menekankan...",["Reward dan punishment semata","Pengembangan diri, mastery, makna, dan kontribusi","Pemenuhan kebutuhan fisik saja","Kontrol langsung setiap saat"],"B","Materi mengaitkan Motivation 3.0 dengan dorongan psikologis untuk berkembang, menguasai, bermakna, dan berkontribusi."),
    q("DOU-08","DOUKIZUKE","Medium","Self-efficacy berarti...",["Keyakinan bahwa diri mampu mencapai hasil","Ketakutan terhadap feedback","Kemampuan menghukum anggota tim","Keinginan menghindari tantangan"],"A","Self-efficacy adalah belief terhadap kemampuan diri menghasilkan pencapaian."),
    q("DOU-09","DOUKIZUKE","Medium","I-message menyampaikan...",["Dampak atau perasaan yang dialami saya/kita tanpa memberi label pada orang","Ancaman kepada lawan bicara","Gosip tentang orang ketiga","Instruksi tanpa konteks"],"A","I-message berfokus pada dampak yang dirasakan oleh pembicara, bukan menyerang karakter orang lain."),
    q("DOU-10","DOUKIZUKE","Hard","Corrective feedback yang sesuai materi sebaiknya...",["Dilakukan di depan banyak orang agar malu","Privat, faktual, fokus pada masalah, dan diakhiri dengan dorongan","Menggunakan label pribadi","Ditunda tanpa batas"],"B","Koreksi dianjurkan langsung tetapi private, spesifik pada fakta/isu, dan tetap mendorong perbaikan."),
    q("ALE-01","ALEC","Easy","Tujuan utama pendekatan ALEC adalah...",["Menyesuaikan komunikasi dengan tingkat kematangan rekan agar lebih mandiri","Membuat semua orang selalu bergantung pada atasan","Mengurangi kebutuhan komunikasi","Mengganti HORENSO"],"A","ALEC menyesuaikan petunjuk, pertanyaan, dan listening berdasarkan maturity untuk mendorong kemandirian."),
    q("ALE-02","ALEC","Medium","Petunjuk/perintah yang baik perlu menjelaskan...",["Tujuan, standar/SLA, timing, dan persiapan yang dibutuhkan","Hanya nama pemberi instruksi","Hanya deadline tanpa tujuan","Hanya hukuman bila gagal"],"A","Materi meminta instruksi diberikan pada waktu tepat, dengan purpose, standard, preparation, dan reporting timing."),
    q("ALE-03","ALEC","Medium","Menjelaskan WHY atau tujuan nyata pekerjaan membantu...",["Membangun kepercayaan dan motivasi","Menghilangkan tanggung jawab","Membuat instruksi lebih kabur","Menghindari kebutuhan standar"],"A","Menjelaskan tujuan perusahaan/masyarakat dan manfaat membantu trust dan intrinsic motivation."),
    q("ALE-04","ALEC","Medium","Mengapa kita dapat bertanya walaupun sebenarnya sudah tahu jawabannya?",["Untuk membuat lawan bicara berpikir dan mengembangkan problem solving","Untuk mempermalukan lawan bicara","Agar percakapan cepat berhenti","Supaya tidak perlu mendengar"],"A","Questioning juga dipakai untuk memicu proses berpikir, bukan hanya mencari informasi."),
    q("ALE-05","ALEC","Easy","Closed question biasanya...",["Memiliki jawaban terbatas seperti ya/tidak","Tidak memiliki batas jawaban","Selalu meminta cerita panjang","Tidak boleh dipakai untuk konfirmasi"],"A","Closed question membatasi pilihan jawaban dan cocok untuk konfirmasi tertentu."),
    q("ALE-06","ALEC","Easy","Open question membantu karena...",["Jawaban tidak ditentukan sebelumnya dan mendorong penjelasan","Hanya dapat dijawab ya/tidak","Selalu mengarahkan ke satu jawaban","Menghindari proses berpikir"],"A","Open question memberi ruang lawan bicara menjelaskan dan belajar."),
    q("ALE-07","ALEC","Medium","Salah satu dari lima dasar active listening adalah...",["Meninggalkan sikap menyalahkan","Memotong pembicaraan agar cepat","Mengabaikan bahasa tubuh","Membiarkan emosi mengambil alih"],"A","Materi menekankan no-blame attitude, listening to all, feedback, body language, dan emotional control."),
    q("ALE-08","ALEC","Medium","Saat menerima HORENSO dan ada hal tidak jelas, sebaiknya...",["Diam agar tidak terlihat tidak tahu","Bertanya untuk memperjelas dan merespons dengan tenang","Langsung menyalahkan pemberi laporan","Mengubah topik"],"B","Penerima HORENSO perlu memastikan clarity dan tetap calm."),
    q("ALE-09","ALEC","Hard","Saat menerima konsultasi, pertanyaan yang membantu kemandirian adalah...",["Apa kondisi yang ingin diubah, alternatifnya apa, dan mana yang terbaik?","Siapa yang harus disalahkan?","Mengapa kamu tidak diam saja?","Bisakah saya memutuskan semuanya untukmu?"],"A","Pertanyaan tentang desired state, alternatives, best option, dan support membuat konsultan tetap berpikir."),
    q("ALE-10","ALEC","Medium","Saat menerima laporan, follow-up yang sesuai adalah menanyakan...",["Apa tindakan berikutnya, bagaimana, dan kapan","Berapa lama orang lain akan disalahkan","Apakah laporan bisa diabaikan","Siapa yang paling populer"],"A","Materi menekankan next action, how, when, acknowledgement, dan expectation."),
    q("FIG-01","AEON_FIGURE","Easy","Cost Price berarti...",["Harga beli dari supplier","Harga jual ke pelanggan","Nilai markdown","Jumlah gross profit"],"A","Modul mendefinisikan Cost Price sebagai harga beli dari supplier."),
    q("FIG-02","AEON_FIGURE","Easy","Jika Retail Price Rp15.000 dan Cost Price Rp12.000, Mark Up/Neire adalah...",["Rp1.000","Rp3.000","Rp12.000","Rp27.000"],"B","Retail - Cost = Mark Up, sehingga 15.000 - 12.000 = 3.000."),
    q("FIG-03","AEON_FIGURE","Medium","Pada contoh Retail Rp15.000, Mark Up Rp3.000, Cost Rp12.000, ratio Mark Up adalah...",["10%","20%","25%","80%"],"B","Materi menunjukkan Retail 100%, Mark Up 20%, Cost 80%."),
    q("FIG-04","AEON_FIGURE","Easy","Retail Price berubah menjadi Sales ketika...",["Barang diterima dari supplier","Pelanggan melakukan pembayaran/pembelian","Barang masuk gudang","Label harga dicetak"],"B","Materi menjelaskan nilai retail menjadi sales saat barang terjual kepada pelanggan."),
    q("FIG-05","AEON_FIGURE","Easy","PA dalam modul mengacu pada...",["Price Alteration/markdown","Purchase Approval","Profit Allocation","Performance Audit"],"A","PA adalah Price Alteration, yaitu penurunan/alteration harga."),
    q("FIG-06","AEON_FIGURE","Hard","Pada contoh Retail 100, Cost 75, Neire 25, dan PA 5, Gross Profit % adalah...",["20,00%","21,05%","25,00%","26,32%"],"B","Sales menjadi 95 dan GP menjadi 20, sehingga GP% = 20/95 = 21,05%."),
    q("FIG-07","AEON_FIGURE","Hard","Pada contoh yang sama, PA % dihitung menjadi...",["5,00%","5,26%","6,25%","20,00%"],"B","PA%=5/95 x 100 = 5,26% sesuai contoh materi."),
    q("FIG-08","AEON_FIGURE","Hard","Pada contoh inventory modul, Closing Retail yang diperoleh adalah sekitar...",["Rp35.000","Rp50.000","Rp66.800","Rp80.000"],"C","Dengan data contoh opening, purchase, sales, PA, dan loss, materi memperoleh closing retail Rp66.800."),
    q("FIG-09","AEON_FIGURE","Hard","Pada contoh inventory yang sama, Gross Profit sekitar...",["Rp2.400","Rp17.330","Rp35.000","Rp66.800"],"B","Materi menghitung sales cost sekitar Rp62.670 sehingga GP sekitar Rp17.330."),
    q("FIG-10","AEON_FIGURE","Medium","Dalam kerangka bulanan materi, hubungan Turn Over Day dan Rotation adalah...",["Turn Over Day + Rotation = 100","Turn Over Day x Rotation = 30","Turn Over Day = Rotation x 100","Keduanya tidak berhubungan"],"B","Materi Figure 3 menuliskan Turn Over Day x Rotation = 30."),
    q("VIS-01","FUTURE_VISION","Easy","Pernyataan Visi Masa Depan Grup AEON adalah...",["Menciptakan gaya hidup di masa depan yang dapat membuat senyum mengembang di wajah setiap orang","Menjadi perusahaan terbesar tanpa memperhatikan pelanggan","Mengurangi semua perubahan dalam bisnis","Berfokus hanya pada penjualan jangka pendek"],"A","Kalimat tersebut menjadi pernyataan visi di booklet."),
    q("VIS-02","FUTURE_VISION","Medium","Hal yang dinyatakan tidak berubah dalam visi adalah...",["Orientasi kepada pelanggan","Lokasi semua toko","Teknologi yang digunakan","Struktur organisasi"],"A","Booklet menegaskan bahwa orientasi kepada pelanggan merupakan hal yang tidak diubah."),
    q("VIS-03","FUTURE_VISION","Easy","MIRAI dalam bahasa Jepang berarti...",["Pelanggan","Masa depan","Komunitas","Keuntungan"],"B","Booklet menjelaskan MIRAI berarti masa depan."),
    q("VIS-04","FUTURE_VISION","Medium","Visi Masa Depan disusun dari...",["Masa depan yang ingin diwujudkan, wujud ideal grup, serta sikap dan janji","Hanya target sales tahunan","Hanya struktur organisasi","Hanya daftar proyek teknologi"],"A","Komposisi visi mencakup future desired, ideal group form, dan attitudes/promise."),
    q("VIS-05","FUTURE_VISION","Medium","Masa depan yang ingin diwujudkan AEON dikaitkan dengan...",["Masyarakat lebih cerah, kebahagiaan individu, dan wajah penuh senyum","Persaingan internal yang lebih tinggi","Pengurangan hubungan antarorang","Keuntungan tanpa batas"],"A","Booklet menggambarkan brighter society, true individual happiness, dan peaceful smiling future."),
    q("VIS-06","FUTURE_VISION","Medium","Wujud ideal Grup AEON adalah grup yang...",["Memimpin penciptaan gaya hidup dan meningkatkan kesejahteraan individu/masyarakat","Hanya menjual satu kategori produk","Menghindari kolaborasi","Tidak berubah mengikuti zaman"],"A","Ideal form menekankan leadership dalam lifestyle creation dan wellbeing."),
    q("VIS-07","FUTURE_VISION","Easy","Kata kunci yang ditekankan dalam visi adalah...",["Relationships","Isolation","Punishment","Inventory"],"A","Booklet memberi penekanan pada relationships."),
    q("VIS-08","FUTURE_VISION","Hard","Yang termasuk salah satu peran hubungan AEON adalah...",["Menghubungkan individu dengan masyarakat","Mengurangi hubungan lokal","Memisahkan pelanggan satu sama lain","Menghindari koneksi global"],"A","Empat peran mencakup deepen individual relationship, connect individual-society, individual-individual, dan expand relationships."),
    q("VIS-09","FUTURE_VISION","Medium","Salah satu dari tiga sikap yang dijunjung tinggi adalah...",["Terus belajar untuk menciptakan nilai baru","Menolak pembelajaran baru","Bertindak hanya jika diperintah","Mengutamakan kenyamanan diri"],"A","Continuous learning untuk new value merupakan salah satu attitude."),
    q("VIS-10","FUTURE_VISION","Easy","Satu janji yang ditekankan dalam visi adalah...",["Selalu jujur dan tulus","Selalu menjadi yang termurah","Tidak pernah mengubah proses","Selalu bekerja sendiri"],"A","Promise dalam booklet adalah selalu honest and sincere."),
    q("FND-01","FOUNDATIONAL_IDEAL","Easy","Prinsip Dasar AEON mencakup orientasi pelanggan, perdamaian, kemanusiaan, dan...",["Kontribusi kepada komunitas setempat","Dominasi pasar","Kompetisi antarpegawai","Pengurangan interaksi"],"A","Empat fondasi mencakup customer orientation, peace, humanity, dan local community."),
    q("FND-02","FOUNDATIONAL_IDEAL","Medium","Mengapa industri ritel disebut simbol perdamaian dalam materi?",["Karena ritel hanya dapat berkembang dalam kondisi damai","Karena ritel menggantikan pemerintah","Karena ritel tidak memiliki pelanggan saat damai","Karena ritel selalu berada di luar komunitas"],"A","Pengalaman pascaperang membentuk keyakinan bahwa ritel berkembang ketika peace ada."),
    q("FND-03","FOUNDATIONAL_IDEAL","Medium","Perdamaian dapat dipertahankan melalui...",["Kesadaran dan keterlibatan aktif","Menunggu kondisi membaik sendiri","Menghindari komunitas","Hanya kebijakan perusahaan"],"A","Materi menegaskan peace tidak datang sendiri dan membutuhkan awareness serta active involvement."),
    q("FND-04","FOUNDATIONAL_IDEAL","Medium","Dalam aspek kemanusiaan, AEON menekankan penghormatan terhadap...",["Karakter, martabat, dan otonomi individu","Hanya jabatan formal","Hanya hasil penjualan","Keseragaman semua orang"],"A","Humanity mencakup respect terhadap individuality, dignity, dan autonomy."),
    q("FND-05","FOUNDATIONAL_IDEAL","Easy","Ritel dipandang sebagai industri yang...",["Berbasis komunitas setempat dan tumbuh bersama komunitas","Tidak memiliki hubungan dengan wilayah","Hanya berorientasi pada pusat","Tidak perlu memahami kebutuhan lokal"],"A","Materi menyatakan retail berbasis local community dan berkembang bersamanya."),
    q("FND-06","FOUNDATIONAL_IDEAL","Hard","Customer First berarti...",["Mendahulukan kepentingan pelanggan secara tulus, bukan kenyamanan diri/perusahaan","Pelanggan selalu benar dalam semua hal tanpa standar","Mengabaikan kelangsungan perusahaan","Mengutamakan keputusan termudah untuk internal"],"A","Prinsip menolak self/company convenience sebagai dasar utama bila bertentangan dengan customer-first sincerity."),
    q("FND-07","FOUNDATIONAL_IDEAL","Medium","Prinsip Dasar AEON digunakan sebagai...",["Cermin atau standar dalam membuat keputusan dan tindakan","Daftar harga","Sistem absensi","Template invoice"],"A","Materi menyebut prinsip sebagai mirror/standard bagi decision dan action AEON People."),
    q("FND-08","FOUNDATIONAL_IDEAL","Medium","Mengapa inovasi berkelanjutan diperlukan?",["Agar organisasi tidak melemah karena hanya mempertahankan keadaan sekarang","Agar semua standar dihapus","Agar pelanggan tidak perlu dipahami","Agar perubahan dihentikan"],"A","Materi menekankan organisasi tidak boleh puas pada status quo dan harus terus memperbaiki diri."),
    q("FND-09","FOUNDATIONAL_IDEAL","Hard","Kemampuan yang dibutuhkan untuk terus berinovasi adalah...",["Memprediksi masa depan dan mengidentifikasi perubahan pelanggan/masyarakat","Mengabaikan tren pelanggan","Menghindari informasi baru","Mengurangi pembelajaran"],"A","Materi menghubungkan innovation dengan kemampuan membaca future dan changes pada customer/society."),
    q("FND-10","FOUNDATIONAL_IDEAL","Easy","Landasan utama seluruh Prinsip Dasar AEON adalah...",["Customer First","Profit First","Manager First","Product First"],"A","Peace, humanity, dan community contribution diposisikan sebagai perwujudan customer orientation/Customer First."),
    q("MGT-01","MANAGEMENT","Easy","Pada preface, Drucker menekankan dua hal utama yaitu...",["Responsibility dan performance","Status dan privilege","Harga dan diskon","Kontrol dan hukuman"],"A","Pembuka buku menekankan responsibility dan performance, bukan sekadar rights atau authority."),
    q("MGT-02","MANAGEMENT","Medium","Management dalam buku dipandang sebagai...",["Tasks, discipline, dan people","Hanya jabatan formal","Hanya teknik akuntansi","Hanya seni berbicara"],"A","Drucker membahas management melalui tasks, discipline, dan manusia yang menjalankannya."),
    q("MGT-03","MANAGEMENT","Medium","Management disebut organ khusus dari...",["Institusi modern","Keluarga saja","Pasar tradisional saja","Sistem komputer"],"A","Buku menggambarkan management sebagai specific organ of modern institution."),
    q("MGT-04","MANAGEMENT","Hard","Yang termasuk salah satu tugas management menurut pembahasan buku adalah...",["Membuat work productive dan worker achieving","Menghilangkan seluruh social responsibility","Menghindari hasil ekonomi","Memisahkan keputusan hari ini dari masa depan"],"A","Salah satu core task adalah making work productive and the worker achieving, bersama economic performance dan social impact."),
    q("MGT-05","MANAGEMENT","Easy","Menurut Drucker, purpose of a business adalah...",["Menciptakan customer","Memaksimalkan birokrasi","Mengurangi innovation","Menghindari market"],"A","Buku menyatakan purpose of a business is to create a customer."),
    q("MGT-06","MANAGEMENT","Medium","Dua fungsi entrepreneurial dasar yang menghasilkan results adalah...",["Marketing dan innovation","Payroll dan filing","Security dan parking","Meeting dan reporting"],"A","Drucker menyebut marketing and innovation sebagai basic entrepreneurial functions."),
    q("MGT-07","MANAGEMENT","Hard","Innovation dalam konteks buku berarti antara lain...",["Memberi sumber daya kemampuan menghasilkan kekayaan/nilai baru atau lebih besar","Mengulang cara lama tanpa perubahan","Mengurangi nilai bagi customer","Hanya mengganti nama produk"],"A","Innovation memberi different/better satisfaction dan new or greater wealth-producing capacity."),
    q("MGT-08","MANAGEMENT","Medium","Profit dijelaskan sebagai...",["Result dari marketing, innovation, productivity dan test of performance","Satu-satunya purpose perusahaan","Pengganti customer","Alasan menghindari innovation"],"A","Drucker memosisikan profit sebagai result/test, bukan purpose tunggal."),
    q("MGT-09","MANAGEMENT","Medium","Mission yang jelas menjadi dasar untuk...",["Objectives, priorities, strategies, plans, dan work assignments","Menghapus semua prioritas","Menghindari keputusan","Mengganti kebutuhan customer"],"A","Clear mission memungkinkan objectives dan prioritas yang realistis serta menyelaraskan pekerjaan."),
    q("MGT-10","MANAGEMENT","Hard","Dalam mendefinisikan bisnis, jawaban tentang kebutuhan dan nilai sebaiknya dicari dari...",["Customer dan realitasnya","Asumsi management saja","Kompetitor saja","Struktur internal saja"],"A","Buku menekankan mulai dari customer realities, expectations, values, dan memperoleh jawaban dari customer."),
    q("CUS-01","SEMUA_DEMI_PELANGGAN","Easy","Tema utama comic adalah...",["Semua Demi Pelanggan","Semua Demi Persaingan","Semua Demi Jabatan","Semua Demi Teknologi"],"A","Judul dan alur comic menempatkan pelanggan sebagai benang merah sejarah AEON."),
    q("CUS-02","SEMUA_DEMI_PELANGGAN","Medium","Akar perjalanan AEON dalam comic dikaitkan dengan...",["Jiwa pedagang dan orientasi kepada kebutuhan pelanggan","Bisnis tanpa interaksi pelanggan","Hanya teknologi modern","Organisasi yang tidak pernah berubah"],"A","Kisah sejarah menggunakan pengalaman berdagang dan customer-first sebagai dasar perkembangan."),
    q("CUS-03","SEMUA_DEMI_PELANGGAN","Medium","Tahun yang dikaitkan dengan berdirinya Okadaya oleh Sozaemon Okada dalam perjalanan sejarah adalah...",["1758","1887","1969","1989"],"A","Timeline sejarah mengawali Okadaya pada 1758."),
    q("CUS-04","SEMUA_DEMI_PELANGGAN","Medium","Moto keluarga yang muncul setelah perpindahan pada 1887 adalah...",["Pasanglah roda di pilar utama","Berhenti saat pasar berubah","Harga harus selalu dinaikkan","Jangan pernah berpindah"],"A","Moto tersebut melambangkan kemampuan beradaptasi dan bergerak."),
    q("CUS-05","SEMUA_DEMI_PELANGGAN","Medium","Moto yang terkait Market Crash Sale 1920 adalah...",["Turunkan harga dan raihlah keuntungan, jangan dengan menaikkannya","Naikkan harga dalam semua kondisi","Hindari pelanggan saat krisis","Hentikan penjualan saat pasar turun"],"A","Comic menampilkan gagasan mencari keuntungan melalui penurunan harga, bukan menaikkannya."),
    q("CUS-06","SEMUA_DEMI_PELANGGAN","Easy","Judul Bagian V comic adalah...",["Penggabungan Hati","Jiwa Pedagang Keliling","Bangkit dari Reruntuhan","Pasanglah Roda di Pilar Utama"],"A","Daftar isi menamai Bagian V \"Penggabungan Hati\"."),
    q("CUS-07","SEMUA_DEMI_PELANGGAN","Hard","Pesan penting sebelum merger yang ditonjolkan adalah...",["Menyatukan hati dan tujuan, bukan hanya struktur","Mengejar keuntungan pihak sendiri","Menghindari kepercayaan","Menghapus pengorbanan bersama"],"A","Kisah merger menekankan heart-to-heart integration dan tujuan bersama."),
    q("CUS-08","SEMUA_DEMI_PELANGGAN","Hard","Dalam kisah Shiro, keputusan tidak semata-mata didasarkan pada...",["Untung-rugi jangka pendek","Kepercayaan","Hubungan antarorang","Komitmen bersama"],"A","Cerita menunjukkan trust dan hubungan dapat menjadi pertimbangan penting di luar angka P&L semata."),
    q("CUS-09","SEMUA_DEMI_PELANGGAN","Medium","Comic mencatat Okadaya mulai menggunakan promotion testing system pada...",["1959","1964","1969","1989"],"A","Bagian people development mencatat promotion testing system pada 1959."),
    q("CUS-10","SEMUA_DEMI_PELANGGAN","Medium","Okadaya Management School dicatat didirikan pada...",["1964","1758","1920","1989"],"A","Comic mengaitkan 1964 dengan pembentukan Okadaya Management School sebagai bagian people development.")
  ];

  function q(id, module, level, text, choices, answer, explanation) {
    return { id, module, level, type: 'PG', text, options: choices.map((value, i) => ({ key: String.fromCharCode(65 + i), text: value })), answer, explanation };
  }

  function getStoredSession() {
    if (memorySession?.token && memorySession?.user) {
      if (!memorySession.expiresAt || Number(memorySession.expiresAt) > Date.now()) return memorySession;
      memorySession = null;
    }
    const stores = [];
    try { stores.push(localStorage); } catch (_) {}
    try { stores.push(sessionStorage); } catch (_) {}
    for (const store of stores) {
      try {
        const parsed = JSON.parse(store.getItem(SESSION_KEY) || 'null');
        if (parsed?.token && parsed?.user) {
          if (parsed.expiresAt && Number(parsed.expiresAt) <= Date.now()) { store.removeItem(SESSION_KEY); continue; }
          memorySession = parsed;
          return parsed;
        }
      } catch (_) {}
    }
    return null;
  }

  function setStoredSession(session) {
    memorySession = session || null;
    const stores = [];
    try { stores.push(localStorage); } catch (_) {}
    try { stores.push(sessionStorage); } catch (_) {}
    stores.forEach(store => {
      try {
        if (session) store.setItem(SESSION_KEY, JSON.stringify(session));
        else store.removeItem(SESSION_KEY);
        LEGACY_SESSION_KEYS.forEach(key => store.removeItem(key));
      } catch (_) {}
    });
  }

  async function request(action, payload = {}, options = {}) {
    if (demoMode) return demoRequest(action, payload);
    if (!isConfigured) { const error = new Error('API Google Apps Script belum dikonfigurasi. Periksa assets/js/config.js.'); error.code = 'API_NOT_CONFIGURED'; throw error; }
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
    const result = await request('login', { id: String(id).trim(), password: String(password) }, {timeout:45000});
    setStoredSession({ token: result.token, user: result.user, expiresAt: result.expiresAt });
    return result;
  }

  async function register(payload) {
    return request('register', {
      id: String(payload?.id || '').trim(),
      name: String(payload?.name || '').trim(),
      department: String(payload?.department || '').trim(),
      level: String(payload?.level || '').trim(),
      password: String(payload?.password || '')
    });
  }

  async function getModule(module) {
    return request('getModule', { module:String(module || '').trim() });
  }

  async function saveReadingProgress(payload) {
    return request('saveReadingProgress', payload);
  }

  async function logout() {
    try { await request('logout'); } catch (_) { /* clear local session anyway */ }
    setStoredSession(null);
  }

  function readDemoUsers() {
    try {
      const stored = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || 'null');
      if (Array.isArray(stored) && stored.length) return stored;
    } catch (_) { /* seed below */ }
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(demoUserSeed));
    return demoUserSeed.map(user => ({...user}));
  }

  function writeDemoUsers(users) {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
  }

  function safeDemoUser(user) {
    return { id:user.id, name:user.name, department:user.department, level:user.level, role:user.role, status:user.status };
  }

  function demoError(message, code) {
    const error = new Error(message); error.code = code; return error;
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

  function readDemoReading() {
    try {
      const stored = JSON.parse(localStorage.getItem(DEMO_READING_KEY) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (_) { return []; }
  }

  function writeDemoReading(rows) { localStorage.setItem(DEMO_READING_KEY, JSON.stringify(rows)); }

  function readingForUser(userId) {
    return readDemoReading().filter(item => String(item.userId).toLowerCase() === String(userId).toLowerCase());
  }

  function moduleList() {
    const names = [...new Set([...demoModules.map(item=>item.name), ...demoQuestions.map(item=>item.module)])];
    return names.map(name => {
      const material = demoModules.find(item => item.name === name);
      return {
        name,
        title:material?.title || name,
        questionCount:demoQuestions.filter(item => item.module === name).length,
        description:material?.description || 'Materi promotion test',
        readingMinutes:Number(material?.readingMinutes)||5,
        pdfUrl:material?.pdfUrl || '',
        hasMaterial:Boolean(material?.sections?.length)
      };
    });
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
    if (action === 'health') return { success:true, mode:'demo', version:'4.0.0' };

    if (action === 'register') {
      const id = String(payload.id || '').trim();
      const name = String(payload.name || '').trim();
      const department = String(payload.department || '').trim();
      const level = String(payload.level || '').trim();
      const password = String(payload.password || '');
      if (!/^[A-Za-z0-9._-]{4,30}$/.test(id)) throw demoError('ID harus 4–30 karakter dan hanya boleh berisi huruf, angka, titik, strip, atau underscore.', 'INVALID_ID');
      if (name.length < 3) throw demoError('Nama lengkap minimal 3 karakter.', 'INVALID_NAME');
      if (!department) throw demoError('Departemen / divisi wajib diisi.', 'INVALID_DEPARTMENT');
      if (password.length < 6) throw demoError('Password minimal 6 karakter.', 'WEAK_PASSWORD');
      const users = readDemoUsers();
      if (users.some(user => user.id.toLowerCase() === id.toLowerCase())) throw demoError('ID tersebut sudah digunakan. Silakan pilih ID lain.', 'ID_EXISTS');
      users.push({ id, name, department, level:level || '-', password, role:'User', status:'pending', active:false, createdAt:new Date().toISOString(), approvedAt:'', approvedBy:'' });
      writeDemoUsers(users);
      return { success:true, message:'Permintaan akun berhasil dikirim dan menunggu approval admin.', user:{id,name,status:'pending'} };
    }

    if (action === 'login') {
      const users = readDemoUsers();
      const user = users.find(item => item.id.toLowerCase() === String(payload.id || '').toLowerCase());
      if (!user || user.password !== String(payload.password || '')) throw demoError('ID atau password salah.', 'INVALID_CREDENTIALS');
      if (String(user.role).toLowerCase() !== 'admin') {
        if (user.status === 'pending') throw demoError('Akun Anda masih menunggu approval admin.', 'PENDING_APPROVAL');
        if (user.status === 'rejected') throw demoError('Permintaan akun Anda ditolak. Hubungi admin/trainer untuk informasi lebih lanjut.', 'ACCOUNT_REJECTED');
      }
      if (!user.active) throw demoError('Akun belum aktif. Hubungi admin/trainer.', 'ACCOUNT_INACTIVE');
      const safeUser = safeDemoUser(user);
      return { success:true, token:randomToken('demo-session'), user:safeUser, expiresAt:Date.now() + 6 * 60 * 60 * 1000 };
    }
    if (action === 'logout') return { success:true };

    const user = demoSessionUser();
    if (action === 'bootstrap') {
      const results = userResults(user.id).sort((a,b)=>new Date(b.date)-new Date(a.date));
      const progress = createProgress(results);
      const scores = results.map(item => item.score);
      const modules = moduleList();
      const readingProgress = readingForUser(user.id);
      const modulesRead = readingProgress.filter(item=>Number(item.progress)>=100).length;
      const totalModules = modules.filter(item=>item.hasMaterial).length;
      return { success:true, user, modules, progress, readingProgress, results, summary:{ attempts:results.length, averageScore:scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0, bestScore:scores.length?Math.max(...scores):0, modulesRead, totalModules, readingPercent:totalModules?Math.round(modulesRead/totalModules*100):0 } };
    }
    if (action === 'getModule') {
      const name = String(payload.module || '').trim().toUpperCase();
      const material = demoModules.find(item => item.name.toUpperCase() === name);
      if (!material) throw demoError('Materi modul belum tersedia.', 'MODULE_NOT_FOUND');
      const saved = readingForUser(user.id).find(item=>String(item.module).toUpperCase()===name) || {module:material.name,progress:0,lastSection:0};
      return {success:true,module:material,progress:saved};
    }
    if (action === 'saveReadingProgress') {
      const name = String(payload.module || '').trim().toUpperCase();
      const material = demoModules.find(item => item.name.toUpperCase() === name);
      if (!material) throw demoError('Materi modul belum tersedia.', 'MODULE_NOT_FOUND');
      const rows = readDemoReading();
      const idx = rows.findIndex(item=>String(item.userId).toLowerCase()===String(user.id).toLowerCase() && String(item.module).toUpperCase()===name);
      const progressValue = Math.max(0,Math.min(100,Number(payload.progress)||0));
      const lastSection = Math.max(0,Math.min(material.sections.length-1,Number(payload.lastSection)||0));
      const previous = idx >= 0 ? rows[idx] : {};
      const row = {userId:user.id,module:material.name,progress:Math.max(Number(previous.progress)||0,progressValue),lastSection,startedAt:previous.startedAt||new Date().toISOString(),completedAt:progressValue>=100?(previous.completedAt||new Date().toISOString()):'',updatedAt:new Date().toISOString()};
      if (idx >= 0) rows[idx]=row; else rows.push(row);
      writeDemoReading(rows);
      return {success:true,progress:{module:row.module,progress:row.progress,lastSection:row.lastSection,startedAt:row.startedAt,completedAt:row.completedAt,updatedAt:row.updatedAt}};
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
      const accounts = readDemoUsers().filter(item=>String(item.role).toLowerCase() !== 'admin').map(({password,...safe})=>({...safe,modulesRead:readingForUser(safe.id).filter(row=>Number(row.progress)>=100).length})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
      const avg = results.length ? Math.round(results.reduce((sum,row)=>sum+Number(row.score),0)/results.length) : 0;
      const moduleStats = moduleList().map(module=>{
        const rows=results.filter(row=>row.module===module.name); return {module:module.name, attempts:rows.length, averageScore:rows.length?Math.round(rows.reduce((sum,row)=>sum+Number(row.score),0)/rows.length):0};
      });
      return { success:true, summary:{totalUsers:accounts.length,pendingUsers:accounts.filter(account=>account.status==='pending').length,totalAttempts:results.length,averageScore:avg,remedialCount:results.filter(row=>row.score<cfg.PASSING_SCORE).length},moduleStats,results,accounts };
    }
    if (action === 'adminUpdateUserStatus') {
      if (String(user.role).toLowerCase() !== 'admin') throw authError();
      const id = String(payload.id || '').trim();
      const status = String(payload.status || '').toLowerCase();
      if (!['approved','rejected'].includes(status)) throw demoError('Status akun tidak valid.', 'INVALID_STATUS');
      const users = readDemoUsers();
      const index = users.findIndex(item=>item.id.toLowerCase() === id.toLowerCase() && String(item.role).toLowerCase() !== 'admin');
      if (index < 0) throw demoError('Akun peserta tidak ditemukan.', 'USER_NOT_FOUND');
      users[index].status = status;
      users[index].active = status === 'approved';
      users[index].approvedAt = new Date().toISOString();
      users[index].approvedBy = user.id;
      writeDemoUsers(users);
      return { success:true, user:safeDemoUser(users[index]), message:status==='approved'?'Akun berhasil disetujui.':'Akun berhasil ditolak.' };
    }
    throw new Error(`Aksi demo tidak dikenal: ${action}`);
  }

  window.AEON_API = Object.freeze({
    demoMode,
    isConfigured,
    getSession:getStoredSession,
    login,
    register,
    getModule,
    saveReadingProgress,
    logout,
    health:()=>request('health',{}, {timeout:12000}),
    bootstrap:()=>request('bootstrap',{}, {timeout:60000}),
    startQuiz:payload=>request('startQuiz',payload),
    submitQuiz:payload=>request('submitQuiz',payload,{timeout:45000}),
    adminDashboard:()=>request('adminDashboard',{}, {timeout:60000}),
    adminUpdateUserStatus:payload=>request('adminUpdateUserStatus',payload),
    clearSession:()=>setStoredSession(null)
  });
})();
