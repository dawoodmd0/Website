// Maps and location handling
document.addEventListener("DOMContentLoaded", () => {
    const map = initializeMap();
    const currentLocationText = document.getElementById("currentLocation");
    const selectedLocationText = document.getElementById("selectedLocation");
    const confirmButton = document.getElementById("confirmLocation");
    const loadingOverlay = document.getElementById("loadingOverlay");
    let selectedPosition = null;
  
    // Initialize map
    function initializeMap() {
      const mapOptions = {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 14,
      };
      const map = new google.maps.Map(document.getElementById("map"), mapOptions);
  
      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            map.setCenter(pos);
            currentLocationText.textContent = `Lat: ${pos.lat.toFixed(6)}, Lng: ${pos.lng.toFixed(6)}`;
  
            // Add marker for current location
            new google.maps.Marker({
              position: pos,
              map: map,
              title: "Your Location",
            });
          },
          () => {
            currentLocationText.textContent = "Error: Location access denied";
          },
        );
      }
  
      // Add click listener to map
      map.addListener("click", (e) => {
        selectedPosition = e.latLng;
        selectedLocationText.textContent = `Lat: ${selectedPosition.lat().toFixed(6)}, Lng: ${selectedPosition.lng().toFixed(6)}`;
        confirmButton.disabled = false;
      });
  
      return map;
    }
  
    // Handle location confirmation
    confirmButton?.addEventListener("click", async () => {
      if (!selectedPosition) return;
  
      loadingOverlay.classList.remove("hidden");
  
      try {
        const availability = await checkAvailability(selectedPosition);
  
        if (availability.available) {
          // Store selected location
          sessionStorage.setItem(
            "selected_location",
            JSON.stringify({
              lat: selectedPosition.lat(),
              lng: selectedPosition.lng(),
              address: availability.address,
            }),
          );
  
          // Redirect to slot selection
          window.location.href = "slot-types.html";
        } else {
          alert(
            "No parking slots available at this location. Please select another location.",
          );
        }
      } catch (error) {
        alert("Error checking availability. Please try again.");
      } finally {
        loadingOverlay.classList.add("hidden");
      }
    });
  
    // Simulate availability check
    async function checkAvailability(position) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            available: Math.random() > 0.3, // 70% chance of availability
            address: "Sample Street 123",
          });
        }, 1500);
      });
    }
  
    // Handle logout
    document.getElementById("logout")?.addEventListener("click", () => {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      window.location.href = "login.html";
    });
  });
  