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
      // Kosongkan daftar saat ini
      submittedList.innerHTML = "";
      data.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("submitted-item");
        div.textContent = `Nama: ${item.name} | NIM: ${item.nim}`;
        submittedList.appendChild(div);
      });
    }
  
    // Fungsi polling untuk ambil data live dari doGet() setiap 3 detik
    function fetchLiveData() {
      // URL doGet (gunakan deployment URL yang sama; GET request akan memanggil doGet())
      const liveFeedURL = "https://script.google.com/macros/s/AKfycbyvXrf_YpACpL7ukSB-uMz41MbtV7zv1Q4HZ_aNNgjDkqmmToeozkyYF2_x2kyWrs1C/exec";
      fetch(liveFeedURL)
        .then((response) => response.json())
        .then((result) => {
          if (result.status === "success") {
            updateLiveFeed(result.data);
          } else {
            console.error("Error fetching live data:", result.message);
          }
        })
        .catch((error) => {
          console.error("Error fetching live data:", error);
        });
    }
  
    // Mulai polling setiap 3 detik
    setInterval(fetchLiveData, 3000);
  
    // Event submit form untuk mengirim absensi
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
        const lokasi = await getLocation();
        document.getElementById("lokasi").value = lokasi;
  
        const data = {
          name: nama,
          nim: nim,
          kelas: kelas,
          mataKuliah: mataKuliah,
          lokasi: lokasi
        };
  
        // URL web app untuk POST (gunakan deployment URL terbaru)
        const scriptURL = "https://script.google.com/macros/s/AKfycbz9FKRuL-kxzEKmWy6gIDQaOZiZJPNzcWHsEDojGY9827-s-Fd-fvkFgpFYL7whHrI/exec";
  
        // Kirim data absensi dengan POST menggunakan mode "no-cors"
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
  