// Setelah halaman termuat
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
  
    // Fungsi mendapatkan lokasi (jika diperlukan)
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
  
    // Fungsi untuk menambahkan item mahasiswa yang baru absen ke daftar
    function addSubmittedItem(nama, nim) {
      const item = document.createElement("div");
      item.classList.add("submitted-item");
      item.textContent = `Nama: ${nama} | NIM: ${nim}`;
      submittedList.prepend(item); // prepend agar item terbaru di atas
    }
  
    // Event saat form di-submit
    form.addEventListener("submit", async function(e) {
      e.preventDefault();
  
      // Ambil nilai dari input
      const nama = document.getElementById("nama").value.trim();
      const nim = document.getElementById("nim").value.trim();
      const kelas = document.getElementById("kelas").value;
      const mataKuliah = document.getElementById("mataKuliah").value;
  
      // Validasi sederhana di sisi klien
      if (!nama || !nim || !kelas || !mataKuliah) {
        showSnackbar("Mohon lengkapi semua data.");
        return;
      }
  
      loader.style.display = "block";
      try {
        // Ambil lokasi (opsional, bisa dihapus jika tidak ingin lokasi)
        const lokasi = await getLocation();
        document.getElementById("lokasi").value = lokasi;
  
        // Data yang akan dikirim ke Apps Script
        const data = {
          name: nama,
          nim: nim,
          kelas: kelas,
          mataKuliah: mataKuliah,
          lokasi: lokasi
        };
  
        // Ganti dengan URL Web App Google Apps Script Anda
        const scriptURL =
          "https://script.google.com/macros/s/AKfycbzh5oPuajwPqq8rGLF-PG_WiGy6fxg8pzxuL69OcYWmvGMP32lOWxXDY3rZbvOEZJvK/exec";
  
        // Gunakan mode "no-cors" agar request tidak diblokir oleh CORS
        await fetch(scriptURL, {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        });
  
        // Karena respons "opaque", kita anggap sukses jika tidak ada error jaringan
        showSnackbar("Absensi berhasil!");
        form.reset();
  
        // Tampilkan data mahasiswa yang baru absen di bawah form
        addSubmittedItem(nama, nim);
      } catch (error) {
        showSnackbar(error);
      } finally {
        loader.style.display = "none";
      }
    });
  });
  