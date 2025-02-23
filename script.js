document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("absensiForm");
  const loader = document.getElementById("loader");
  const snackbar = document.getElementById("snackbar");
  const submittedList = document.getElementById("submittedList");
  const liveMK = document.getElementById("liveMK");
  const currentPekanLabel = document.getElementById("currentPekan");

  // Fungsi menampilkan snackbar
  function showSnackbar(message) {
    snackbar.textContent = message;
    snackbar.className = "snackbar show";
    setTimeout(() => {
      snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
  }

  // Fungsi mendapatkan lokasi (opsional)
  function getLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            resolve(lat + "," + lng);
          },
          (error) => {
            reject("Lokasi tidak dapat diakses.");
          }
        );
      } else {
        reject("Geolocation tidak didukung oleh browser ini.");
      }
    });
  }

  // Fungsi menambahkan data ke live feed
  function updateLiveFeed(data) {
    submittedList.innerHTML = ""; // kosongkan daftar
    // Jika ada data, ambil pekan aktif dari baris pertama
    if (data.length > 0) {
      currentPekanLabel.textContent = data[0].pekan;
    } else {
      currentPekanLabel.textContent = "-";
    }
    data.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("submitted-item");
      // Tampilkan Nama dan NIM saja
      div.textContent = `Nama: ${item.name} | NIM: ${item.nim}`;
      submittedList.appendChild(div);
    });
  }

  // Callback JSONP: fungsi yang akan dipanggil oleh Apps Script
  window.updateData = function(response) {
    if (response.status === "success") {
      updateLiveFeed(response.data);
    } else {
      console.error("Error:", response.message);
    }
  };

  // Fungsi untuk memanggil doGet() menggunakan JSONP
  function fetchLiveData() {
    // Hapus script JSONP lama jika ada
    const oldScript = document.getElementById("jsonpScript");
    if (oldScript) oldScript.remove();

    const baseURL = "https://script.google.com/macros/s/AKfycbx3SskQQKGIjjBdLVypcfxlM-lMnlIJZyKVfmIBD3YZlQpKGumQi8oH8x6kyZvpUSQI/exec";
    // Ambil MK yang dipilih dari dropdown liveMK
    const selectedMK = liveMK.value;
    // URL dengan parameter callback dan sheet (selected MK)
    const liveFeedURL = `${baseURL}?callback=updateData&sheet=${encodeURIComponent(selectedMK)}`;
    
    const script = document.createElement("script");
    script.id = "jsonpScript";
    script.src = liveFeedURL;
    document.body.appendChild(script);
  }

  // Mulai polling setiap 3 detik untuk ambil data live
  setInterval(fetchLiveData, 3000);
  fetchLiveData(); // panggil sekali saat awal

  // Jika pengguna mengganti pilihan MK live feed, segera refresh data
  liveMK.addEventListener("change", fetchLiveData);

  // Event submit form untuk mengirim data absensi via POST
  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const nim = document.getElementById("nim").value.trim();
    const kelas = document.getElementById("kelas").value;
    const mataKuliah = document.getElementById("mataKuliah").value;

    if (!nama || !nim || !kelas || !mataKuliah) {
      showSnackbar("Mohon lengkapi semua data.");
      return;
    }

    loader.style.display = "block";
    try {
      const lokasi = await getLocation().catch(() => "");
      document.getElementById("lokasi").value = lokasi;
      const data = {
        name: nama,
        nim: nim,
        kelas: kelas,
        mataKuliah: mataKuliah,
        lokasi: lokasi
      };

      const postURL = "https://script.google.com/macros/s/AKfycbx3SskQQKGIjjBdLVypcfxlM-lMnlIJZyKVfmIBD3YZlQpKGumQi8oH8x6kyZvpUSQI/exec";
      await fetch(postURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      showSnackbar("Absensi berhasil!");
      form.reset();
    } catch (error) {
      showSnackbar(error);
    } finally {
      loader.style.display = "none";
    }
  });
});
