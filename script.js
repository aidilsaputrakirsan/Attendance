document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("absensiForm");
    const loader = document.getElementById("loader");
    const snackbar = document.getElementById("snackbar");
    const submittedList = document.getElementById("submittedList");
  
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
  
    // Fungsi menambahkan item ke live feed
    function updateLiveFeed(data) {
      submittedList.innerHTML = ""; // kosongkan daftar
      data.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("submitted-item");
        div.textContent = `Nama: ${item.name} | NIM: ${item.nim}`;
        submittedList.appendChild(div);
      });
    }
  
    // Callback JSONP: Fungsi ini akan dipanggil oleh Apps Script
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
  
      // URL endpoint doGet() dengan parameter callback
      const liveFeedURL = "https://script.google.com/macros/s/AKfycbyvXrf_YpACpL7ukSB-uMz41MbtV7zv1Q4HZ_aNNgjDkqmmToeozkyYF2_x2kyWrs1C/exec?callback=updateData&mk=" + encodeURIComponent("Cloud Computing");
      const script = document.createElement("script");
      script.id = "jsonpScript";
      script.src = liveFeedURL;
      document.body.appendChild(script);
    }
  
    // Mulai polling setiap 3 detik
    setInterval(fetchLiveData, 3000);
    fetchLiveData(); // panggil sekali saat awal
  
    // Event submit form untuk mengirim absensi via POST
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
  
        // URL untuk POST absensi (gunakan deployment URL terbaru)
        const scriptURL = "https://script.google.com/macros/s/AKfycbxx01WvN9rVgi3tevpmp0RkUf9HJ-92zvXvA9VNBE5yi3_j1SDshXuZlDZu62vPOGKo/exec";
        await fetch(scriptURL, {
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
  