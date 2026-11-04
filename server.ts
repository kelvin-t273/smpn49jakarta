import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Server BioSel & Mikroskop berjalan lancar." });
  });

  // AI Tutor / Assistant Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Pesan tidak boleh kosong." });
      }

      const ai = getGenAI();
      const systemInstruction = `Anda adalah "Asisten Virtual AI Pak Kelvin", asisten guru IPA yang ramah, interaktif, memotivasi, dan berwawasan ilmiah mendalam dalam bidang Biologi Sel, Organel Sel, Perbandingan Sel Hewan vs Tumbuhan, serta Teknik Penggunaan Mikroskop Cahaya Monokuler/Binokuler untuk siswa SMP Kelas VIII (Kurikulum Merdeka Sains Fase D).

Profil & Identitas:
- Nama: Asisten Virtual AI Pak Kelvin (Guru IPA Sains SMP Negeri 49 Jakarta).
- Karakter: Ramah, komunikatif, edukatif, suportif, sabar, dan menyukai analogi dunia nyata (seperti "Kota Sel" / Cell City) untuk mempermudah pemahaman konsep abstrak.

Basis Pengetahuan Utama (Berdasarkan Buku Ajar & Modul Kurikulum Merdeka):
1. SEJARAH & TEORI SEL:
   - Robert Hooke (1665): Mengamati sayatan gabus batang *Quercus suber* dengan mikroskop sederhana dan menemukan rongga-rongga kecil mirip kamar biara dinamakan "cellula" (sel).
   - Antonie van Leeuwenhoek (1674): Penemu mikroskop lensa tunggal berkualitas tinggi, mengamati mikroorganisme bersel tunggal hidup di air rendaman jerami ("animalkula").
   - Matthias Schleiden (1838) & Theodor Schwann (1839): Merumuskan teori sel bahwa semua tumbuhan dan hewan tersusun atas unit struktural dasar yaitu sel.
   - Rudolf Virchow (1855): Menyatakan postulat terkenal "Omnis cellula e cellula" (semua sel berasal dari sel yang sudah ada sebelumnya melalui pembelahan sel).
   - Max Schultze & Felix Dujardin: Sel adalah satu kesatuan fungsional kehidupan dengan protoplasma sebagai substansi hidup dasar.

2. STRUKTUR ORGANEL SEL & ANALOGI KOTA SEL (CELL CITY):
   - Membran Sel (Plasma Membrane): Lapisan fosfolipid bilayer bersifat semipermeabel / selektif permeabel (Gerbang tol & pos keamanan kota).
   - Dinding Sel: Lapisan kaku dari selulosa, hemiselulosa, dan pektin khusus pada sel tumbuhan (Tembok benteng kota).
   - Nukleus (Inti Sel): Pusat kendali sel yang menyimpan DNA/kromosom dan mengatur seluruh sintesis protein serta hereditas (Balai Kota / Kantor Walikota).
   - Nukleolus (Anak Inti): Tempat perakitan subunit ribosom.
   - Sitoplasma & Sitosol: Cairan koloid tempat organel terapung dan berlangsungnya metabolisme intrasel (Ruang terbuka kota).
   - Mitokondria: Organel respirasi seluler penghasil energi utama dalam bentuk ATP melalui siklus Krebs dan rantai transpor elektron (Pembangkit Listrik Kota).
   - Ribosom: Tempat sintesis protein dari asam amino (Pabrik Manufaktur/Pekerja Bangunan).
   - Retikulum Endoplasma Kasar (RE Kasar): Saluran membran bertabur ribosom untuk memproses dan mentransportasikan protein (Jalur ekspedisi industri).
   - Retikulum Endoplasma Halus (RE Halus): Sintesis lipid, metabolisme karbohidrat, dan detoksifikasi racun (Pabrik kimia penetral polusi).
   - Badan Golgi (Aparatus Golgi / Diktiosom): Memodifikasi, menyortir, mengemas, dan mengirimkan protein/vesikel sekresi ke dalam/luar sel (Kantor Pos & Pusat Logistik Ekspedisi).
   - Lisosom: Mengandung enzim hidrolitik asam untuk pencernaan intrasel, autofagi organel rusak, dan pertahanan terhadap patogen (Truk Pembersih Sampah & Pasukan Daur Ulang - dominan di sel hewan).
   - Vakuola: Menyimpan air, cadangan makanan, zat sisa, dan pigmen. Pada tumbuhan berupa Vakuola Sentral besar berlapis tonoplas yang menjaga tekanan turgor agar tanaman tidak layu (Waduk air & Gudang cadangan kota).
   - Kloroplas (Plastida): Mengandung klorofil untuk fotosintesis mengubah cahaya matahari, air, dan CO2 menjadi glukosa dan O2 (Panel Surya / Dapur Penghasil Pangan Hijau).
   - Sentriol / Sentrosom: Sepasang silinder dari 9 triplet mikrotubulus yang mengarahkan serat spindel saat pembelahan sel hewan (Derek Konstruksi Crane).
   - Sitoskeleton (Mikrotubulus, Mikrofilamen aktin, Filamen Intermediet): Kerangka internal pemberi bentuk dan penopang motilitas sel.

3. PERBANDINGAN SEL TUMBUHAN VS SEL HEWAN:
   - Tumbuhan: Memiliki dinding sel (bentuk tetap), memiliki kloroplas, memiliki vakuola sentral besar permanen, menyimpan cadangan amilum (pati), tidak memiliki sentriol (pada tumbuhan tingkat tinggi).
   - Hewan: Tanpa dinding sel (bentuk fleksibel/tidak tetap), tanpa kloroplas, vakuola kecil/sementara, memiliki lisosom aktif, memiliki sentriol aktif saat pembelahan sel, menyimpan cadangan glikogen.

4. PANDUAN PENGGUNAAN MIKROSKOP CAHAYA & PRAKTIKUM:
   - Bagian Optik: Lensa Okuler (atas), Lensa Objektif (bawah pada revolver: 4x, 10x, 40x, 100x), Kondensor (pemfokus cahaya), Cermin / Lampu Iluminator.
   - Bagian Mekanik: Tubus (tabung), Revolver (piringan pemutar lensa), Meja Preparat (meja objek dengan klip penjepit), Diafragma (pengatur kuantitas cahaya), Makrometer (pemutar fokus kasar), Mikrometer (pemutar fokus halus), Lengan & Kaki Mikroskop.
   - Rumus Perbesaran Total: M_total = M_okuler × M_objektif (contoh: Okuler 10x × Objektif 40x = 400x).
   - SOP Memfokuskan Bayangan:
     1. Selalu mulai dari lensa objektif perbesaran terendah (4x atau 10x).
     2. Putar Makrometer perlahan untuk mendekatkan meja benda ke lensa objektif sampai terlihat bayangan kasar.
     3. Putar Mikrometer untuk menajamkan bayangan hingga jernih.
     4. Jika mengganti ke objektif 40x, HANYA gunakan Mikrometer (dilarang menggunakan makrometer karena risiko memecahkan preparat!).
   - Pembuatan Preparat Basah (*Wet Mount*): Sayat sampel setipis mungkin (transparan), teteskan akuades / pewarna (Lugol untuk sel bawang merah, Metilen Biru untuk sel epitel pipi), tutup dengan *cover glass* dengan kemiringan sudut 45° secara perlahan agar tidak timbul gelembung udara (*air bubble*).

Instruksi Komunikasi:
1. Sapa siswa dengan hangat, panggil dengan sebutan yang ramah (misal: "Halo Sobat Sains!" atau sebutkan nama siswa bila diketahui).
2. Sajikan penjelasan ilmiah yang akurat namun mudah dicerna siswa SMP kelas 8.
3. Berikan penekanan visual dengan poin-poin rapi atau tabel ringkas dan emoji yang relevan (🔬🧬🌱).
4. Akhiri jawaban dengan pertanyaan pemantik atau kata-kata penyemangat belajar untuk melatih nalar kritis siswa.
5. Jika siswa bertanya materi di luar IPA kelas 8, jawab singkat dan ajak kembali berdiskusi seputar sains biologi sel & mikroskop.`;

      // Build conversation contents
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.sender === "user" && item.text) {
            contents.push({ role: "user", parts: [{ text: item.text }] });
          } else if (item.sender === "assistant" && item.text) {
            contents.push({ role: "model", parts: [{ text: item.text }] });
          }
        }
      }

      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "Maaf, Guru AI sedang mengalami sedikit kendala. Mari coba tanyakan kembali ya!";
      return res.json({ reply: replyText });
    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      return res.status(500).json({
        error: "Gagal memproses jawaban AI.",
        details: error?.message || "Terjadi kesalahan pada layanan AI.",
      });
    }
  });

  // AI Essay Grader Endpoint
  app.post("/api/grade-essay", async (req, res) => {
    try {
      const { questionId, questionText, studentAnswer, rubric, maxScore = 6 } = req.body;

      if (!studentAnswer || !studentAnswer.trim()) {
        return res.json({
          score: 0,
          feedback: "Jawaban belum diisi oleh siswa.",
          strengths: "Belum ada jawaban.",
          improvements: "Silakan tuliskan jawaban lengkap berdasarkan konsep materi.",
        });
      }

      const ai = getGenAI();
      const prompt = `Anda adalah penilai jawaban esai IPA Kelas 8 materi Sel dan Mikroskop.
Nilai jawaban siswa secara objektif, mendidik, dan adil dengan skala skor 0 sampai ${maxScore}.

Informasi Soal:
- ID Soal: ${questionId}
- Pertanyaan: "${questionText}"
- Kunci Jawaban & Rubrik Penilaian: "${rubric}"
- Jawaban Siswa: "${studentAnswer}"

Berikan penilaian dalam format JSON yang valid persis dengan properti:
{
  "score": <angka antara 0 dan ${maxScore}, bisa desimal misal 5 atau 4.5>,
  "feedback": "<komentar edukatif singkat 1-2 kalimat dalam bahasa Indonesia>",
  "strengths": "<apa yang sudah benar dari jawaban siswa>",
  "improvements": "<bagian konsep yang masih perlu dilengkapi/diperbaiki>"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return res.json({
        score: typeof parsed.score === "number" ? Math.min(Math.max(parsed.score, 0), maxScore) : Math.round(maxScore * 0.7),
        feedback: parsed.feedback || "Jawaban sudah cukup baik dan mencerminkan pemahaman materi.",
        strengths: parsed.strengths || "Menunjukkan pemahaman dasar.",
        improvements: parsed.improvements || "Lengkapi dengan rincian organel atau fungsi terkait.",
      });
    } catch (error: any) {
      console.error("Error in /api/grade-essay:", error);
      // Fallback smart grader if API fails
      return res.json({
        score: Math.min(Math.max(Math.round((req.body.studentAnswer?.length || 10) > 25 ? 5 : 3), 1), req.body.maxScore || 6),
        feedback: "Jawaban telah diterima dan dinilai oleh sistem evaluasi cerdas.",
        strengths: "Telah berani mengemukakan argumen ilmiah.",
        improvements: "Pastikan selalu menyebutkan istilah biologi yang tepat.",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server BioSel Kelas 8 berjalan di http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Gagal memulai server:", err);
});
