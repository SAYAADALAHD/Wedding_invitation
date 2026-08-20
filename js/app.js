// =====================================================
// KONFIGURASI
// =====================================================

const FORM_ID = "12fvalFiyDR3sNbYUttY66DGYY7w_Kz-mzvxCOkBgR9w";

// =====================================================
// GET
// Digunakan website untuk mengambil Wishes
// =====================================================

function doGet(e) {
  try {
    const callback = e && e.parameter && e.parameter.callback;

    const data = getWishes();

    const json = JSON.stringify(data);

    // ===============================================
    // JSONP
    // ===============================================

    if (callback) {
      return ContentService.createTextOutput(
        callback + "(" + json + ")",
      ).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    // ===============================================
    // JSON biasa
    // ===============================================

    return ContentService.createTextOutput(json).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// =====================================================
// POST
// Digunakan website untuk mengirim RSVP / Wishes
// =====================================================

function doPost(e) {
  try {
    // ===============================================
    // Validasi request
    // ===============================================

    if (!e || !e.parameter) {
      throw new Error("Data POST tidak ditemukan.");
    }

    // ===============================================
    // Ambil data dari website
    // ===============================================

    const data = {
      panggilan: e.parameter.panggilan || "",

      nama: e.parameter.nama || "",

      komentar: e.parameter.komentar || "",

      kehadiran: e.parameter.kehadiran || "",
    };

    // ===============================================
    // Debug
    // ===============================================

    console.log("=================================");

    console.log("DATA POST DITERIMA");

    console.log(data);

    console.log("=================================");

    // ===============================================
    // Validasi data
    // ===============================================

    if (!data.nama) {
      throw new Error("Nama tidak boleh kosong.");
    }

    // ===============================================
    // Kirim ke Google Form
    // ===============================================

    submitWish(data);

    // ===============================================
    // Response berhasil
    // ===============================================

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,

        message: "RSVP berhasil dikirim.",
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error(error);

    // ===============================================
    // Response gagal
    // ===============================================

    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,

        error: error.message,
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// =====================================================
// SUBMIT RSVP KE GOOGLE FORM
// =====================================================

function submitWish(data) {
  // ===============================================
  // Buka Google Form berdasarkan FORM_ID
  // ===============================================

  const form = FormApp.openById(FORM_ID);

  if (!form) {
    throw new Error("Google Form tidak ditemukan.");
  }

  // ===============================================
  // Cek apakah Form menerima respons
  // ===============================================

  if (!form.isAcceptingResponses()) {
    throw new Error("Google Form sedang tidak menerima tanggapan.");
  }

  // ===============================================
  // Ambil semua item pertanyaan
  // ===============================================

  const items = form.getItems();

  let panggilanItem = null;
  let namaItem = null;
  let komentarItem = null;
  let kehadiranItem = null;

  // ===============================================
  // Cari pertanyaan berdasarkan judul
  // ===============================================

  items.forEach((item) => {
    const title = item.getTitle().trim();

    // -------------------------------------------
    // Panggilan
    // -------------------------------------------

    if (title === "Panggilan") {
      panggilanItem = item;
    }

    // -------------------------------------------
    // Nama
    // -------------------------------------------

    if (title === "Nama") {
      namaItem = item;
    }

    // -------------------------------------------
    // Komentar
    // -------------------------------------------

    if (title === "Komentar") {
      komentarItem = item;
    }

    // -------------------------------------------
    // Kehadiran
    // -------------------------------------------

    if (title === "Konfirmasi kehadiran") {
      kehadiranItem = item;
    }
  });

  // ===============================================
  // VALIDASI PERTANYAAN
  // ===============================================

  if (!panggilanItem) {
    throw new Error('Pertanyaan "Panggilan" tidak ditemukan.');
  }

  if (!namaItem) {
    throw new Error('Pertanyaan "Nama" tidak ditemukan.');
  }

  if (!komentarItem) {
    throw new Error('Pertanyaan "Komentar" tidak ditemukan.');
  }

  if (!kehadiranItem) {
    throw new Error('Pertanyaan "Konfirmasi kehadiran" tidak ditemukan.');
  }

  // ===============================================
  // BUAT RESPONSE BARU
  // ===============================================

  const response = form.createResponse();

  // ===============================================
  // PANGGILAN
  // ===============================================

  const panggilanResponse = panggilanItem
    .asMultipleChoiceItem()
    .createResponse(data.panggilan);

  response.withItemResponse(panggilanResponse);

  // ===============================================
  // NAMA
  // ===============================================

  const namaResponse = namaItem.asTextItem().createResponse(data.nama);

  response.withItemResponse(namaResponse);

  // ===============================================
  // KOMENTAR
  // ===============================================

  const komentarResponse = komentarItem
    .asParagraphTextItem()
    .createResponse(data.komentar);

  response.withItemResponse(komentarResponse);

  // ===============================================
  // KEHADIRAN
  // ===============================================

  const kehadiranResponse = kehadiranItem
    .asMultipleChoiceItem()
    .createResponse(data.kehadiran);

  response.withItemResponse(kehadiranResponse);

  // ===============================================
  // SUBMIT
  // ===============================================

  response.submit();

  console.log("RSVP berhasil disubmit ke Google Form.");
}

// =====================================================
// MENGAMBIL SEMUA WISHES
// =====================================================

function getWishes() {
  // ===============================================
  // Buka Google Form
  // ===============================================

  const form = FormApp.openById(FORM_ID);

  if (!form) {
    throw new Error("Google Form tidak ditemukan.");
  }

  // ===============================================
  // Ambil semua response
  // ===============================================

  const responses = form.getResponses();

  const wishes = [];

  // ===============================================
  // Loop semua response
  // ===============================================

  responses.forEach((formResponse) => {
    const itemResponses = formResponse.getItemResponses();

    let panggilan = "";
    let nama = "";
    let komentar = "";
    let kehadiran = "";

    // =============================================
    // Loop semua pertanyaan
    // =============================================

    itemResponses.forEach((itemResponse) => {
      const title = itemResponse.getItem().getTitle().trim();

      const answer = itemResponse.getResponse();

      // -----------------------------------------
      // Panggilan
      // -----------------------------------------

      if (title === "Panggilan") {
        panggilan = String(answer);
      }

      // -----------------------------------------
      // Nama
      // -----------------------------------------

      if (title === "Nama") {
        nama = String(answer);
      }

      // -----------------------------------------
      // Komentar
      // -----------------------------------------

      if (title === "Komentar") {
        komentar = String(answer);
      }

      // -----------------------------------------
      // Kehadiran
      // -----------------------------------------

      if (title === "Konfirmasi kehadiran") {
        kehadiran = String(answer);
      }
    });

    // =============================================
    // Masukkan hanya response yang memiliki nama
    // =============================================

    if (nama) {
      wishes.push({
        panggilan: panggilan,

        nama: nama,

        komentar: komentar,

        kehadiran: kehadiran,

        timestamp: formResponse.getTimestamp().getTime(),
      });
    }
  });

  // ===============================================
  // Terbaru berada di atas
  // ===============================================

  wishes.reverse();

  return wishes;
}

// =====================================================
// TEST STATUS GOOGLE FORM
// =====================================================
// Jalankan fungsi ini secara manual dari Apps Script.
// Tidak dipanggil oleh website.
// =====================================================

function testFormStatus() {
  const form = FormApp.openById(FORM_ID);

  console.log("=================================");

  console.log("FORM TITLE");

  console.log(form.getTitle());

  console.log("=================================");

  console.log("FORM ID");

  console.log(form.getId());

  console.log("=================================");

  console.log("ACCEPTING RESPONSES");

  console.log(form.isAcceptingResponses());

  console.log("=================================");

  console.log("RESPONSE COUNT");

  console.log(form.getResponses().length);

  console.log("=================================");
}
