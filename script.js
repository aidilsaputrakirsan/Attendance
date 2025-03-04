document.addEventListener("DOMContentLoaded", function() {
  // Get DOM elements
  const form = document.getElementById("absensiForm");
  const loader = document.getElementById("loader");
  const notification = document.getElementById("notification");
  const notificationMessage = notification.querySelector(".notification-message");
  const notificationClose = notification.querySelector(".notification-close");
  const submittedList = document.getElementById("submittedList");
  const liveMKElement = document.getElementById("liveMK");
  const currentPekanLabel = document.getElementById("currentPekan");
  const particles = document.getElementById("particles");
  
  // Create animated background particles
  createParticles();
  
  // Notification close button
  notificationClose.addEventListener("click", function() {
    notification.classList.remove("show");
  });
  
  // Waktu maksimal polling (dalam ms) → 7 menit
  const MAX_POLLING_DURATION = 7 * 60 * 1000; // 420.000 ms
  // Interval polling (dalam ms) → 5 detik
  const POLLING_INTERVAL = 5000;

  // Variabel untuk menyimpan ID interval dan waktu mulai polling
  let pollIntervalId = null;
  let pollStartTime = null;

  /**
   * Show notification with different status types
   * @param {string} message - The message to display
   * @param {string} type - The type of notification (success, error, warning)
   */
  function showNotification(message, type = "success") {
    notificationMessage.textContent = message;
    
    // Remove all status classes
    notification.classList.remove("success", "error", "warning");
    
    // Add the specific type class
    notification.classList.add(type);
    
    // Set the icon based on type
    const iconElement = notification.querySelector(".notification-icon");
    iconElement.className = "notification-icon";
    
    switch(type) {
      case "success":
        iconElement.classList.add("fas", "fa-check-circle");
        break;
      case "error":
        iconElement.classList.add("fas", "fa-exclamation-circle");
        break;
      case "warning":
        iconElement.classList.add("fas", "fa-exclamation-triangle");
        break;
      default:
        iconElement.classList.add("fas", "fa-info-circle");
    }
    
    // Show the notification
    notification.classList.add("show");
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  /**
   * Get current geolocation
   * @returns {Promise<string>} - Latitude and longitude as string
   */
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

  /**
   * Update live feed with smooth transition
   * @param {Array} data - Array of attendance data
   */
  function updateLiveFeed(data) {
    submittedList.classList.add("fade-out");
    
    setTimeout(() => {
      submittedList.innerHTML = "";
      
      if (currentPekanLabel) {
        currentPekanLabel.textContent = data.length > 0 ? data[0].pekan : "-";
      }
      
      data.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("attendance-item");
        div.textContent = `${item.name} - ${item.nim}`;
        
        // Add animation delay for staggered effect
        div.style.animationDelay = `${Math.random() * 0.5}s`;
        
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
      showNotification("Failed to fetch attendance data", "error");
    }
  };

  /**
   * Fetch live data via JSONP
   */
  function fetchLiveData() {
    const oldScript = document.getElementById("jsonpScript");
    if (oldScript) oldScript.remove();

    // Ganti baseURL dengan URL Web App deployment Anda
    const baseURL = "https://script.google.com/macros/s/AKfycbzQcm6b6ej9XEei8Jd-o1P684w-YEmY46e5MLmxv6bRvL-_aFjX3yXorIpoANomjKea/exec";
    const selectedMK = liveMKElement ? liveMKElement.value : "Cloud Computing";
    const liveFeedURL = `${baseURL}?callback=updateData&sheet=${encodeURIComponent(selectedMK)}`;

    const script = document.createElement("script");
    script.id = "jsonpScript";
    script.src = liveFeedURL;
    document.body.appendChild(script);
  }

  /**
   * Start polling for live data
   */
  function startPolling() {
    pollStartTime = Date.now();
    
    // First fetch
    fetchLiveData();
    
    // Show initial loading indication
    loader.style.display = "block";
    
    // Set interval for polling
    pollIntervalId = setInterval(() => {
      const elapsed = Date.now() - pollStartTime;
      
      if (elapsed >= MAX_POLLING_DURATION) {
        // Stop polling after max duration
        clearInterval(pollIntervalId);
        pollIntervalId = null;
        showNotification("Live feed auto-stopped after 7 minutes", "warning");
        return;
      }
      
      // Continue fetching data
      fetchLiveData();
    }, POLLING_INTERVAL);
  }

  // Start polling when DOM is ready
  startPolling();
  
  // If user changes the MK for live feed, refresh data immediately
  if (liveMKElement) {
    liveMKElement.addEventListener("change", function() {
      showNotification(`Fetching data for ${this.value}...`);
      fetchLiveData();
    });
  }

  /**
   * Form submission handler
   */
  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    // Get form data
    const nama = document.getElementById("nama").value.trim();
    const nim = document.getElementById("nim").value.trim();
    const kelas = document.getElementById("kelas").value;
    const mataKuliah = document.getElementById("mataKuliah").value;

    // Validate form
    if (!nama || !nim || !kelas || !mataKuliah) {
      showNotification("Please complete all fields", "error");
      return;
    }

    // Show loader
    loader.style.display = "block";
    
    try {
      // Get location
      const lokasi = await getLocation().catch(() => "");
      document.getElementById("lokasi").value = lokasi;
      
      // Prepare data for submission
      const data = {
        name: nama,
        nim: nim,
        kelas: kelas,
        mataKuliah: mataKuliah,
        lokasi: lokasi
      };

      // Submit data
      const postURL = "https://script.google.com/macros/s/AKfycbzQcm6b6ej9XEei8Jd-o1P684w-YEmY46e5MLmxv6bRvL-_aFjX3yXorIpoANomjKea/exec";
      
      await fetch(postURL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      // Show success and reset form
      showNotification("Attendance submitted successfully!", "success");
      
      // Add a small animation to the button to indicate success
      const submitButton = form.querySelector("button[type='submit']");
      submitButton.innerHTML = '<i class="fas fa-check"></i><span>Success!</span>';
      submitButton.style.backgroundColor = "var(--success-color)";
      
      setTimeout(() => {
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i><span>Submit Absensi</span>';
        submitButton.style.backgroundColor = "";
      }, 2000);
      
      // Reset form after successful submission
      form.reset();
      
      // Refresh live feed after submission
      setTimeout(fetchLiveData, 1000);
      
    } catch (error) {
      showNotification(error, "error");
    } finally {
      // Hide loader
      loader.style.display = "none";
    }
  });
  
  /**
   * Create animated background particles
   */
  function createParticles() {
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      
      // Random size
      const size = Math.random() * 20 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random animation duration
      particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
      
      // Random delay
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      // Add to container
      particles.appendChild(particle);
    }
  }
  
  // Add input animation effects
  const inputs = document.querySelectorAll('.form-control');
  
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.parentElement.classList.remove('focused');
    });
  });
});