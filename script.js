document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById("absensiForm");
  const loader = document.getElementById("loader");
  const snackbar = document.getElementById("snackbar");
  const submittedList = document.getElementById("submittedList");
  const liveMKElement = document.getElementById("liveMK");
  const liveMK = liveMKElement ? liveMKElement : { value: "Cloud Computing" };
  const currentPekanLabel = document.getElementById("currentPekan");

  function showSnackbar(message) {
    snackbar.textContent = message;
    snackbar.className = "snackbar show";
    setTimeout(() => {
      snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
  }

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

  function updateLiveFeed(data) {
    // Tambahkan transisi halus
    submittedList.classList.add("fade-out");
    setTimeout(() => {
      submittedList.innerHTML = "";
      // Update label currentPekan jika data tersedia
      if (currentPekanLabel) {
        currentPekanLabel.textContent = data.length > 0 ? data[0].pekan : "-";
      }
      data.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("submitted-item");
        // Format tampilannya: "Name - NIM"
        div.textContent = `${item.name} - ${item.nim}`;
        submittedList.appendChild(div);
      });
      submittedList.classList.remove("fade-out");
      submittedList.classList.add("fade-in");
      setTimeout(() => {
        submittedList.classList.remove("fade-in");
      }, 500);
    }, 300);
  }

  // Callback JSONP
  window.updateData = function(response) {
    if (response.status === "success") {
      updateLiveFeed(response.data);
    } else {
      console.error("Error:", response.message);
    }
  };

  function fetchLiveData() {
    const oldScript = document.getElementById("jsonpScript");
    if (oldScript) oldScript.remove();
    const baseURL = "https://script.google.com/macros/s/AKfycbzQcm6b6ej9XEei8Jd-o1P684w-YEmY46e5MLmxv6bRvL-_aFjX3yXorIpoANomjKea/exec";
    const selectedMK = liveMK.value;
    const liveFeedURL = `${baseURL}?callback=updateData&sheet=${encodeURIComponent(selectedMK)}`;
    const script = document.createElement("script");
    script.id = "jsonpScript";
    script.src = liveFeedURL;
    document.body.appendChild(script);
  }

  // Polling live feed setiap 3 detik
  setInterval(fetchLiveData, 3000);
  fetchLiveData();

  if (liveMKElement) {
    liveMKElement.addEventListener("change", fetchLiveData);
  }

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
      const postURL = "https://script.google.com/macros/s/AKfycbzQcm6b6ej9XEei8Jd-o1P684w-YEmY46e5MLmxv6bRvL-_aFjX3yXorIpoANomjKea/exec";
      await fetch(postURL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
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
