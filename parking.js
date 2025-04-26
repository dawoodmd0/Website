document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const locationGrid = document.getElementById("location-grid");
    const modal = document.getElementById("message-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalMessage = document.getElementById("modal-message");
    const modalClose = document.getElementById("modal-close");
  
    // Simulated parking data
    const parkingData = {
      downtown: { total: 30, available: 25, minSpots: 20 },
      mall: { total: 50, available: 12, minSpots: 10 },
      airport: { total: 100, available: 8, minSpots: 15 },
      station: { total: 40, available: 15, minSpots: 5 },
    };
  
    // Event Listeners
    locationGrid.addEventListener("click", handleLocationSelection);
    modalClose.addEventListener("click", () => modal.classList.add("hidden"));
  
    // Handle location selection
    function handleLocationSelection(event) {
      const button = event.target.closest(".check-btn");
      if (!button) return;
  
      const locationCard = button.closest(".location-card");
      const locationId = locationCard.dataset.location;
      const locationData = parkingData[locationId];
  
      if (isLocationAvailable(locationData)) {
        // Store selected location in sessionStorage
        sessionStorage.setItem("selectedLocation", locationId);
        sessionStorage.setItem("availableSpots", locationData.available);
  
        // Redirect to booking page
        window.location.href = "booking.html";
      } else {
        showModal(
          "Location Unavailable",
          `Sorry, this location currently has limited parking spots available (${locationData.available}). Please select another location.`,
        );
      }
    }
  
    // Check if location has enough available spots
    function isLocationAvailable(locationData) {
      return locationData.available >= locationData.minSpots;
    }
  
    // Show modal with message
    function showModal(title, message) {
      modalTitle.textContent = title;
      modalMessage.textContent = message;
      modal.classList.remove("hidden");
    }
  
    // Real-time availability updates simulation
    function updateAvailability() {
      Object.keys(parkingData).forEach((location) => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        parkingData[location].available = Math.max(
          0,
          Math.min(
            parkingData[location].total,
            parkingData[location].available + change,
          ),
        );
  
        // Update UI
        const locationCard = document.querySelector(
          `[data-location="${location}"]`,
        );
        const availabilitySpan = locationCard.querySelector(".availability span");
        availabilitySpan.textContent = parkingData[location].available;
  
        // Update availability status visual feedback
        if (isLocationAvailable(parkingData[location])) {
          availabilitySpan.classList.remove("text-red-600");
          availabilitySpan.classList.add("text-green-600");
        } else {
          availabilitySpan.classList.remove("text-green-600");
          availabilitySpan.classList.add("text-red-600");
        }
      });
    }
  
    // Update availability every 30 seconds
    setInterval(updateAvailability, 30000);
  });
  