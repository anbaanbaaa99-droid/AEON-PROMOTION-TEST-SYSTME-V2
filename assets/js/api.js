(function () {
  'use strict';

  const cfg = window.APP_CONFIG;
  const isConfigured = /^https:\/\/script\.google\.com\/.+\/exec(?:\?.*)?$/i.test(cfg.API_URL || '');
  const demoMode = !isConfigured && cfg.ENABLE_DEMO_WHEN_UNCONFIGURED;
  const SESSION_KEY = 'aeon_session_v5';
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

  const demoModules = [{"name":"HORENSO","title":"HORENSO — Lancar Tanpa Hambatan","summary":"Komunikasi kerja yang menekankan kesamaan persepsi, kemampuan menyimak dan berbicara, menerima instruksi dengan benar, serta praktik HORENSO dan PDCA.","description":"Komunikasi, instruksi, HORENSO dan PDCA","readingMinutes":12,"sections":[{"title":"Kesamaan persepsi sebagai dasar komunikasi","body":"Setiap orang dapat melihat situasi yang sama dengan sudut pandang berbeda. Dalam pekerjaan, menyamakan persepsi membantu mengurangi salah pengertian dan memperlancar koordinasi.","bullets":["Pastikan maksud, fakta, dan tujuan dipahami dengan cara yang sama.","Jangan menganggap lawan bicara otomatis memiliki konteks yang sama.","Gunakan konfirmasi untuk menutup perbedaan pemahaman."]},{"title":"Menyimak secara aktif","body":"Menyimak berarti menunjukkan ketertarikan dan empati sambil fokus pada pembicaraan sampai selesai. Modul menekankan lima kebiasaan: memberi respons, mengangguk, kontak mata, mengulang poin penting, dan mencatat.","bullets":["Catat poin penting dengan kerangka 5W2H.","Menyimak membantu membangun rasa percaya.","Pendengar memperoleh pemahaman lebih baik tentang cara berpikir lawan bicara."]},{"title":"Berbicara agar mudah dipahami","body":"Sebelum berbicara, pilah isi dan atur urutannya. Salah satu pola yang ditunjukkan modul adalah menyampaikan kesimpulan terlebih dahulu, lalu progres dan alasan atau penjelasan yang diperlukan.","bullets":["Gunakan sikap yang baik dan bahasa yang jelas.","Hindari sikap antipati terhadap lawan bicara.","Sesuaikan detail dengan kebutuhan penerima informasi."]},{"title":"Menerima instruksi dan perintah","body":"Saat dipanggil, beri respons jelas dan siapkan memo. Dengarkan instruksi sampai selesai sambil mencatat, ringkas kembali isi yang dipahami, tanyakan bagian yang belum jelas, lalu pastikan prioritas terhadap pekerjaan lain.","bullets":["Jangan memotong instruksi sebelum selesai.","Konfirmasi ulang untuk memastikan pemahaman.","Periksa urutan prioritas bila ada beberapa pekerjaan."]},{"title":"HORENSO dan PDCA","body":"HORENSO digunakan agar laporan, informasi, dan konsultasi mengalir dengan baik dalam pekerjaan. Materi menempatkannya bersama PDCA sebagai bagian dari cara kerja yang membantu pekerjaan berjalan lancar dan hambatan ditangani lebih dini.","bullets":["Hokoku: laporan.","Renraku: komunikasi/informasi.","Sodan: konsultasi."]}],"sourcePdf":"assets/modules/horenso.pdf"},{"name":"JISEKI","title":"JISEKI — Bekerja dengan Ownership","summary":"Membangun kesadaran sebagai pihak yang terlibat, mengambil tanggung jawab, dan menghadapi masalah secara proaktif tanpa melempar kesalahan kepada orang lain.","description":"Toujisha Ishiki, Jiseki, Taseki dan ownership","readingMinutes":10,"sections":[{"title":"Toujisha Ishiki, Jiseki, dan Taseki","body":"Toujisha Ishiki adalah kesadaran bahwa masalah atau pekerjaan juga merupakan bagian dari diri kita. Jiseki bergerak lebih jauh: memposisikan diri sebagai penanggung jawab dan mengambil tindakan. Taseki adalah kecenderungan menyerahkan tanggung jawab atau menyalahkan pihak lain.","bullets":["Toujisha Ishiki: rasa memiliki dan mau terlibat.","Jiseki: komitmen nyata sebagai penanggung jawab.","Taseki: melepaskan tanggung jawab dan mencari penyebab di luar diri."]},{"title":"Empat pola pikir saat menghadapi kondisi sulit","body":"Modul menjelaskan empat respons yang umum muncul: menghindar, menyangkal tanggung jawab, melakukan pembenaran diri, atau mengasumsikan tanggung jawab. Jiseki ditunjukkan pada pola terakhir, yaitu menghadapi masalah secara proaktif dan mencari solusi.","bullets":["Menghindar: lari dari situasi yang tidak menyenangkan.","Menyangkal: menyatakan bukan tanggung jawab pribadi.","Pembenaran diri: merasa ucapan atau tindakan sendiri selalu benar.","Mengasumsikan tanggung jawab: proaktif mencari jalan keluar."]},{"title":"Ownership dalam tindakan","body":"Ownership tidak berhenti pada rasa peduli. Seseorang yang ber-Jiseki mengakui fakta, melihat kontribusi dirinya terhadap situasi, lalu mengambil langkah yang diperlukan untuk memperbaiki keadaan.","bullets":["Akui kesalahan bila memang terjadi.","Tanyakan apa yang dapat dilakukan dari posisi kita.","Jangan berhenti pada alasan atau siapa yang salah."]},{"title":"Contoh di tempat kerja","body":"Membantu menyelesaikan persoalan toko walaupun bukan tugas langsung menunjukkan Toujisha Ishiki. Mengakui keterlambatan laporan lalu segera mencari solusi menunjukkan Jiseki. Menyalahkan bawahan karena data terlambat adalah contoh Taseki.","bullets":["Ukuran utamanya adalah keterlibatan dan tindakan.","Fokus pada solusi yang bisa dikendalikan.","Jadikan masalah sebagai kesempatan memperbaiki cara kerja."]}],"sourcePdf":"assets/modules/jiseki.pdf"},{"name":"KYO","title":"K.Y.O. — Know Yourself and Others","summary":"Memahami diri sendiri dan orang lain melalui Johari Window dan egogram agar komunikasi lebih profesional, efektif, dan sesuai dengan situasi serta lawan bicara.","description":"Johari Window, egogram dan komunikasi","readingMinutes":13,"sections":[{"title":"Tujuan KYO","body":"KYO bertujuan membantu peserta memahami karakteristik diri sendiri dan orang lain sehingga komunikasi menjadi lancar, efektif, profesional, dan mendukung lingkungan kerja yang kondusif.","bullets":["Kenali karakter dan cara pandang diri.","Pahami bahwa orang lain dapat memiliki karakter berbeda.","Sesuaikan sikap berdasarkan situasi dan lawan bicara."]},{"title":"Johari Window","body":"Johari Window membagi informasi tentang diri ke empat area: Open, Blind, Hidden, dan Unknown. Kerangka ini digunakan untuk meningkatkan kesadaran diri dan mendukung kinerja kelompok.","bullets":["Open Area: diketahui diri sendiri dan orang lain.","Blind Area: diketahui orang lain tetapi tidak disadari diri sendiri.","Hidden Area: diketahui diri sendiri tetapi tidak diketahui orang lain.","Unknown Area: belum diketahui keduanya."]},{"title":"Memperluas Open Area","body":"Area terbuka diperluas melalui pengungkapan diri yang tepat dan penerimaan feedback yang jujur. Open Area yang lebih luas membantu menyelaraskan persepsi, memperkuat kepercayaan, serta mengurangi konflik dan miskomunikasi.","bullets":["Self-disclosure membantu mengecilkan Hidden Area.","Feedback membantu mengecilkan Blind Area.","Respons terhadap feedback perlu terbuka dan reflektif."]},{"title":"Egogram dan komunikasi ideal","body":"Egogram membantu melihat kecenderungan ego state. Modul menekankan bahwa dinamika komunikasi yang paling ideal untuk pekerjaan adalah Adult-to-Adult: objektif, profesional, dan berorientasi pada tujuan.","bullets":["Interaksi yang komplementer belum tentu selalu sehat.","Adult-to-Adult mendukung pertukaran informasi dan pemecahan masalah.","Komunikasi perlu disesuaikan agar tetap profesional."]},{"title":"Memahami kemampuan orang lain","body":"Untuk membantu kemampuan rekan kerja berkembang, modul memberi tiga langkah: observasi, pahami, lalu sesuaikan. Kemampuan tidak selalu langsung terlihat dan dapat muncul lebih baik di lingkungan yang tepat.","bullets":["Observasi kemampuan secara sadar.","Pahami kekuatan dan potensi tiap orang.","Sesuaikan peran atau lingkungan agar potensinya berkembang."]}],"sourcePdf":"assets/modules/kyo.pdf"},{"name":"TWIJI","title":"TWIJI — Training Within Industry Job Instruction","summary":"Cara mengajarkan pekerjaan dengan baik melalui OJT yang terencana, berkelanjutan, terukur, dan disesuaikan dengan kemampuan peserta.","description":"OJT dan Job Instruction","readingMinutes":14,"sections":[{"title":"Mengapa edukasi dan OJT penting","body":"Materi menempatkan pendidikan sebagai bagian penting dari peran atasan. OJT sehari-hari memengaruhi pertumbuhan bawahan karena bawahan banyak belajar dari contoh dan cara kerja atasannya.","bullets":["Mendidik tim adalah bagian dari tugas atasan.","OJT membantu karyawan siap bekerja.","Pengembangan orang juga menyiapkan pemimpin masa depan."]},{"title":"Prinsip OJT — 5W2H","body":"OJT dilakukan oleh atasan langsung kepada tim, di area kerja dan saat pekerjaan berlangsung. Yang diajarkan mencakup keterampilan, nilai, dan cara kerja; pelaksanaannya perlu direncanakan sesuai kebutuhan dan dilakukan terus menerus.","bullets":["Who: atasan langsung.","Whom: anggota tim.","What: skill, nilai, cara kerja.","Where/When: area kerja saat pekerjaan dilakukan.","How: rencana, praktik, diskusi dan tanya jawab."]},{"title":"Enam langkah melakukan OJT","body":"Alur OJT dalam modul dimulai dari memahami level yang diharapkan, mengidentifikasi poin edukasi, membuat rencana, melakukan edukasi, memastikan hasil, lalu mengulang atau memberi edukasi tambahan bila diperlukan.","bullets":["1. Memahami level yang diharapkan.","2. Identifikasi poin edukasi.","3. Membuat rencana edukasi.","4. Melakukan edukasi.","5. Memastikan hasil edukasi.","6. Ulangi dan edukasi tambahan."]},{"title":"Mengukur keberhasilan OJT","body":"OJT tidak cukup dilakukan sekali. Keberhasilannya ditinjau melalui target, agenda yang jelas, komunikasi dengan peserta, pengecekan progres berkala, feedback, dan continuous improvement.","bullets":["Bandingkan kemampuan aktual dengan standar yang diharapkan.","Tetapkan tugas atau tujuan berikutnya.","Perbaiki rencana bila hasil belum sesuai."]},{"title":"Lembar Penjabaran Pekerjaan","body":"Dokumentasi pekerjaan membantu pemberi OJT menyampaikan materi secara konsisten dan sederhana. Bagi peserta, dokumen ini memberi arahan yang jelas serta menjelaskan mengapa pekerjaan perlu dilakukan dan dampak bila tidak dilakukan.","bullets":["Standarkan materi OJT.","Jabarkan pekerjaan secara detail.","Gunakan bahasa yang mudah dipahami.","Jelaskan alasan di balik langkah penting."]}],"sourcePdf":"assets/modules/twiji.pdf"},{"name":"DOUKIZUKE","title":"DOUKIZUKE — Motivation","summary":"Memahami alasan orang termotivasi atau tidak, teori motivasi, faktor kepuasan kerja, dan cara memberi feedback untuk mendorong tim secara efektif.","description":"Motivasi, Herzberg dan feedback","readingMinutes":10,"sections":[{"title":"Tujuan Doukizuke","body":"Modul bertujuan membantu peserta memahami teori motivasi agar dapat memotivasi tim dengan lebih efektif, mengetahui penyebab seseorang termotivasi atau tidak, dan menguasai feedback yang efektif.","bullets":["Kenali sumber motivasi anggota tim.","Pahami teori motivasi, bukan hanya mengandalkan intuisi.","Gunakan feedback sebagai alat pengembangan."]},{"title":"Tiga hal yang dirasakan melalui bekerja","body":"Materi menyoroti tiga pengalaman penting dalam bekerja: perasaan berkontribusi, perasaan bertumbuh, dan perasaan bekerja sama dengan orang lain.","bullets":["Kontribusi kepada masyarakat, perusahaan, atau organisasi.","Pertumbuhan melalui pekerjaan yang dilakukan.","Kerja sama dengan orang-orang lain dalam tim."]},{"title":"Apa yang dimaksud motivasi","body":"Motivasi digambarkan sebagai dorongan untuk bertindak menuju tujuan, menentukan arah, dan menopang atau meneruskan tindakan tersebut.","bullets":["Motivasi memengaruhi arah tindakan.","Motivasi membantu mempertahankan usaha.","Sumber dorongan tiap orang dapat berbeda."]},{"title":"Teori dua faktor Herzberg","body":"Modul membedakan faktor kesehatan/hygiene yang bersifat ekstrinsik dengan faktor motivasi yang bersifat intrinsik. Faktor hygiene mencegah ketidakpuasan, sedangkan faktor motivasi dapat menumbuhkan semangat ketika terpenuhi.","bullets":["Hygiene: kebijakan, hubungan antar manusia, lingkungan kerja, status, keamanan, gaji, kehidupan pribadi.","Motivator: pencapaian, pengakuan, pekerjaan itu sendiri, tanggung jawab, promosi, peluang bertumbuh."]}],"sourcePdf":"assets/modules/doukizuke.pdf"},{"name":"ALEC","title":"ALEC — Active Listening for Effective Communication","summary":"Cara mendengar, berbicara, bertanya, memberi petunjuk, dan menerima HORENSO untuk mendorong rekan kerja menjadi lebih mandiri.","description":"Komunikasi efektif untuk mendorong kemandirian","readingMinutes":11,"sections":[{"title":"Menyesuaikan pendekatan dengan kematangan rekan","body":"Pendekatan komunikasi perlu berubah sesuai tingkat kematangan lawan bicara. Semakin mandiri seseorang, peran atasan dapat bergeser dari berhadapan langsung dan memberi petunjuk menuju mendukung dari belakang.","bullets":["Perhatikan kemampuan melakukan pekerjaan utama.","Perhatikan keyakinan dalam bertindak.","Dorong cara pandang yang lebih luas dan rasa sebagai pemeran utama."]},{"title":"Memberikan petunjuk dan perintah","body":"Petunjuk diberikan pada waktu yang tepat dengan menjelaskan tujuan pekerjaan, standar atau batas waktu, serta bahan penjelasan jika tugas rumit. Untuk pekerjaan sulit, prediksi situasi dan jelaskan kapan peserta harus meminta bantuan.","bullets":["Jelaskan tujuan, bukan hanya perintah.","Sampaikan standar seperti kualitas atau SLA.","Tentukan kapan progress report diperlukan."]},{"title":"Menjelaskan situasi — WHY dan manfaat bagi pelaksana","body":"Agar orang memahami makna pekerjaan, jelaskan tujuan sebenarnya bagi perusahaan atau masyarakat. Modul juga meminta atasan menjelaskan apa yang diperoleh pelaksana dari pekerjaan tersebut untuk menumbuhkan motivasi dari dalam.","bullets":["The WHY: alasan dan makna pekerjaan.","What's in it for me?: manfaat atau pembelajaran bagi pelaksana.","Penjelasan yang baik membantu membangun rasa percaya."]},{"title":"Kemampuan bertanya","body":"Pertanyaan dapat digunakan untuk memperoleh informasi yang belum diketahui atau untuk membuat lawan bicara berpikir. Pertanyaan yang menggali membantu membangun kemampuan memecahkan masalah dan melihat situasi dari sudut pandang berbeda.","bullets":["Pertanyaan tertutup memiliki jawaban terbatas.","Pertanyaan terbuka memberi ruang berpikir lebih luas.","Gunakan pertanyaan untuk mendorong kemandirian, bukan memberi semua jawaban."]},{"title":"Mendengar aktif dan menerima HORENSO","body":"Lima poin mendengar aktif dalam modul adalah membuang sikap menyalahkan, mendengarkan seluruh isi, menggunakan feedback, memperhatikan bahasa tubuh, dan menahan emosi. Saat menerima laporan atau konsultasi, dengarkan dahulu lalu gunakan pertanyaan yang menuntun tindakan berikutnya.","bullets":["Akui hasil kerja ketika menerima laporan.","Tanyakan apa yang akan dilakukan selanjutnya, bagaimana, dan kapan.","Saat konsultasi, gali opsi, pilihan terbaik, kebutuhan dukungan, dan berikan harapan."]}],"sourcePdf":"assets/modules/alec.pdf"},{"name":"AEON IDEAL","title":"AEON Foundational Ideal — Prinsip Dasar AEON","summary":"Prinsip dasar yang menempatkan pelanggan sebagai pusat, sekaligus menegaskan perdamaian, kemanusiaan, komunitas setempat, dan inovasi berkelanjutan.","description":"Customer First, peace, humanity dan local community","readingMinutes":10,"sections":[{"title":"Empat orientasi prinsip dasar","body":"Prinsip Dasar AEON berorientasi kepada pelanggan, mendukung perdamaian, menjunjung tinggi kemanusiaan, dan berkontribusi pada komunitas setempat.","bullets":["Pelanggan sebagai pusat keputusan.","Perdamaian membutuhkan keterlibatan aktif.","Menghormati martabat dan potensi manusia.","Bertumbuh bersama komunitas setempat."]},{"title":"Ritel dan perdamaian","body":"Materi menjelaskan bahwa industri ritel hanya dapat berkembang dalam keadaan damai. Karena itu perdamaian bukan sesuatu yang datang sendiri, melainkan perlu dijaga melalui kesadaran dan keterlibatan aktif.","bullets":["AEON tidak melakukan kegiatan yang merusak perdamaian.","Ritel dipandang sebagai industri yang berkaitan erat dengan kehidupan damai.","Kontribusi pada perdamaian menjadi bagian dari tujuan AEON."]},{"title":"Kemanusiaan dan potensi individu","body":"AEON memercayai, menghormati, dan menghargai setiap individu. Prinsip ini mencakup penghormatan terhadap karakter, martabat, otonomi, serta keyakinan bahwa manusia dapat tumbuh melalui pekerjaan dan pembelajaran.","bullets":["Hargai perbedaan antar individu.","Percaya pada kemampuan dan aspirasi manusia.","Hubungan antar-manusia ikut membentuk kebahagiaan dan norma sosial."]},{"title":"Komunitas setempat","body":"Ritel berbasis pada komunitas setempat dan berkembang bersama komunitas tersebut. Materi menekankan penghormatan terhadap keragaman dan kemandirian tiap daerah serta upaya berkelanjutan memenuhi kebutuhan lokal.","bullets":["Kenali kebutuhan khas daerah.","Dukung kesejahteraan masyarakat setempat.","Kontribusi lokal perlu dilakukan berkesinambungan."]},{"title":"Customer First dan inovasi","body":"Customer First berarti tidak menempatkan kenyamanan diri atau perusahaan sebagai prioritas utama. Orientasi pelanggan dijadikan standar keputusan dan tindakan, sekaligus menuntut AEON terus memperbaiki diri dan mengantisipasi perubahan gaya hidup pelanggan serta harapan masyarakat.","bullets":["Gunakan pelanggan sebagai cermin dalam keputusan.","Tolak pilihan yang hanya nyaman bagi diri sendiri jika merugikan orientasi pelanggan.","Terus berinovasi agar tidak stagnan."]}],"sourcePdf":"assets/modules/aeon-foundational-ideal.pdf"},{"name":"FUTURE VISION","title":"Future Vision — Visi Masa Depan Grup AEON","summary":"Visi untuk ikut menciptakan gaya hidup masa depan yang membawa kebahagiaan individu, masyarakat yang lebih cerah, serta kehidupan damai dan penuh senyuman.","description":"Visi masa depan, pelanggan dan MIRAI","readingMinutes":9,"sections":[{"title":"Pernyataan visi","body":"Visi Grup AEON adalah menciptakan gaya hidup di masa depan yang dapat membuat senyum mengembang di wajah setiap orang. Orientasi kepada pelanggan tetap menjadi hal yang tidak berubah.","bullets":["Ranah yang dibahas adalah gaya hidup pelanggan.","Tujuan akhirnya terkait kesejahteraan dan kebahagiaan.","Pelanggan tetap menjadi pusat."]},{"title":"Dari menyesuaikan menjadi ikut menciptakan masa depan","body":"Visi baru menekankan pemahaman yang lebih dalam atas maksud dan keinginan setiap individu pelanggan. AEON tidak hanya ingin menyesuaikan diri terhadap masa depan yang berubah, tetapi ikut menciptakan gaya hidup masa depan.","bullets":["Pelanggan memiliki kebutuhan yang beragam.","Perubahan masa depan tidak cukup hanya diikuti.","Inovasi diarahkan untuk menciptakan pengalaman hidup baru."]},{"title":"AEON dan MIRAI","body":"Dalam booklet, MIRAI digunakan sebagai tokoh yang mewakili 'masa depan'. Cerita mengajak melihat lebih jauh dari masa depan yang tampak dekat dan membayangkan pemandangan masa depan yang ingin diwujudkan.","bullets":["MIRAI berarti masa depan.","Masa depan makin sulit diprediksi.","Visi membantu memberi arah pada masa depan yang ingin diciptakan."]},{"title":"Masa depan yang ingin diwujudkan","body":"AEON menggambarkan masa depan yang menggabungkan kehidupan masyarakat yang lebih cerah ceria dengan kebahagiaan sejati setiap individu, sehingga pelanggan dapat hidup dengan damai dan penuh senyuman.","bullets":["Kehidupan masyarakat yang lebih cerah ceria.","Kebahagiaan sejati dirinya.","Hidup dengan damai dan penuh senyuman."]},{"title":"Perubahan masyarakat dan kebutuhan batin","body":"Kemajuan teknologi memperluas potensi manusia, tetapi masalah lingkungan dan kesenjangan juga dapat meningkat. Dalam kondisi itu, pelanggan diperkirakan semakin mencari jati diri, empati, kepercayaan, dan kebahagiaan yang bersumber dari dalam.","bullets":["Perhatikan sisi positif dan negatif perubahan masyarakat.","Teknologi bukan satu-satunya ukuran kemajuan.","Kebahagiaan individu dan kemajuan masyarakat perlu diwujudkan bersama."]}],"sourcePdf":"assets/modules/future-vision.pdf"},{"name":"AEON FIGURE","title":"AEON Figure 1, 2 & 3","summary":"Dasar perhitungan retail: Cost, Retail, Neire, Sales, Gross Profit, Price Alteration, inventory, Turn Over Day, dan Rotation.","description":"Retail math, gross profit dan inventory","readingMinutes":16,"sections":[{"title":"Figure 1 — Cost, Retail, dan Neire","body":"Cost Price adalah harga beli dari supplier, Retail Price adalah harga jual kepada pelanggan, sedangkan Mark Up/Neire adalah selisih yang menjadi dasar keuntungan antara retail dan cost.","bullets":["Retail Price - Cost Price = Mark Up/Neire.","Mark Up % + Cost % = 100% dari Retail Price.","Retail Price = Cost Price + Mark Up."]},{"title":"Sales, Gross Profit, dan Price Alteration","body":"Saat pelanggan membayar di kasir, nilai retail menjadi Sales. Price Alteration adalah penurunan harga. Cost tetap, sehingga markdown akan memengaruhi Gross Profit yang diperoleh.","bullets":["Sales adalah nilai penjualan barang/jasa.","PA/markdown mengurangi harga jual aktual.","Gross Profit = Sales Retail - Sales Cost."]},{"title":"Efek Price Alteration terhadap Gross Profit","body":"Contoh modul menunjukkan retail 100, cost 75, neire 25, lalu PA 5 menghasilkan sales 95 dan gross profit amount 20. Karena pembaginya berubah menjadi sales aktual, gross profit ratio menjadi sekitar 21,05%, bukan sekadar 20%.","bullets":["GP Amount = Neire Amount - PA Amount pada contoh tersebut.","GP Ratio dihitung terhadap Sales setelah markdown.","Jangan hanya mengurangkan persentase tanpa memperhatikan basis penjualan."]},{"title":"Figure 2 — Inventory, PA, dan Loss","body":"Opening Inventory adalah persediaan awal periode, Purchase menambah inventory selama periode, dan Closing Inventory adalah nilai barang yang tersisa di akhir periode. Materi menghubungkan ketiganya dengan Sales, PA, Loss, Sales Cost, dan Gross Profit.","bullets":["Closing Retail = Opening + Purchase - Sales - PA - Loss.","Sales Cost = [Sales/(Sales+Closing)] × (Opening Cost + Purchase Cost).","GP % = GP Amount / Sales Retail × 100."]},{"title":"Figure 3 — Turn Over Day dan Rotation","body":"Turn Over Day menyatakan berapa hari yang dibutuhkan untuk menghabiskan average stock, sedangkan Rotation menyatakan berapa kali sales bulanan dapat menghabiskan average stock.","bullets":["Turn Over Day = Average Stock / Daily Average Sales.","Rotation = Monthly Sales / Average Stock.","Turn Over Day × Rotation = 30."]}],"sourcePdf":"assets/modules/aeon-figure-1-2-3.pdf"},{"name":"AEON DNA","title":"Semua Demi Pelanggan — AEON DNA","summary":"Sejarah dan prinsip dagang AEON melalui kisah Okadaya: keadilan harga, keberanian berubah, pendidikan manusia, perdamaian, dan kontribusi kepada masyarakat lokal.","description":"Sejarah AEON dan prinsip Semua Demi Pelanggan","readingMinutes":15,"sections":[{"title":"Jiwa pedagang dan orientasi pelanggan","body":"Kisah awal Okadaya menunjukkan semangat untuk aktif mencari peluang dan memahami pelanggan, bukan hanya menunggu. Prinsip ini berkembang menjadi sikap bahwa perdagangan harus berguna bagi pelanggan.","bullets":["Pedagang perlu aktif melihat kebutuhan dan perubahan.","Keputusan dagang dilihat dari sudut pelanggan.","Semangat usaha selalu terkait dengan pelayanan."]},{"title":"Satu produk, satu harga","body":"Pada masa tawar-menawar masih umum, Okadaya menerapkan label harga agar pelanggan memperoleh harga yang sama tanpa membedakan status atau apakah ia pelanggan lama. Ini diposisikan sebagai bentuk perlakuan yang adil.","bullets":["Harga dibuat jelas bagi semua pelanggan.","Keadilan pelanggan lebih penting daripada perlakuan istimewa berdasarkan status.","Kalkulasi dan aturan toko menjadi bagian dari modernisasi pengelolaan."]},{"title":"Bangkit dari reruntuhan dan keberanian berubah","body":"Setelah perang, Okadaya harus beradaptasi dari bisnis kimono ke berbagai kebutuhan sehari-hari. Cerita menggambarkan bahwa perubahan zaman menuntut cara bisnis baru dan keberanian untuk bangkit.","bullets":["Jangan terpaku pada model bisnis lama.","Amati perubahan kebutuhan pelanggan.","Perdamaian memungkinkan kehidupan ritel tumbuh kembali."]},{"title":"Pendidikan dan industri kemanusiaan","body":"Perjalanan Okadaya Management School, Jusco University, dan AEON University menunjukkan keyakinan bahwa pengembangan manusia adalah fondasi perusahaan. Pendidikan dipandang sebagai salah satu kesejahteraan terbesar yang diberikan perusahaan kepada pegawai.","bullets":["Kemampuan karyawan berkaitan dengan kepuasan pelanggan.","Ritel dipandang sebagai industri kemanusiaan.","Belajar dan bekerja menjadi bagian dari pembentukan manusia."]},{"title":"Lokal, kepercayaan, dan Semua Demi Pelanggan","body":"Manajemen perserikatan dan ekspansi ke luar Jepang menekankan kepercayaan serta manajemen yang berakar pada masyarakat lokal. Epilog merangkum ritel sebagai industri yang berkaitan dengan pelanggan, kemanusiaan, perdamaian, dan komunitas.","bullets":["Bangun kepercayaan dalam kerja sama.","Berakar pada kebutuhan masyarakat setempat.","Prinsip yang diwariskan: Semua demi pelanggan."]}],"sourcePdf":"assets/modules/aeon-dna-comic.pdf"},{"name":"MANAGEMENT","title":"Management — Tasks, Responsibilities, Practices","summary":"Ringkasan konsep pilihan Peter F. Drucker tentang kontribusi, tujuan, kinerja, self-control, pengembangan kekuatan, dan tanggung jawab manajer.","description":"Drucker: objectives, contribution, performance dan self-control","readingMinutes":14,"sections":[{"title":"Management berfokus pada kontribusi dan kinerja","body":"Drucker menempatkan tanggung jawab dan performance sebagai pusat pembahasan management. Pekerjaan manajer dinilai dari kontribusinya terhadap hasil yang dibutuhkan organisasi, bukan hanya dari aktivitas yang dilakukan.","bullets":["Tanyakan hasil apa yang harus dicapai.","Hubungkan pekerjaan unit dengan tujuan keseluruhan.","Keterampilan dan teknik adalah sarana, bukan tujuan akhir."]},{"title":"Objectives harus jelas dan terhubung","body":"Setiap manajer perlu memiliki objectives yang jelas tentang hasil unitnya, kontribusi kepada unit lain, dan dukungan yang diperlukan dari unit lain. Objectives tersebut harus diturunkan dari tujuan perusahaan dan menekankan teamwork serta team results.","bullets":["Tujuan individu tidak boleh terlepas dari tujuan organisasi.","Pertimbangkan hasil jangka pendek dan jangka panjang.","Seimbangkan sasaran bisnis dengan pengembangan manusia dan tanggung jawab publik."]},{"title":"Management by Objectives and Self-Control","body":"MBO dan self-control memberi arah bersama sekaligus menempatkan kontrol terutama pada disiplin diri. Manajer bertindak karena tuntutan objective yang dipahami, bukan hanya karena diperintah dari atas.","bullets":["Arah bersama harus jelas.","Informasi kinerja membantu manajer mengendalikan pekerjaannya sendiri.","Self-control menuntut tanggung jawab yang tinggi."]},{"title":"Membuat kekuatan manusia menjadi efektif","body":"Drucker berangkat dari asumsi bahwa orang ingin bertanggung jawab, berkontribusi, dan mencapai sesuatu. Tugas manajer adalah membuat kekuatan orang menjadi efektif dan menciptakan kondisi agar kontribusi itu dapat terjadi.","bullets":["Fokus pada kekuatan yang konsisten terlihat.","Jangan membangun sistem berdasarkan asumsi bahwa semua orang malas atau tidak bertanggung jawab.","Gunakan tujuan dan feedback untuk mengarahkan kontribusi."]},{"title":"Self-development","body":"Motivasi untuk pengembangan diri harus muncul dari dalam, tetapi atasan dan perusahaan dapat memberi dorongan, arahan, pengalaman, dan contoh. Penilaian pengembangan sebaiknya dimulai dari performance terhadap objectives dan kekuatan yang dimiliki.","bullets":["Refleksikan apa yang sudah dilakukan dengan baik.","Identifikasi keterampilan atau pengalaman yang perlu dikembangkan.","Atasan yang terus belajar memberi contoh kuat bagi tim."]}],"sourcePdf":"assets/modules/management-drucker.pdf"}];

  const demoQuestions = [
    q("HOR-01","HORENSO","Easy","Menurut modul, salah satu cara menyimak yang benar adalah…",["Memotong pembicaraan agar cepat", "Mengangguk dan memberi respons", "Menghindari kontak mata", "Menyimpulkan sebelum lawan bicara selesai"],"B","Menyimak mencakup memberi respons, mengangguk, kontak mata, mengulang, dan mencatat."),
    q("HOR-02","HORENSO","Medium","Poin penting saat menyimak dianjurkan dicatat menggunakan kerangka…",["3S", "4M", "5W2H", "SWOT"],"C","Modul menyebut pencatatan poin penting berdasarkan 5W2H."),
    q("HOR-03","HORENSO","Medium","Setelah menerima instruksi sampai selesai, langkah berikut yang paling sesuai adalah…",["Langsung pergi tanpa konfirmasi", "Meringkas kembali isi instruksi yang dipahami", "Menyerahkan tugas kepada rekan", "Menunggu atasan mengulang sendiri"],"B","Penerima instruksi diminta merangkum kembali isi instruksi untuk mengonfirmasi pemahaman."),
    q("HOR-04","HORENSO","Hard","Jika Anda sudah memiliki pekerjaan lain ketika mendapat instruksi baru, modul menganjurkan untuk…",["Mengerjakan yang paling mudah", "Mengabaikan instruksi baru", "Memastikan urutan prioritas pekerjaan", "Mengerjakan keduanya tanpa bertanya"],"C","Prosedur menerima instruksi mencakup memastikan prioritas terhadap pekerjaan lain."),
    q("HOR-05","HORENSO","Medium","Urutan berbicara yang dicontohkan dalam modul adalah…",["Alasan → pembukaan → kesimpulan", "Kesimpulan → progres → alasan", "Detail → lelucon → kesimpulan", "Pertanyaan → diam → alasan"],"B","Modul memberi contoh penyusunan pesan dari kesimpulan, progres, lalu alasan/penjelasan."),
    q("HOR-06","HORENSO","Easy","Tujuan menyamakan persepsi dalam pekerjaan adalah…",["Memperpanjang diskusi", "Mempermudah dan memperlancar komunikasi", "Menghilangkan semua perbedaan karakter", "Membuat semua orang selalu setuju"],"B","Kesamaan persepsi membantu mengurangi salah pemahaman dan memperlancar komunikasi."),
    q("HOR-07","HORENSO","Medium","Mana yang BUKAN bagian dari HORENSO?",["Hokoku", "Renraku", "Sodan", "Kaizen"],"D","HORENSO terdiri dari Hokoku, Renraku, dan Sodan."),
    q("HOR-08","HORENSO","Medium","Salah satu hasil dari menyimak dengan baik menurut modul adalah…",["Menurunkan kepercayaan", "Mendapat lebih sedikit informasi", "Meningkatkan rasa saling percaya", "Membuat lawan bicara bergantung"],"C","Menyimak yang baik membantu meningkatkan rasa saling percaya."),
    q("JIS-01","JISEKI","Easy","Jiseki paling tepat menggambarkan sikap…",["Memposisikan diri sebagai penanggung jawab", "Menunggu pihak lain menyelesaikan masalah", "Menyalahkan keadaan", "Menghindari semua risiko"],"A","Jiseki menempatkan diri sebagai penanggung jawab dan diikuti tindakan nyata."),
    q("JIS-02","JISEKI","Easy","Taseki adalah kecenderungan untuk…",["Mengambil tanggung jawab penuh", "Mencari solusi bersama", "Menyerahkan tanggung jawab atau menyalahkan pihak lain", "Membantu walau bukan tugas langsung"],"C","Taseki berarti melepaskan tanggung jawab dan mengarahkannya kepada pihak lain atau keadaan."),
    q("JIS-03","JISEKI","Medium","Dari empat pola pikir saat menghadapi kondisi sulit, pola yang sesuai Jiseki adalah…",["Menghindar", "Menyangkal tanggung jawab", "Pembenaran diri", "Mengasumsikan tanggung jawab"],"D","Jiseki ditunjukkan dengan menerima tanggung jawab, menghadapi masalah, dan mencari solusi."),
    q("JIS-04","JISEKI","Medium","Membantu menyelesaikan masalah toko walau bukan tugas langsung paling dekat dengan…",["Toujisha Ishiki", "Taseki", "Pembenaran diri", "Menghindar"],"A","Toujisha Ishiki adalah rasa memiliki dan kesadaran sebagai pihak yang terlibat."),
    q("JIS-05","JISEKI","Medium","Seorang staf terlambat membuat laporan dan berkata, 'Saya terlambat; saya akan cek penyebab dan segera memperbaikinya.' Ini contoh…",["Taseki", "Jiseki", "Menghindar", "Menyangkal"],"B","Ia mengakui fakta dan mengambil tindakan sebagai penanggung jawab."),
    q("JIS-06","JISEKI","Hard","Kalimat yang paling mencerminkan Taseki adalah…",["Saya akan cek apa yang bisa saya perbaiki", "Saya ikut bantu karena ini masalah tim", "Laporan terlambat karena bawahan tidak mengirim data", "Saya akan mengambil langkah koreksi"],"C","Menyalahkan bawahan tanpa mengambil tanggung jawab adalah contoh Taseki dalam modul."),
    q("JIS-07","JISEKI","Medium","Perbedaan utama Toujisha Ishiki dan Jiseki adalah…",["Toujisha hanya untuk atasan", "Jiseki menekankan komitmen tindakan sebagai penanggung jawab", "Toujisha berarti menyalahkan orang lain", "Tidak ada perbedaan"],"B","Toujisha Ishiki menekankan kesadaran/rasa memiliki, sedangkan Jiseki menekankan sikap dan tindakan sebagai penanggung jawab."),
    q("JIS-08","JISEKI","Easy","Saat masalah muncul, fokus Jiseki adalah…",["Siapa yang bisa disalahkan", "Bagaimana mengambil tanggung jawab dan mencari solusi", "Cara menghindari keterlibatan", "Membuktikan diri selalu benar"],"B","Jiseki mengarah pada tanggung jawab dan penyelesaian proaktif."),
    q("KYO-01","KYO","Easy","Johari Window digunakan terutama untuk membantu…",["Menghitung stok", "Memahami diri dan hubungan dengan orang lain", "Menentukan harga jual", "Membuat jadwal shift"],"B","Johari Window digunakan untuk meningkatkan kesadaran diri dan hubungan dengan orang lain."),
    q("KYO-02","KYO","Easy","Blind Area adalah informasi yang…",["Diketahui diri dan orang lain", "Diketahui orang lain tetapi tidak disadari diri sendiri", "Diketahui diri tetapi tidak orang lain", "Tidak diketahui siapa pun"],"B","Blind Area diketahui oleh orang lain namun tidak disadari oleh diri sendiri."),
    q("KYO-03","KYO","Medium","Cara utama mengecilkan Blind Area adalah…",["Menghindari feedback", "Menerima dan merefleksikan feedback", "Menyembunyikan informasi", "Mengurangi komunikasi"],"B","Feedback membantu menyadari perilaku yang sebelumnya tidak terlihat oleh diri sendiri."),
    q("KYO-04","KYO","Medium","Open Area dapat diperluas melalui…",["Self-disclosure dan feedback", "Menutup komunikasi", "Hanya mengikuti asumsi sendiri", "Menghindari diskusi"],"A","Pengungkapan diri yang tepat dan penerimaan feedback memperluas Open Area."),
    q("KYO-05","KYO","Hard","Dinamika ego state yang dinilai paling ideal untuk komunikasi kerja adalah…",["Parent-to-Child", "Child-to-Child", "Adult-to-Adult", "Parent-to-Parent"],"C","Modul menekankan Adult-to-Adult karena objektif, profesional, dan berorientasi tujuan."),
    q("KYO-06","KYO","Medium","Urutan memahami kemampuan rekan kerja yang ditunjukkan modul adalah…",["Pahami → abaikan → ganti", "Observasi → pahami → sesuaikan", "Nilai → kritik → pindahkan", "Instruksi → kontrol → hukuman"],"B","Modul menyebut langkah Observasi, Pahami, lalu Sesuaikan."),
    q("KYO-07","KYO","Easy","Hidden Area berisi informasi yang…",["Diketahui diri sendiri tetapi tidak diketahui orang lain", "Diketahui orang lain tetapi tidak diri sendiri", "Diketahui semua orang", "Tidak diketahui diri sendiri maupun orang lain"],"A","Hidden Area adalah informasi yang disadari diri tetapi tidak dibagikan kepada orang lain."),
    q("KYO-08","KYO","Medium","Open Area yang lebih luas cenderung menghasilkan…",["Lebih banyak konflik", "Komunikasi lebih efektif dan kepercayaan lebih kuat", "Lebih sedikit kerja sama", "Lebih banyak miskomunikasi"],"B","Kesamaan persepsi dari Open Area yang luas mendukung komunikasi, kepercayaan, dan kolaborasi."),
    q("TWI-01","TWIJI","Easy","Siapa yang terutama melakukan OJT menurut prinsip dalam modul?",["Konsultan eksternal", "Atasan langsung", "Pelanggan", "Hanya HR"],"B","Modul menyebut Who dalam OJT adalah atasan langsung."),
    q("TWI-02","TWIJI","Easy","OJT terutama dilakukan…",["Hanya di kelas", "Di area kerja saat pekerjaan dilakukan", "Setelah jam kerja selalu", "Hanya saat audit"],"B","Where dan When dalam prinsip OJT adalah di area kerja saat melakukan pekerjaan."),
    q("TWI-03","TWIJI","Medium","Langkah pertama dari enam langkah OJT adalah…",["Melakukan edukasi", "Memastikan hasil", "Memahami level yang diharapkan", "Mengulang edukasi"],"C","Alur dimulai dari memahami level atau standar yang diharapkan."),
    q("TWI-04","TWIJI","Medium","Setelah membuat rencana edukasi, langkah berikutnya adalah…",["Melakukan edukasi", "Menghapus target", "Mengganti peserta", "Menutup evaluasi"],"A","Urutannya adalah rencana edukasi lalu pelaksanaan edukasi."),
    q("TWI-05","TWIJI","Hard","Mana kombinasi yang paling sesuai untuk mengukur hasil OJT?",["Target, cek progres, feedback, continuous improvement", "Hanya absensi peserta", "Hanya lama pelatihan", "Hanya penilaian diri atasan"],"A","Modul menyebut target, agenda rinci, komunikasi, cek progres, feedback, dan perbaikan berkelanjutan."),
    q("TWI-06","TWIJI","Medium","Ketika atasan merasa terlalu sibuk untuk OJT, modul mengingatkan bahwa…",["OJT bukan tugas atasan", "Pekerjaan sebaiknya dilakukan sendiri terus", "Memberi pelatihan adalah tugas atasan dan hasil OJT dirasakan kemudian", "OJT cukup dilakukan setahun sekali"],"C","Materi menekankan pelatihan sebagai tugas atasan dan investasi jangka lebih panjang."),
    q("TWI-07","TWIJI","Medium","Salah satu tujuan Lembar Penjabaran Pekerjaan adalah…",["Membuat instruksi berbeda untuk tiap peserta", "Menstandarkan materi OJT dan menjelaskan pekerjaan secara detail", "Mengurangi alasan pekerjaan", "Menggantikan semua praktik kerja"],"B","Dokumen tersebut membantu standarisasi, detail, bahasa sederhana, dan alasan pekerjaan."),
    q("TWI-08","TWIJI","Easy","Salah satu tujuan edukasi dalam modul adalah…",["Mengurangi keterampilan karyawan", "Mempersiapkan pemimpin masa depan", "Menghindari delegasi", "Membatasi kreativitas"],"B","Pengembangan karyawan diposisikan sebagai cara mempersiapkan pemimpin masa depan."),
    q("DOU-01","DOUKIZUKE","Easy","Tiga hal yang dirasakan melalui bekerja dalam modul adalah…",["Kontribusi, bertumbuh, bekerja sama", "Gaji, jabatan, cuti", "Kompetisi, hukuman, kontrol", "Harga, stok, margin"],"A","Materi menyebut perasaan berkontribusi, bertumbuh, dan bekerja sama."),
    q("DOU-02","DOUKIZUKE","Medium","Menurut materi, motivasi membantu seseorang untuk…",["Menghindari semua tujuan", "Bertindak menuju tujuan, menentukan arah, dan meneruskan tindakan", "Menunggu instruksi tanpa bergerak", "Mengurangi tanggung jawab"],"B","Motivasi digambarkan sebagai dorongan untuk bertindak, memberi arah, dan menopang tindakan."),
    q("DOU-03","DOUKIZUKE","Easy","Dalam teori Herzberg pada modul, gaji termasuk…",["Faktor motivasi intrinsik", "Faktor kesehatan/hygiene ekstrinsik", "Bukan faktor apa pun", "Hanya faktor promosi"],"B","Gaji ditempatkan pada faktor kesehatan/hygiene yang bersifat ekstrinsik."),
    q("DOU-04","DOUKIZUKE","Medium","Yang termasuk faktor motivasi intrinsik menurut Herzberg adalah…",["Kebijakan perusahaan", "Keamanan", "Pencapaian", "Gaji"],"C","Pencapaian termasuk faktor motivator/intrinsik."),
    q("DOU-05","DOUKIZUKE","Medium","Peluang untuk bertumbuh termasuk…",["Faktor motivasi", "Faktor kesehatan", "Faktor hukuman", "Faktor administrasi"],"A","Peluang bertumbuh dicantumkan sebagai salah satu faktor motivasi."),
    q("DOU-06","DOUKIZUKE","Hard","Pernyataan yang paling sesuai dengan teori dua faktor dalam modul adalah…",["Faktor hygiene selalu membuat orang sangat termotivasi", "Faktor hygiene mencegah ketidakpuasan, sedangkan motivator dapat menumbuhkan semangat", "Gaji adalah satu-satunya motivator", "Semua faktor memiliki fungsi yang sama"],"B","Modul membedakan faktor hygiene dan motivator berdasarkan fungsi terhadap ketidakpuasan dan semangat."),
    q("DOU-07","DOUKIZUKE","Easy","Tujuan utama modul Doukizuke adalah…",["Menghitung gross profit", "Memahami teori motivasi agar dapat memotivasi tim secara efektif", "Membuat jadwal inventori", "Mengajarkan rumus turnover"],"B","Tujuan modul adalah memahami motivasi dan feedback agar dapat memotivasi tim."),
    q("DOU-08","DOUKIZUKE","Medium","Yang termasuk faktor hygiene adalah…",["Pengakuan", "Pekerjaan itu sendiri", "Lingkungan kerja", "Peluang bertumbuh"],"C","Lingkungan kerja dicantumkan sebagai faktor kesehatan/hygiene."),
    q("ALE-01","ALEC","Easy","Salah satu tujuan ALEC adalah…",["Mendorong rekan kerja menjadi lebih mandiri", "Membuat semua keputusan sendiri", "Mengurangi pertanyaan", "Menghindari HORENSO"],"A","Modul mengembangkan komunikasi untuk mendorong kemandirian bawahan/rekan."),
    q("ALE-02","ALEC","Medium","Saat memberi perintah, hal yang dianjurkan adalah…",["Tidak perlu menjelaskan tujuan", "Menjelaskan tujuan pekerjaan dan standar yang diperlukan", "Selalu memberi instruksi saat orang sibuk", "Menghindari batas waktu"],"B","Petunjuk yang baik menjelaskan tujuan, standar, waktu, dan dukungan yang diperlukan."),
    q("ALE-03","ALEC","Medium","Dalam kemampuan menjelaskan situasi, 'The WHY' berarti…",["Menjelaskan tujuan atau makna pekerjaan", "Menjelaskan gaji", "Membuat ancaman", "Memberi jawaban tanpa alasan"],"A","The WHY digunakan untuk menjelaskan tujuan sebenarnya dari pekerjaan."),
    q("ALE-04","ALEC","Medium","Pertanyaan terbuka digunakan terutama untuk…",["Membatasi jawaban ya/tidak", "Memberi ruang lawan bicara berpikir dan menjelaskan", "Mengakhiri pembicaraan", "Mencegah orang memberi ide"],"B","Pertanyaan terbuka tidak membatasi jawaban dan membantu menggali pemikiran."),
    q("ALE-05","ALEC","Easy","Mana yang termasuk lima poin mendengar aktif?",["Menyalahkan terlebih dahulu", "Menahan emosi", "Mengabaikan bahasa tubuh", "Memotong pembicaraan"],"B","Modul menyebut membuang sikap menyalahkan, mendengarkan, feedback, bahasa tubuh, dan menahan emosi."),
    q("ALE-06","ALEC","Hard","Saat menerima laporan, pertanyaan yang paling mendorong kemandirian adalah…",["Siapa yang salah?", "Apa yang selanjutnya ingin dilakukan, bagaimana, dan kapan?", "Mengapa tidak mengikuti saya saja?", "Sudah, jangan pikirkan lagi"],"B","Modul menggunakan pertanyaan penuntun tentang tindakan berikut, cara, dan waktu."),
    q("ALE-07","ALEC","Medium","Untuk pekerjaan sulit, pemberi instruksi sebaiknya…",["Tidak memprediksi masalah", "Menjelaskan kapan peserta perlu bertanya atau meminta bantuan", "Membiarkan peserta tanpa dukungan", "Menghapus progress report"],"B","Modul menganjurkan memprediksi situasi dan menjelaskan kapan harus bertanya."),
    q("ALE-08","ALEC","Medium","Saat kematangan rekan meningkat, pendekatan atasan cenderung bergerak ke arah…",["Semakin mengambil alih semua tugas", "Lebih mendukung dari belakang", "Semakin banyak hukuman", "Mengurangi komunikasi sepenuhnya"],"B","Diagram modul menunjukkan pergeseran dari pendekatan langsung menuju dukungan dari belakang saat kemandirian meningkat."),
    q("IDE-01","AEON IDEAL","Easy","Prinsip Dasar AEON mencakup…",["Pelanggan, perdamaian, kemanusiaan, komunitas setempat", "Harga, promosi, pajak, gudang", "Target, hukuman, kontrol, audit", "Produk, mesin, gedung, iklan"],"A","Empat orientasinya adalah pelanggan, perdamaian, kemanusiaan, dan komunitas setempat."),
    q("IDE-02","AEON IDEAL","Medium","Menurut materi, perdamaian…",["Datang dengan sendirinya", "Perlu kesadaran dan keterlibatan aktif", "Tidak berkaitan dengan ritel", "Hanya berarti tidak ada perang"],"B","Perdamaian dipahami lebih luas dan perlu dijaga melalui keterlibatan aktif."),
    q("IDE-03","AEON IDEAL","Easy","Dalam prinsip kemanusiaan, AEON menekankan…",["Keseragaman karakter", "Penghormatan pada individu, martabat, dan otonomi", "Menghindari pembelajaran", "Mengutamakan jabatan"],"B","AEON menghargai karakter, martabat, otonomi, dan potensi setiap individu."),
    q("IDE-04","AEON IDEAL","Medium","Makna Customer First yang paling sesuai adalah…",["Mengutamakan kenyamanan internal di atas pelanggan", "Menjadikan pelanggan sebagai standar dalam keputusan dan tindakan", "Selalu memberi diskon", "Menghindari inovasi"],"B","Customer First berarti orientasi pelanggan menjadi cermin dalam keputusan, bukan kepentingan diri sendiri."),
    q("IDE-05","AEON IDEAL","Medium","Kontribusi kepada komunitas setempat berarti…",["Mengabaikan perbedaan daerah", "Menghormati keragaman lokal dan memenuhi kebutuhan setempat secara berkelanjutan", "Menjual produk yang sama tanpa melihat kebutuhan", "Beroperasi tanpa hubungan dengan masyarakat"],"B","Materi menekankan keragaman, kebutuhan lokal, dan kontribusi berkelanjutan."),
    q("IDE-06","AEON IDEAL","Medium","Mengapa inovasi berkelanjutan penting menurut materi?",["Agar perusahaan tidak perlu memahami pelanggan", "Agar tidak stagnan dan mampu mengantisipasi perubahan pelanggan serta masyarakat", "Agar semua proses tetap sama", "Agar hanya fokus pada internal"],"B","AEON menekankan perubahan terus menerus untuk merespons masa depan, pelanggan, dan masyarakat."),
    q("IDE-07","AEON IDEAL","Easy","Industri ritel dalam materi digambarkan sebagai industri yang berkaitan erat dengan…",["Perdamaian dan kehidupan manusia", "Perang", "Spekulasi semata", "Teknologi saja"],"A","Materi menghubungkan ritel dengan perdamaian, kemanusiaan, dan komunitas."),
    q("IDE-08","AEON IDEAL","Hard","Jika pilihan A lebih nyaman bagi perusahaan tetapi merugikan kepentingan pelanggan, prinsip Customer First mendorong untuk…",["Memilih A karena paling mudah", "Menilai kembali keputusan dari sudut pelanggan dan bertindak tulus", "Mengabaikan dampak", "Menunda tanpa alasan"],"B","Customer First meminta AEON People menolak godaan yang hanya menguntungkan atau nyaman bagi diri/perusahaan."),
    q("VIS-01","FUTURE VISION","Easy","Inti pernyataan Future Vision Grup AEON adalah…",["Menciptakan gaya hidup masa depan yang membuat senyum mengembang di wajah setiap orang", "Menjadi perusahaan terbesar tanpa melihat pelanggan", "Mempertahankan semua cara lama", "Mengurangi perubahan gaya hidup"],"A","Pernyataan visi menekankan penciptaan gaya hidup masa depan yang membawa senyuman."),
    q("VIS-02","FUTURE VISION","Easy","Hal yang tetap tidak berubah dalam visi adalah…",["Berorientasi kepada pelanggan", "Menolak teknologi", "Menghindari komunitas", "Mengutamakan proses internal"],"A","Booklet menyatakan orientasi kepada pelanggan tetap menjadi landasan yang tidak berubah."),
    q("VIS-03","FUTURE VISION","Medium","Perubahan pendekatan yang ditekankan visi adalah…",["Hanya menyesuaikan diri terhadap masa depan", "Lebih memahami setiap individu dan ikut menciptakan gaya hidup masa depan", "Mengurangi pemahaman pelanggan", "Berhenti berinovasi"],"B","Visi menekankan pemahaman individual dan peran aktif dalam menciptakan masa depan."),
    q("VIS-04","FUTURE VISION","Easy","MIRAI dalam booklet berarti…",["Pelanggan", "Masa depan", "Keuntungan", "Toko"],"B","MIRAI adalah kata Jepang yang digunakan untuk berarti masa depan."),
    q("VIS-05","FUTURE VISION","Medium","Masa depan yang ingin diwujudkan mencakup…",["Masyarakat lebih cerah ceria dan kebahagiaan sejati individu", "Hanya pertumbuhan teknologi", "Hanya efisiensi biaya", "Hanya ekspansi toko"],"A","Future Vision menyatukan perkembangan masyarakat dan kebahagiaan individu."),
    q("VIS-06","FUTURE VISION","Medium","Menurut booklet, kemajuan teknologi dapat…",["Hanya membawa dampak positif", "Memperluas potensi manusia tetapi tetap disertai tantangan sosial", "Menghilangkan semua masalah lingkungan", "Membuat pelanggan tidak memerlukan empati"],"B","Materi melihat potensi teknologi sekaligus masalah kompleks yang menyertainya."),
    q("VIS-07","FUTURE VISION","Medium","Pelanggan diperkirakan semakin mencari kebahagiaan yang terkait dengan…",["Jati diri, empati, dan kepercayaan", "Hanya jumlah barang", "Hanya diskon", "Hanya kecepatan transaksi"],"A","Booklet menyoroti jati diri, empati, dan kepercayaan sebagai sumber kebahagiaan batin."),
    q("VIS-08","FUTURE VISION","Hard","Visi AEON berusaha menyatukan dua hal yang kadang bertolak belakang, yaitu…",["Kemajuan masyarakat dan kebahagiaan individu", "Harga dan label", "Gudang dan kasir", "Atasan dan bawahan"],"A","Materi menyebut perkembangan masyarakat dan kebahagiaan individu kadang bertolak belakang tetapi ingin diwujudkan bersama."),
    q("FIG-01","AEON FIGURE","Easy","Cost Price adalah…",["Harga jual ke pelanggan", "Harga beli dari supplier", "Nilai diskon", "Jumlah laba"],"B","Modul mendefinisikan Cost Price sebagai harga beli dari supplier."),
    q("FIG-02","AEON FIGURE","Easy","Rumus dasar Neire/Mark Up amount adalah…",["Cost - Retail", "Retail - Cost", "Sales + Loss", "Purchase - Closing"],"B","Mark Up/Neire adalah selisih Retail Price dengan Cost Price."),
    q("FIG-03","AEON FIGURE","Medium","Jika Retail Price Rp100 dan Cost Price Rp75, Neire Amount adalah…",["Rp15", "Rp20", "Rp25", "Rp175"],"C","Neire = Retail - Cost = 100 - 75 = 25."),
    q("FIG-04","AEON FIGURE","Easy","Retail Price menjadi Sales ketika…",["Barang masuk gudang", "Pelanggan membayar di kasir", "Supplier mengirim barang", "Stock opname dilakukan"],"B","Materi menyatakan Retail Price menjadi Sales saat pelanggan membayar."),
    q("FIG-05","AEON FIGURE","Hard","Dalam contoh Retail 100, Cost 75, Neire 25, dan PA 5, Gross Profit Ratio setelah markdown adalah sekitar…",["20,00%", "21,05%", "25,00%", "5,00%"],"B","Sales menjadi 95 dan GP amount 20, sehingga 20/95 × 100 ≈ 21,05%."),
    q("FIG-06","AEON FIGURE","Medium","Rumus Closing Retail Amount adalah…",["Opening + Purchase - Sales - PA - Loss", "Opening - Purchase + Sales", "Sales + PA + Loss", "Cost + GP"],"A","Figure 2 menggunakan Opening + Purchase - Sales - PA - Loss."),
    q("FIG-07","AEON FIGURE","Medium","Turn Over Day dihitung dengan…",["Monthly Sales / Average Stock", "Average Stock / Daily Average Sales", "Retail / Cost", "GP / Sales"],"B","Turn Over Day adalah Average Stock dibagi Daily Average Sales."),
    q("FIG-08","AEON FIGURE","Hard","Hubungan Turn Over Day dan Rotation dalam modul adalah…",["Jumlahnya selalu 30", "Hasil kalinya 30", "Selisihnya 30", "Tidak ada hubungan"],"B","Figure 3 menyatakan Turn Over Day × Rotation = 30."),
    q("DNA-01","AEON DNA","Easy","Prinsip 'satu produk satu harga' dikembangkan terutama untuk…",["Membedakan pelanggan lama dan baru", "Memberi harga yang adil kepada semua pelanggan", "Membuat tawar-menawar lebih panjang", "Menaikkan harga untuk pelanggan tertentu"],"B","Label harga digunakan agar siapa pun memperoleh harga yang sama."),
    q("DNA-02","AEON DNA","Medium","Kisah Okadaya menunjukkan bahwa dalam berdagang sebaiknya…",["Hanya menunggu pelanggan", "Aktif mencari peluang dan kebutuhan pelanggan", "Menghindari perubahan", "Selalu mempertahankan produk lama"],"B","Kisah awal menekankan semangat aktif, bukan menunggu."),
    q("DNA-03","AEON DNA","Medium","Setelah perang, Okadaya mengubah produk dari kimono ke kebutuhan sehari-hari terutama karena…",["Tidak mau melayani pelanggan", "Kondisi dan kebutuhan zaman berubah", "Ingin menutup toko", "Tidak ada hubungan dengan pelanggan"],"B","Cerita menggambarkan adaptasi terhadap perubahan zaman dan kebutuhan masyarakat."),
    q("DNA-04","AEON DNA","Easy","Falsafah pengembangan manusia AEON dalam materi menyebut ritel sebagai…",["Industri kemanusiaan", "Industri mesin", "Industri perang", "Industri tertutup"],"A","Perjalanan lembaga pendidikan AEON dihubungkan dengan gagasan ritel sebagai industri kemanusiaan."),
    q("DNA-05","AEON DNA","Medium","Mengapa pendidikan karyawan dianggap penting dalam kisah AEON?",["Karena kemampuan karyawan dapat meningkatkan kepuasan pelanggan dan kekuatan perusahaan", "Agar pekerjaan tidak perlu dilakukan", "Untuk mengurangi tanggung jawab", "Hanya untuk formalitas"],"A","Pengembangan kemampuan karyawan dikaitkan dengan kepuasan pelanggan dan kekuatan perusahaan."),
    q("DNA-06","AEON DNA","Medium","Manajemen perserikatan dalam kisah AEON menekankan…",["Sentralisasi penuh tanpa lokalitas", "Kepercayaan dan desentralisasi daerah", "Menghapus identitas lokal", "Hanya keputusan kantor pusat"],"B","Kisah penggabungan menekankan kepercayaan dan perkembangan melalui desentralisasi daerah."),
    q("DNA-07","AEON DNA","Easy","Pesan yang merangkum prinsip dalam komik adalah…",["Semua demi pelanggan", "Semua demi stok", "Semua demi diskon", "Semua demi atasan"],"A","Komik menutup asal-usul prinsip AEON dengan pesan 'Semua demi pelanggan'."),
    q("DNA-08","AEON DNA","Hard","Ekspansi AEON ke luar Jepang dalam kisah menekankan…",["Hanya melayani orang Jepang", "Lokalisasi manajemen dan kontribusi pada masyarakat setempat", "Mengabaikan tenaga lokal", "Menyamakan semua negara tanpa adaptasi"],"B","Materi menggambarkan ekspansi yang menargetkan warga lokal dan pengelolaan yang berakar lokal."),
    q("MGT-01","MANAGEMENT","Easy","Menurut Drucker, pekerjaan manajer perlu diarahkan terutama pada…",["Aktivitas sebanyak mungkin", "Kontribusi terhadap hasil dan tujuan organisasi", "Kontrol pribadi atas semua detail", "Popularitas"],"B","Management dinilai dari kontribusi terhadap hasil yang dibutuhkan organisasi."),
    q("MGT-02","MANAGEMENT","Medium","Objectives seorang manajer seharusnya…",["Terpisah dari tujuan perusahaan", "Ditautkan pada tujuan perusahaan dan kontribusi unit", "Hanya berisi target pribadi", "Tidak perlu jelas"],"B","Objectives perlu diturunkan dari tujuan perusahaan dan menjelaskan kontribusi unit."),
    q("MGT-03","MANAGEMENT","Medium","Management by Objectives menekankan…",["Arah bersama dan self-control", "Perintah tanpa tujuan", "Kontrol luar semata", "Tujuan yang berubah tiap hari"],"A","MBO dan self-control memberi common direction sambil menuntut disiplin diri."),
    q("MGT-04","MANAGEMENT","Hard","Informasi kinerja paling efektif digunakan sebagai…",["Alat self-control agar manajer dapat memperbaiki hasil", "Alat menghukum tanpa konteks", "Rahasia yang hanya dimiliki atasan", "Pengganti objectives"],"A","Drucker menekankan informasi yang tepat waktu untuk self-control, bukan semata kontrol dari atas."),
    q("MGT-05","MANAGEMENT","Medium","Tugas awal manajer terhadap orang menurut Drucker adalah…",["Mencari kelemahannya sebanyak mungkin", "Membuat kekuatan mereka menjadi efektif", "Mengasumsikan semua orang malas", "Mengurangi tanggung jawab"],"B","Ia menekankan pengembangan kekuatan dan kontribusi manusia."),
    q("MGT-06","MANAGEMENT","Medium","Motivasi untuk self-development terutama harus…",["Datang dari dalam individu", "Dipaksakan sepenuhnya dari luar", "Berbasis ketakutan", "Dihindari"],"A","Drucker menyatakan motivasi pengembangan diri harus datang dari dalam, meski atasan dapat memberi dukungan."),
    q("MGT-07","MANAGEMENT","Medium","Objectives yang baik seharusnya mempertimbangkan…",["Hanya jangka pendek", "Hanya jangka panjang", "Jangka pendek dan jangka panjang secara seimbang", "Tidak perlu waktu"],"C","Objectives perlu menggabungkan pertimbangan jangka pendek dan jangka panjang."),
    q("MGT-08","MANAGEMENT","Hard","Penilaian pengembangan yang dianjurkan Drucker dimulai dari…",["Potensi yang dibayangkan saja", "Performance terhadap objectives dan kekuatan yang konsisten terlihat", "Kesalahan satu kali", "Pendapat rekan tanpa data"],"B","Self-development appraisal berangkat dari performance terhadap objective serta hal yang dilakukan dengan baik secara konsisten.")
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
    bootstrap:()=>request('bootstrap'),
    startQuiz:payload=>request('startQuiz',payload),
    submitQuiz:payload=>request('submitQuiz',payload,{timeout:45000}),
    adminDashboard:()=>request('adminDashboard'),
    adminUpdateUserStatus:payload=>request('adminUpdateUserStatus',payload),
    clearSession:()=>setStoredSession(null)
  });
})();
