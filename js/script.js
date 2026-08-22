// =====================================================
// SAKURA
// =====================================================

(function ($) {
  "use strict";

  $(".sakura-falling").sakura();
})(jQuery);

// =====================================================
// OPENING BUTTON
// =====================================================

const openButton = document.getElementById("open-invitation");

if (openButton) {
  openButton.addEventListener("click", () => {
    // Jalankan animasi opening
    document.body.classList.add("opening-exit");

    // Tunggu animasi selesai
    setTimeout(() => {
      // Bawa semua parameter URL tamu
      const queryString = window.location.search;

      // Saat development dengan Live Server
      if (
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname === "localhost"
      ) {
        window.location.href = `fullpage.html${queryString}`;

        return;
      }

      // Saat sudah online di Netlify
      window.location.href = `/undangan${queryString}`;
    }, 1400);
  });
}

// =====================================================
// GUEST DATABASE
// =====================================================

const GUEST_API =
  "https://script.google.com/macros/s/AKfycbyecqm5stMny0MV3GLQggDpg4VhyYr412NIIQeY-dvq2Zj8wSuqgNhKeQezBwSsbA_bPQ/exec";

// =====================================================
// CURRENT GUEST
// =====================================================

let currentGuest = null;

// =====================================================
// URL PARAMETER
// =====================================================

const urlParams = new URLSearchParams(window.location.search);

const guestSlug = urlParams.get("to");

// =====================================================
// CALLBACK JSONP
// =====================================================

window.handleGuestResponse = function (guest) {
  const namaTamu = document.getElementById("nama-tamu");

  console.log("Guest response:", guest);

  // Element nama tamu tidak ada
  if (!namaTamu) {
    return;
  }

  // Guest tidak ditemukan
  if (!guest || !guest.success) {
    namaTamu.textContent = "Tamu Undangan";

    console.warn(guest?.message || "Guest tidak ditemukan.");

    return;
  }

  // Simpan guest
  currentGuest = guest;

  // =================================================
  // TAMPILKAN NAMA TAMU
  // =================================================

  namaTamu.textContent = guest.displayName;
};

// =====================================================
// LOAD GUEST
// =====================================================

function loadGuest() {
  const namaTamu = document.getElementById("nama-tamu");

  // Guest hanya dipakai di halaman yang memiliki
  // element #nama-tamu
  if (!namaTamu) {
    return;
  }

  // Tidak ada parameter ?to=
  if (!guestSlug) {
    namaTamu.textContent = "Tamu Undangan";

    console.warn("Parameter ?to= tidak ditemukan.");

    return;
  }

  // =================================================
  // BUAT JSONP SCRIPT
  // =================================================

  const guestScript = document.createElement("script");

  guestScript.async = true;

  guestScript.src =
    `${GUEST_API}` +
    `?to=${encodeURIComponent(guestSlug)}` +
    `&callback=handleGuestResponse`;

  console.log("Memuat Guest API:", guestScript.src);

  // =================================================
  // BERHASIL DIMUAT
  // =================================================

  guestScript.onload = function () {
    console.log("Guest API berhasil dimuat.");

    guestScript.remove();
  };

  // =================================================
  // GAGAL DIMUAT
  // =================================================

  guestScript.onerror = function () {
    console.error("Guest API gagal dimuat:", guestScript.src);

    namaTamu.textContent = "Tamu Undangan";

    guestScript.remove();
  };

  // =================================================
  // REQUEST API
  // =================================================

  document.head.appendChild(guestScript);
}

// =====================================================
// START
// =====================================================

loadGuest();
// =====================================================
// WEDDING DATA
// =====================================================
const weddingData = {
  // Judul acara
  title: "Ahmad & Diana Wedding",

  // Tanggal acara
  // Format: YYYYMMDD
  date: "20260916",

  // Waktu mulai
  // Format: HHMMSS
  startTime: "190000",

  // Waktu selesai
  // Format: HHMMSS
  endTime: "220000",

  // Lokasi acara
  location: "Sorong, Papua Barat Daya",

  // Deskripsi acara
  details: "Wedding Invitation Ahmad & Diana",
};

// =====================================================
// COUNTDOWN
// =====================================================

const days = document.getElementById("days");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");

if (days && hours && minutes && seconds) {
  // Ubah:
  // 20260916 + 190000
  //
  // menjadi:
  // 2026-09-16T19:00:00

  const year = weddingData.date.substring(0, 4);
  const month = weddingData.date.substring(4, 6);
  const day = weddingData.date.substring(6, 8);

  const hour = weddingData.startTime.substring(0, 2);
  const minute = weddingData.startTime.substring(2, 4);
  const second = weddingData.startTime.substring(4, 6);

  const targetDate = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`,
  ).getTime();

  function updateCountdown() {
    const now = new Date().getTime();

    const distance = targetDate - now;

    if (distance <= 0) {
      days.textContent = "00";
      hours.textContent = "00";
      minutes.textContent = "00";
      seconds.textContent = "00";

      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));

    const h = Math.floor((distance / (1000 * 60 * 60)) % 24);

    const m = Math.floor((distance / (1000 * 60)) % 60);

    const s = Math.floor((distance / 1000) % 60);

    days.textContent = String(d).padStart(2, "0");
    hours.textContent = String(h).padStart(2, "0");
    minutes.textContent = String(m).padStart(2, "0");
    seconds.textContent = String(s).padStart(2, "0");
  }

  updateCountdown();

  setInterval(updateCountdown, 1000);
}

// =====================================================
// SAVE TO GOOGLE CALENDAR
// =====================================================

const calendarButton = document.getElementById("calendar-button");

// Pastikan tombol tersedia
if (calendarButton) {
  calendarButton.addEventListener("click", () => {
    // =================================================
    // GABUNGKAN TANGGAL + WAKTU
    // =================================================

    const startDate = weddingData.date + "T" + weddingData.startTime;

    const endDate = weddingData.date + "T" + weddingData.endTime;

    // =================================================
    // BUAT GOOGLE CALENDAR URL
    // =================================================

    const googleCalendarURL =
      "https://calendar.google.com/calendar/render" +
      "?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(weddingData.title) +
      "&dates=" +
      startDate +
      "/" +
      endDate +
      "&details=" +
      encodeURIComponent(weddingData.details) +
      "&location=" +
      encodeURIComponent(weddingData.location);

    // =================================================
    // BUKA GOOGLE CALENDAR
    // =================================================

    window.open(googleCalendarURL, "_blank");
  });
}

// =========================================================
// OUR STORY - SCROLL CONTROLLED TIMELINE
// =========================================================

// =========================================================
// ELEMENT
// =========================================================

const timeline = document.querySelector(".timeline");

const timelineLine = document.querySelector(".timeline-line");

const dots = document.querySelectorAll(".timeline-dot");

const loveCircle = document.querySelector(".love-circle");

// =========================================================
// SCROLL PERFORMANCE
// =========================================================

let ticking = false;

// =========================================================
// UPDATE TIMELINE
// =========================================================

function updateTimeline() {
  /*
    Pastikan element tersedia.
  */

  if (!timeline || !timelineLine || !loveCircle) {
    return;
  }

  // =======================================================
  // TIMELINE POSITION
  // =======================================================

  const timelineRect = timeline.getBoundingClientRect();

  const triggerPoint = window.innerHeight * 0.75;

  // =======================================================
  // CALCULATE PROGRESS
  // =======================================================

  const distance = triggerPoint - timelineRect.top;

  const timelineHeight = timelineRect.height;

  let progress = distance / timelineHeight;

  progress = Math.max(0, Math.min(progress, 1));

  // =======================================================
  // SEND PROGRESS TO CSS
  // =======================================================

  timeline.style.setProperty("--timeline-progress", progress);

  // =======================================================
  // DOT ACTIVATION
  // =======================================================

  dots.forEach((dot) => {
    const dotRect = dot.getBoundingClientRect();
    const dotPosition = dotRect.top - triggerPoint;

    // -----------------------------------------------------
    // DOT ACTIVE
    // -----------------------------------------------------

    if (dotPosition <= 0) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }

    // -----------------------------------------------------
    // DOT REACHED
    // -----------------------------------------------------

    if (dotPosition <= -5) {
      dot.classList.add("reached");
    } else {
      dot.classList.remove("reached");
    }
  });

  // =======================================================
  // LOVE POSITION
  // =======================================================

  const loveRect = loveCircle.getBoundingClientRect();

  const lovePosition = loveRect.top - triggerPoint;

  // =======================================================
  // LOVE ACTIVATION
  // =======================================================

  if (lovePosition <= 0) {
    loveCircle.classList.add("active");

    loveCircle.classList.add("beating");
  } else {
    loveCircle.classList.remove("active");

    loveCircle.classList.remove("beating");
  }

  // =======================================================
  // RESET RAF
  // =======================================================

  ticking = false;
}

// =========================================================
// REQUEST UPDATE
// =========================================================

function requestTimelineUpdate() {
  if (!ticking) {
    window.requestAnimationFrame(updateTimeline);

    ticking = true;
  }
}

// =========================================================
// TIMELINE - AKTIF HANYA SAAT DEKAT VIEWPORT
// =========================================================

let timelineListenerActive = false;

function enableTimelineListener() {
  if (timelineListenerActive) return;

  timelineListenerActive = true;

  window.addEventListener("scroll", requestTimelineUpdate, {
    passive: true,
  });

  window.addEventListener("resize", requestTimelineUpdate);
  requestTimelineUpdate();
}

function disableTimelineListener() {
  if (!timelineListenerActive) return;

  timelineListenerActive = false;

  window.removeEventListener("scroll", requestTimelineUpdate);
  window.removeEventListener("resize", requestTimelineUpdate);
}

if (timeline) {
  const timelineVisibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          enableTimelineListener();
        } else {
          disableTimelineListener();
        }
      });
    },
    {
      threshold: 0,
      rootMargin: "400px 0px",
    },
  );

  timelineVisibilityObserver.observe(timeline);
}

// =================================================
// OUR GALLERY
// =================================================

const galleryItems = document.querySelectorAll(".gallery-reveal");

// =================================================
// INTERSECTION OBSERVER
// =================================================

const galleryObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");

        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,

    rootMargin: "0px 0px -40px 0px",
  },
);

// =================================================
// OBSERVE ALL GALLERY ITEMS
// =================================================

galleryItems.forEach((item) => {
  galleryObserver.observe(item);
});

// =================================================
// VIDEO
// =================================================

const galleryVideo = document.querySelector(".gallery-video");

const videoElement = document.querySelector(".gallery-video-element");

const playButton = document.querySelector(".gallery-play-button");

const videoProgress = document.querySelector(".gallery-video-progress");

const videoCurrent = document.querySelector(".gallery-video-current");

const videoDuration = document.querySelector(".gallery-video-duration");

const fullscreenButton = document.querySelector(".gallery-video-fullscreen");

const soundButton = document.querySelector(".gallery-video-sound");
let videoControlsTimer = null;

const VIDEO_CONTROLS_DELAY = 3000;

if (videoElement) {
  videoElement.addEventListener("loadedmetadata", () => {
    console.log("Muted:", videoElement.muted);
    console.log("Volume:", videoElement.volume);
    console.log("Video source:", videoElement.currentSrc);
  });
}

// =================================================
// FORMAT TIME
// 65 detik -> 01:05
// =================================================

function formatVideoTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = Math.floor(seconds % 60);

  return (
    String(minutes).padStart(2, "0") +
    ":" +
    String(remainingSeconds).padStart(2, "0")
  );
}

// =================================================
// VIDEO READY
// =================================================

if (galleryVideo && videoElement && playButton) {
  // =================================================
  // METADATA LOADED
  // Mendapatkan total durasi video
  // =================================================

  videoElement.addEventListener("loadedmetadata", () => {
    if (videoDuration) {
      videoDuration.textContent = formatVideoTime(videoElement.duration);
    }
  });

  // =================================================
  // JIKA METADATA SUDAH TERLOAD SEBELUM LISTENER
  // =================================================

  if (Number.isFinite(videoElement.duration)) {
    if (videoDuration) {
      videoDuration.textContent = formatVideoTime(videoElement.duration);
    }
  }

  // =================================================
  // PLAY BUTTON TENGAH
  // =================================================

  // =================================================
  // CENTER PLAY / PAUSE BUTTON
  // =================================================

  playButton.addEventListener("click", (event) => {
    event.stopPropagation();

    // ===============================================
    // VIDEO SEDANG PAUSE
    // → PLAY
    // ===============================================

    if (videoElement.paused) {
      videoElement
        .play()
        .then(() => {
          galleryVideo.classList.add("is-playing");

          // Ubah icon menjadi PAUSE
          const icon = playButton.querySelector("i");

          if (icon) {
            icon.className = "bi bi-pause-fill";
          }

          playButton.setAttribute("aria-label", "Pause video");

          // Tampilkan controls
          showVideoControls();
        })
        .catch((error) => {
          console.log("Video tidak dapat diputar:", error);
        });
    }

    // ===============================================
    // VIDEO SEDANG PLAY
    // → PAUSE
    // ===============================================
    else {
      videoElement.pause();

      galleryVideo.classList.remove("is-playing");

      const icon = playButton.querySelector("i");

      if (icon) {
        icon.className = "bi bi-play-fill";
      }

      playButton.setAttribute("aria-label", "Play video");

      // Saat pause controls tidak hilang
      clearTimeout(videoControlsTimer);

      galleryVideo.classList.add("controls-visible");
    }
  });

  // =================================================
  // CLICK AREA VIDEO
  // TAMPILKAN CONTROLS
  // =================================================

  videoElement.addEventListener("click", (event) => {
    event.stopPropagation();

    // Kalau video belum pernah dimainkan,
    // biarkan hanya tombol Play awal yang terlihat
    if (videoElement.paused && videoElement.currentTime === 0) {
      return;
    }

    // Jika video sudah pernah berjalan,
    // tap layar -> munculkan controls
    showVideoControls();
  });
  // =================================================
  // EVENT PLAY
  // =================================================

  videoElement.addEventListener("play", () => {
    galleryVideo.classList.add("is-playing");

    const icon = playButton.querySelector("i");

    if (icon) {
      icon.className = "bi bi-pause-fill";
    }

    playButton.setAttribute("aria-label", "Pause video");

    // Ketika baru play,
    // tampilkan control terlebih dahulu
    showVideoControls();
  });

  // =================================================
  // EVENT PAUSE
  // =================================================

  videoElement.addEventListener("pause", () => {
    if (videoElement.ended) {
      return;
    }

    galleryVideo.classList.remove("is-playing");

    const icon = playButton.querySelector("i");

    if (icon) {
      icon.className = "bi bi-play-fill";
    }

    playButton.setAttribute("aria-label", "Play video");

    // Saat pause jangan sembunyikan controls
    clearTimeout(videoControlsTimer);

    galleryVideo.classList.add("controls-visible");
  });

  // =================================================
  // UPDATE CURRENT TIME + PROGRESS
  // =================================================

  videoElement.addEventListener("timeupdate", () => {
    const currentTime = videoElement.currentTime;

    const duration = videoElement.duration;

    // ===============================================
    // UPDATE TIME TEXT
    // ===============================================

    if (videoCurrent) {
      videoCurrent.textContent = formatVideoTime(currentTime);
    }

    // ===============================================
    // UPDATE PROGRESS
    // ===============================================

    if (videoProgress && Number.isFinite(duration) && duration > 0) {
      const progress = currentTime / duration;

      const progressValue = Math.round(progress * 1000);

      videoProgress.value = progressValue;

      videoProgress.style.setProperty("--progress", `${progress * 100}%`);
    }
  });

  // =================================================
  // USER DRAG PROGRESS BAR
  // =================================================

  if (videoProgress) {
    videoProgress.addEventListener("input", () => {
      const duration = videoElement.duration;

      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      const progress = Number(videoProgress.value) / 1000;

      videoElement.currentTime = progress * duration;

      videoProgress.style.setProperty("--progress", `${progress * 100}%`);
    });
  }

  // =================================================
  // FULLSCREEN
  // =================================================

  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", async () => {
      try {
        // ===========================================
        // JIKA SUDAH FULLSCREEN
        // KELUAR FULLSCREEN
        // ===========================================

        if (document.fullscreenElement) {
          await document.exitFullscreen();

          return;
        }

        if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
          document.webkitExitFullscreen();

          return;
        }

        // ===========================================
        // MASUK FULLSCREEN
        // ===========================================

        if (galleryVideo.requestFullscreen) {
          await galleryVideo.requestFullscreen();
        } else if (galleryVideo.webkitRequestFullscreen) {
          galleryVideo.webkitRequestFullscreen();
        }

        // iPHONE / SAFARI FALLBACK
        else if (videoElement.webkitEnterFullscreen) {
          videoElement.webkitEnterFullscreen();
        }
      } catch (error) {
        console.log("Fullscreen tidak dapat dibuka:", error);
      }
    });
  }

  // =================================================
  // VIDEO SELESAI
  // =================================================

  videoElement.addEventListener("ended", () => {
    galleryVideo.classList.remove("is-playing");

    // Reset progress
    if (videoProgress) {
      videoProgress.value = 0;

      videoProgress.style.setProperty("--progress", "0%");
    }

    // Reset time
    if (videoCurrent) {
      videoCurrent.textContent = "00:00";
    }
  });
  // =================================================
  // SOUND ON / OFF
  // TARUH BLOK ANDA DI SINI
  // =================================================

  if (soundButton && videoElement) {
    const soundIcon = soundButton.querySelector("i");

    function updateSoundIcon() {
      if (videoElement.muted || videoElement.volume === 0) {
        soundIcon.className = "bi bi-volume-mute-fill";
      } else {
        soundIcon.className = "bi bi-volume-up-fill";
      }
    }

    soundButton.addEventListener("click", (event) => {
      event.stopPropagation();

      if (videoElement.muted || videoElement.volume === 0) {
        videoElement.muted = false;
        videoElement.volume = 1;
      } else {
        videoElement.muted = true;
      }

      updateSoundIcon();

      console.log("Muted:", videoElement.muted, "Volume:", videoElement.volume);
    });

    videoElement.addEventListener("volumechange", updateSoundIcon);

    updateSoundIcon();
  }

  // =================================================
  // SHOW VIDEO CONTROLS
  // =================================================

  function showVideoControls() {
    if (!galleryVideo) {
      return;
    }

    galleryVideo.classList.add("controls-visible");

    // Hapus timer sebelumnya
    clearTimeout(videoControlsTimer);

    // Kalau video sedang berjalan,
    // sembunyikan lagi setelah 3 detik
    if (videoElement && !videoElement.paused) {
      videoControlsTimer = setTimeout(() => {
        hideVideoControls();
      }, VIDEO_CONTROLS_DELAY);
    }
  }

  // =================================================
  // HIDE VIDEO CONTROLS
  // =================================================

  function hideVideoControls() {
    if (!galleryVideo) {
      return;
    }

    // Jangan sembunyikan controls
    // kalau video sedang pause
    if (videoElement && videoElement.paused) {
      return;
    }

    galleryVideo.classList.remove("controls-visible");
  }
}

/// =====================================================
// WISHES / RSVP
// =====================================================

// =====================================================
// GOOGLE FORM
// =====================================================

const RSVP_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd9DZk0rwhd5qEx19rnWC9bsynIlzRlxKR34ZHScomasKLNsA/formResponse";

// =====================================================
// GOOGLE FORM FIELD ID
// =====================================================

const RSVP_FIELDS = {
  nama: "entry.723494919",

  komentar: "entry.1856950076",

  kehadiran: "entry.955070318",
};

// =====================================================
// WISHES API
// =====================================================

const WISHES_API =
  "https://script.google.com/macros/s/AKfycbx0Wmc4Pd3TVJzgRr_xPMpXywpaJ4xCx9stPjVymIyumnNT0J1-5v3-Pq-cxWiZGHqt_g/exec";

// =====================================================
// ELEMENT
// =====================================================

const wishForm = document.getElementById("wishForm");

const wishList = document.getElementById("wishList");

const wishLoading = document.getElementById("wishLoading");

const wishSubmit = document.getElementById("wishSubmit");

const wishMessage = document.getElementById("wishMessage");

const namaInput = document.getElementById("nama");

const komentarInput = document.getElementById("komentar");

const wishCharacterCount = document.getElementById("wishCharacterCount");

// =====================================================
// CHARACTER COUNTER
// =====================================================

if (komentarInput && wishCharacterCount) {
  komentarInput.addEventListener("input", () => {
    wishCharacterCount.textContent = komentarInput.value.length;
  });
}

// =====================================================
// LOAD WISHES
// =====================================================

async function loadWishes() {
  // ===================================================
  // API BELUM DIBUAT
  // ===================================================

  if (!WISHES_API) {
    if (wishLoading) {
      wishLoading.style.display = "none";
    }

    if (wishList) {
      wishList.innerHTML = `
        <div class="wish-empty">
          Belum ada ucapan.
        </div>
      `;
    }

    return;
  }

  // ===================================================
  // LOAD DATA
  // ===================================================

  try {
    if (wishLoading) {
      wishLoading.style.display = "block";
    }

    const response = await fetch(WISHES_API);

    if (!response.ok) {
      throw new Error("Gagal mengambil data ucapan.");
    }

    const data = await response.json();

    console.log("Wishes dari Apps Script:", data);
    const wishes = Array.isArray(data) ? data : data.wishes;

    renderWishes(wishes);
  } catch (error) {
    console.error("Error load wishes:", error);

    if (wishList) {
      wishList.innerHTML = `
        <div class="wish-error">
          Gagal memuat ucapan.
        </div>
      `;
    }
  } finally {
    if (wishLoading) {
      wishLoading.style.display = "none";
    }
  }
}

// =====================================================
// RENDER WISHES
// =====================================================

function renderWishes(wishes) {
  if (!wishList) {
    return;
  }

  // ===================================================
  // RESET LIST
  // ===================================================

  wishList.innerHTML = "";

  // ===================================================
  // TIDAK ADA DATA
  // ===================================================

  if (!Array.isArray(wishes) || wishes.length === 0) {
    wishList.innerHTML = `
      <div class="wish-empty">
        Belum ada ucapan.
      </div>
    `;

    return;
  }

  // ===================================================
  // BUAT CARD
  // ===================================================

  wishes.forEach((wish, index) => {
    const card = document.createElement("div");

    card.className = "wish-card";

    // =================================================
    // STATUS KEHADIRAN
    // =================================================

    const statusClass = wish.kehadiran === "Tidak Hadir" ? "absent" : "";

    // =================================================
    // CARD HTML
    // =================================================

    card.innerHTML = `

        <div class="wish-card-top">

          <div class="wish-name">
            ${escapeHTML(wish.nama)}
          </div>


          <span
            class="wish-status ${statusClass}"
          >
            ${escapeHTML(wish.kehadiran)}
          </span>

        </div>


        <p class="wish-comment">
          ${escapeHTML(wish.komentar)}
        </p>

      `;

    // =================================================
    // ANIMATION DELAY
    // =================================================

    card.style.animationDelay = `${index * 0.06}s`;

    wishList.appendChild(card);
  });
}

// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

// =====================================================
// SUBMIT RSVP
// =====================================================

if (wishForm) {
  wishForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // =================================================
    // AMBIL NAMA
    // =================================================

    const nama = namaInput?.value.trim();

    // =================================================
    // AMBIL UCAPAN
    // =================================================

    const komentar = komentarInput?.value.trim();

    // =================================================
    // AMBIL KEHADIRAN
    // =================================================

    const kehadiran = document.querySelector(
      'input[name="kehadiran"]:checked',
    )?.value;

    // =================================================
    // VALIDASI NAMA
    // =================================================

    if (!nama) {
      showWishMessage("Nama belum diisi.");

      if (namaInput) {
        namaInput.focus();
      }

      return;
    }

    // =================================================
    // VALIDASI PANJANG NAMA
    // =================================================

    if (nama.length > 60) {
      showWishMessage("Nama maksimal 60 karakter.");

      return;
    }

    // =================================================
    // VALIDASI UCAPAN
    // =================================================

    if (!komentar) {
      showWishMessage("Ucapan & doa belum diisi.");

      if (komentarInput) {
        komentarInput.focus();
      }

      return;
    }

    // =================================================
    // VALIDASI PANJANG UCAPAN
    // =================================================

    if (komentar.length > 300) {
      showWishMessage("Ucapan maksimal 300 karakter.");

      return;
    }

    // =================================================
    // VALIDASI KEHADIRAN
    // =================================================

    if (!kehadiran) {
      showWishMessage("Silakan pilih kehadiran.");

      return;
    }

    // =================================================
    // LOADING
    // =================================================

    setSubmitLoading(true);

    hideWishMessage();

    // =================================================
    // DATA GOOGLE FORM
    // =================================================

    const body = new URLSearchParams();

    body.append(RSVP_FIELDS.nama, nama);

    body.append(RSVP_FIELDS.komentar, komentar);

    body.append(RSVP_FIELDS.kehadiran, kehadiran);

    // =================================================
    // DEBUG
    // =================================================

    console.log("=================================");

    console.log("MENGIRIM RSVP");

    console.log("=================================");

    console.log({
      nama,
      komentar,
      kehadiran,
    });

    try {
      // ===============================================
      // KIRIM KE GOOGLE FORM
      // ===============================================

      await fetch(RSVP_FORM_URL, {
        method: "POST",

        mode: "no-cors",

        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },

        body: body.toString(),
      });

      // ===============================================
      // BERHASIL
      // ===============================================

      showWishMessage("Terima kasih atas ucapan dan konfirmasi kehadirannya.");

      // ===============================================
      // RESET FORM
      // ===============================================

      wishForm.reset();

      // ===============================================
      // HADIR KEMBALI MENJADI DEFAULT
      // ===============================================

      const hadirInput = document.querySelector(
        'input[name="kehadiran"][value="Hadir"]',
      );

      if (hadirInput) {
        hadirInput.checked = true;
      }

      // ===============================================
      // RESET CHARACTER COUNTER
      // ===============================================

      if (wishCharacterCount) {
        wishCharacterCount.textContent = "0";
      }

      // ===============================================
      // REFRESH WISHES
      // ===============================================

      if (WISHES_API) {
        setTimeout(() => {
          loadWishes();
        }, 900);
      }
    } catch (error) {
      console.error("GAGAL MENGIRIM RSVP:", error);

      showWishMessage("Maaf, ucapan gagal dikirim.");
    } finally {
      setSubmitLoading(false);
    }
  });
}

// =====================================================
// LOADING BUTTON
// =====================================================

function setSubmitLoading(loading) {
  if (!wishSubmit) {
    return;
  }

  if (loading) {
    wishSubmit.classList.add("loading");

    wishSubmit.disabled = true;
  } else {
    wishSubmit.classList.remove("loading");

    wishSubmit.disabled = false;
  }
}

// =====================================================
// SHOW MESSAGE
// =====================================================

function showWishMessage(message) {
  if (!wishMessage) {
    return;
  }

  wishMessage.textContent = message;

  wishMessage.classList.add("show");
}

// =====================================================
// HIDE MESSAGE
// =====================================================

function hideWishMessage() {
  if (!wishMessage) {
    return;
  }

  wishMessage.classList.remove("show");
}

// =====================================================
// LAZY LOAD WISHES
// =====================================================

const wishesSection = document.querySelector(".wishes-section");

if (wishesSection) {
  let wishesLoaded = false;

  const wishesObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !wishesLoaded) {
          wishesLoaded = true;

          loadWishes();

          observer.unobserve(entry.target);
        }
      });
    },

    {
      threshold: 0,

      rootMargin: "500px 0px",
    },
  );

  wishesObserver.observe(wishesSection);
}
// =========================================================
// WEDDING GIFT
// COPY DATA
// =========================================================

const giftCopyButtons = document.querySelectorAll(".gift-copy-button");

const giftCopyMessage = document.getElementById("giftCopyMessage");

let giftCopyTimer = null;

// =========================================================
// SHOW COPY MESSAGE
// =========================================================

function showGiftCopyMessage(message) {
  if (!giftCopyMessage) {
    return;
  }

  giftCopyMessage.textContent = message;

  giftCopyMessage.classList.add("show");

  clearTimeout(giftCopyTimer);

  giftCopyTimer = setTimeout(() => {
    giftCopyMessage.classList.remove("show");
  }, 2000);
}

// =========================================================
// FALLBACK COPY
// Safari / browser mobile compatibility
// =========================================================

function fallbackGiftCopy(value) {
  const textarea = document.createElement("textarea");

  textarea.value = value;

  textarea.setAttribute("readonly", "");

  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.width = "1px";
  textarea.style.height = "1px";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);

  textarea.focus();

  textarea.select();

  textarea.setSelectionRange(0, textarea.value.length);

  let success = false;

  try {
    success = document.execCommand("copy");
  } catch (error) {
    console.log("Legacy copy gagal:", error);

    success = false;
  }

  textarea.remove();

  return success;
}

// =========================================================
// COPY FUNCTION
// =========================================================

async function copyGiftValue(value) {
  const fallbackSuccess = fallbackGiftCopy(value);

  if (fallbackSuccess) {
    return true;
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);

      return true;
    } catch (error) {
      console.log("Clipboard API gagal:", error);
    }
  }

  return false;
}

// =========================================================
// COPY BUTTON EVENT
// =========================================================

giftCopyButtons.forEach((button) => {
  button.addEventListener("click", async (event) => {
    event.preventDefault();

    // =============================================
    // DATA COPY
    // =============================================

    const copyValue = String(button.dataset.copy || "").trim();

    // =============================================
    // SUCCESS MESSAGE
    // =============================================

    const copyMessage = button.dataset.message || "Berhasil disalin";

    if (!copyValue) {
      return;
    }

    // =============================================
    // COPY
    // =============================================

    const success = await copyGiftValue(copyValue);

    // =============================================
    // RESULT
    // =============================================

    if (success) {
      showGiftCopyMessage(copyMessage);
    } else {
      showGiftCopyMessage("Gagal menyalin. Silakan salin secara manual.");
    }
  });
});

// =========================================================
// BACKGROUND MUSIC SYSTEM
// + CUSTOM LOOP
// + FADE IN / FADE OUT
// + VIDEO CONNECTION
// + AUTOPLAY UNLOCK
// =========================================================

(() => {
  // =======================================================
  // ELEMENT
  // =======================================================

  const music = document.getElementById("backgroundMusic");
  const musicButton = document.getElementById("musicToggle");
  const galleryVideo = document.querySelector(".gallery-video-element");

  // Kalau elemen musik tidak ditemukan, hentikan sistem
  if (!music) {
    console.warn("Elemen #backgroundMusic tidak ditemukan.");
    return;
  }

  // =======================================================
  // MUSIC SETTINGS
  // =======================================================

  // MULAI MUSIK
  const MUSIC_START_MINUTE = 3;
  const MUSIC_START_SECOND = 0;

  // AKHIR MUSIK
  const MUSIC_END_MINUTE = 4;
  const MUSIC_END_SECOND = 35;

  // FADE
  const MUSIC_FADE_IN_DURATION = 3000;
  const MUSIC_FADE_OUT_DURATION = 3000;

  // VOLUME MAKSIMAL
  // 0.7 = 70%
  const MUSIC_MAX_VOLUME = 0.7;

  // =======================================================
  // CONVERT TIME TO SECOND
  // =======================================================

  const MUSIC_START_TIME = MUSIC_START_MINUTE * 60 + MUSIC_START_SECOND;

  const MUSIC_END_TIME = MUSIC_END_MINUTE * 60 + MUSIC_END_SECOND;

  const MUSIC_FADE_OUT_START = MUSIC_END_TIME - MUSIC_FADE_OUT_DURATION / 1000;

  // =======================================================
  // STATE
  // =======================================================

  let fadeAnimationFrame = null;
  let monitorAnimationFrame = null;

  let isFadingOut = false;
  let isLooping = false;

  let musicWasPlayingBeforeVideo = false;

  // =======================================================
  // DEBUG
  // =======================================================

  console.log(
    `Music Range: ${MUSIC_START_MINUTE}:${String(MUSIC_START_SECOND).padStart(
      2,
      "0",
    )} - ${MUSIC_END_MINUTE}:${String(MUSIC_END_SECOND).padStart(2, "0")}`,
  );

  // =======================================================
  // MUSIC BUTTON
  // =======================================================

  function updateMusicButton() {
    if (!musicButton) {
      return;
    }

    if (!music.paused) {
      musicButton.classList.add("is-playing");

      musicButton.setAttribute("aria-label", "Pause music");
    } else {
      musicButton.classList.remove("is-playing");

      musicButton.setAttribute("aria-label", "Play music");
    }
  }

  // =======================================================
  // CANCEL FADE
  // =======================================================

  function cancelMusicFade() {
    if (fadeAnimationFrame) {
      cancelAnimationFrame(fadeAnimationFrame);

      fadeAnimationFrame = null;
    }
  }

  // =======================================================
  // STOP MONITOR
  // =======================================================

  function stopMusicMonitor() {
    if (monitorAnimationFrame) {
      cancelAnimationFrame(monitorAnimationFrame);

      monitorAnimationFrame = null;
    }
  }

  // =======================================================
  // GENERIC VOLUME FADE
  // =======================================================

  function fadeMusic(fromVolume, toVolume, duration, callback) {
    cancelMusicFade();

    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;

      const progress = Math.min(elapsed / duration, 1);

      const newVolume = fromVolume + (toVolume - fromVolume) * progress;

      music.volume = Math.max(0, Math.min(1, newVolume));

      if (progress < 1) {
        fadeAnimationFrame = requestAnimationFrame(animate);
      } else {
        fadeAnimationFrame = null;

        if (callback) {
          callback();
        }
      }
    }

    fadeAnimationFrame = requestAnimationFrame(animate);
  }

  // =======================================================
  // FADE IN
  // =======================================================

  function fadeInMusic() {
    music.volume = 0;

    fadeMusic(0, MUSIC_MAX_VOLUME, MUSIC_FADE_IN_DURATION);
  }

  // =======================================================
  // FADE OUT
  // =======================================================

  function fadeOutMusic() {
    if (isFadingOut) {
      return;
    }

    isFadingOut = true;

    const remainingTime = Math.max(
      100,
      (MUSIC_END_TIME - music.currentTime) * 1000,
    );

    fadeMusic(music.volume, 0, remainingTime, () => {
      restartMusicLoop();
    });
  }

  // =======================================================
  // RESTART LOOP
  // =======================================================

  async function restartMusicLoop() {
    if (isLooping) {
      return;
    }

    isLooping = true;

    cancelMusicFade();

    music.currentTime = MUSIC_START_TIME;

    music.volume = 0;

    isFadingOut = false;

    try {
      // Jika ternyata audio sedang pause,
      // hidupkan kembali.
      if (music.paused) {
        await music.play();
      }

      fadeInMusic();

      updateMusicButton();

      startMusicMonitor();
    } catch (error) {
      console.log("Music loop gagal:", error);
    }

    isLooping = false;
  }

  // =======================================================
  // MUSIC MONITOR
  // =======================================================

  function monitorMusic() {
    // Jangan monitor kalau musik pause
    if (music.paused) {
      monitorAnimationFrame = null;

      return;
    }

    // =====================================================
    // SUDAH MENCAPAI BATAS END
    // =====================================================

    if (music.currentTime >= MUSIC_END_TIME) {
      restartMusicLoop();

      return;
    }

    // =====================================================
    // MULAI FADE OUT
    // =====================================================

    if (music.currentTime >= MUSIC_FADE_OUT_START && !isFadingOut) {
      fadeOutMusic();
    }

    monitorAnimationFrame = requestAnimationFrame(monitorMusic);
  }

  // =======================================================
  // START MONITOR
  // =======================================================

  function startMusicMonitor() {
    stopMusicMonitor();

    monitorAnimationFrame = requestAnimationFrame(monitorMusic);
  }

  // =======================================================
  // PLAY MUSIC
  // =======================================================

  async function playMusic(useFade = true) {
    cancelMusicFade();

    isFadingOut = false;

    // Kalau posisi berada di luar range,
    // kembali ke START.
    if (
      music.currentTime < MUSIC_START_TIME ||
      music.currentTime >= MUSIC_END_TIME
    ) {
      music.currentTime = MUSIC_START_TIME;
    }

    if (useFade) {
      music.volume = 0;
    } else {
      music.volume = MUSIC_MAX_VOLUME;
    }

    try {
      await music.play();

      updateMusicButton();

      startMusicMonitor();

      if (useFade) {
        fadeInMusic();
      }

      return true;
    } catch (error) {
      updateMusicButton();

      throw error;
    }
  }

  // =======================================================
  // PAUSE MUSIC
  // =======================================================

  function pauseMusic() {
    cancelMusicFade();

    stopMusicMonitor();

    isFadingOut = false;

    music.pause();

    updateMusicButton();
  }

  // =======================================================
  // INITIAL MUSIC POSITION
  // =======================================================

  function initializeMusic() {
    // Pastikan native loop tidak digunakan
    music.loop = false;

    music.volume = MUSIC_MAX_VOLUME;

    // Set posisi pertama
    music.currentTime = MUSIC_START_TIME;

    updateMusicButton();
  }

  // =======================================================
  // WAIT METADATA
  // =======================================================

  if (music.readyState >= 1) {
    initializeMusic();
  } else {
    music.addEventListener("loadedmetadata", initializeMusic, {
      once: true,
    });
  }

  // =======================================================
  // MUSIC BUTTON CLICK
  // =======================================================

  if (musicButton) {
    musicButton.addEventListener("click", async (event) => {
      event.stopPropagation();

      // Jangan hidupkan background music
      // ketika video sedang berjalan.
      if (galleryVideo && !galleryVideo.paused && !galleryVideo.ended) {
        return;
      }

      if (music.paused) {
        try {
          await playMusic(true);
        } catch (error) {
          console.log("Music tidak dapat dimainkan:", error);
        }
      } else {
        pauseMusic();
      }
    });
  }

  // =======================================================
  // VIDEO + BACKGROUND MUSIC
  // =======================================================

  if (galleryVideo) {
    // =====================================================
    // VIDEO PLAY
    // =====================================================

    galleryVideo.addEventListener("play", () => {
      /*
          Simpan kondisi musik sebelum video berjalan.

          true  = musik sebelumnya sedang hidup.
          false = musik sebelumnya memang sudah dimatikan.
        */

      musicWasPlayingBeforeVideo = !music.paused;

      // Kalau musik sedang hidup,
      // hentikan sementara.
      if (musicWasPlayingBeforeVideo) {
        pauseMusic();
      }
    });

    // =====================================================
    // VIDEO PAUSE
    // =====================================================

    galleryVideo.addEventListener("pause", async () => {
      /*
          Kalau video pause karena mencapai akhir,
          jangan jalankan di sini.

          Event "ended" yang akan mengurusnya.
        */

      if (galleryVideo.ended) {
        return;
      }

      await resumeMusicAfterVideo();
    });

    // =====================================================
    // VIDEO ENDED
    // =====================================================

    galleryVideo.addEventListener("ended", async () => {
      await resumeMusicAfterVideo();
    });
  }

  // =======================================================
  // RESUME MUSIC AFTER VIDEO
  // =======================================================

  async function resumeMusicAfterVideo() {
    /*
      Kalau musik sebelum video memang sudah
      dalam keadaan mati, jangan hidupkan.
    */

    if (!musicWasPlayingBeforeVideo) {
      return;
    }

    // Reset state dulu supaya tidak dipanggil dua kali
    musicWasPlayingBeforeVideo = false;

    try {
      await playMusic(true);
    } catch (error) {
      console.log("Gagal melanjutkan background music:", error);
    }
  }

  // =======================================================
  // AUTOPLAY
  // =======================================================

  async function tryAutoplayMusic() {
    /*
      Pastikan metadata sudah tersedia.
    */

    if (music.readyState < 1) {
      return;
    }

    try {
      await playMusic(true);

      removeMusicUnlockListeners();

      console.log("Background music autoplay berhasil.");
    } catch (error) {
      console.log("Autoplay diblokir browser.");
    }
  }

  // =======================================================
  // AUTOPLAY AFTER METADATA
  // =======================================================

  if (music.readyState >= 1) {
    tryAutoplayMusic();
  } else {
    music.addEventListener("loadedmetadata", tryAutoplayMusic, {
      once: true,
    });
  }

  // =======================================================
  // UNLOCK MUSIC AFTER FIRST USER INTERACTION
  // =======================================================

  async function unlockMusic(event) {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    /*
      JANGAN unlock ketika user sedang
      menekan video.
    */

    if (target.closest(".gallery-video")) {
      return;
    }

    /*
      JANGAN unlock melalui tombol music,
      karena tombol music punya event sendiri.
    */

    if (target.closest("#musicToggle")) {
      return;
    }

    /*
      Kalau musik sudah berjalan,
      listener tidak diperlukan lagi.
    */

    if (!music.paused) {
      removeMusicUnlockListeners();

      return;
    }

    try {
      await playMusic(true);

      console.log("Background music unlocked.");

      removeMusicUnlockListeners();
    } catch (error) {
      console.log("Background music masih diblokir:", error);
    }
  }

  // =======================================================
  // REMOVE UNLOCK LISTENER
  // =======================================================

  function removeMusicUnlockListeners() {
    document.removeEventListener("click", unlockMusic);

    document.removeEventListener("touchstart", unlockMusic);
  }

  // =======================================================
  // ADD UNLOCK LISTENER
  // =======================================================

  document.addEventListener("click", unlockMusic);

  document.addEventListener("touchstart", unlockMusic, {
    passive: true,
  });

  // =======================================================
  // AUDIO EVENTS
  // =======================================================

  music.addEventListener("play", () => {
    updateMusicButton();
  });

  music.addEventListener("pause", () => {
    updateMusicButton();
  });

  // =======================================================
  // FALLBACK
  // =======================================================

  music.addEventListener("ended", () => {
    restartMusicLoop();
  });
})();
// ANIMASI GLOBAL //
// =========================================================
// GLOBAL REVEAL ON SCROLL
// =========================================================

const revealScrollItems = document.querySelectorAll(".reveal-scroll");

const revealScrollObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // MASUK VIEWPORT
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }

      // KELUAR VIEWPORT
      else {
        entry.target.classList.remove("is-visible");
      }
    });
  },

  {
    threshold: 0.15,

    rootMargin: "0px 0px -5% 0px",
  },
);

revealScrollItems.forEach((item) => {
  revealScrollObserver.observe(item);
});
// =========================================================
// GLOBAL REVEAL ANIMATION
// =========================================================

const revealElements = document.querySelectorAll(
  ".reveal-up, .reveal-left, .reveal-right",
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // MASUK VIEWPORT
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }

      // KELUAR VIEWPORT
      else {
        entry.target.classList.remove("is-visible");
      }
    });
  },

  {
    threshold: 0.15,

    rootMargin: "0px 0px -5% 0px",
  },
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});
