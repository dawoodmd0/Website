// Payment processing logic
document.addEventListener("DOMContentLoaded", () => {
    const paymentForm = document.getElementById("paymentForm");
    const processingOverlay = document.getElementById("processingOverlay");
  
    // Load booking details from session storage
    const loadBookingDetails = () => {
      const location = sessionStorage.getItem("selected_location");
      const slotType = sessionStorage.getItem("selected_slot_type");
  
      if (location && slotType) {
        const locationData = JSON.parse(location);
        const slotData = JSON.parse(slotType);
  
        document.getElementById("summaryLocation").textContent =
          locationData.address;
        document.getElementById("summarySlotType").textContent = slotData.type;
        document.getElementById("summaryDuration").textContent = "2 hours"; // Default duration
        document.getElementById("summaryRate").textContent =
          `$${slotData.rate}/hr`;
        document.getElementById("summaryTotal").textContent =
          `$${slotData.rate * 2}.00`;
      }
    };
  
    loadBookingDetails();
  
    // Handle payment submission
    paymentForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      processingOverlay.classList.remove("hidden");
  
      try {
        // Simulate payment processing
        await processPayment();
  
        // Generate booking ID
        const bookingId =
          "PK" + Math.random().toString(36).substr(2, 5).toUpperCase();
        sessionStorage.setItem("booking_id", bookingId);
  
        // Send confirmation email
        await sendConfirmationEmail();
  
        // Redirect to confirmation page
        window.location.href = "confirmation.html";
      } catch (error) {
        alert("Payment failed. Please try again.");
      } finally {
        processingOverlay.classList.add("hidden");
      }
    });
  
    // Simulate payment processing
    async function processPayment() {
      return new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
    }
  
    // Simulate sending confirmation email
    async function sendConfirmationEmail() {
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }
  
    // Handle logout
    document.getElementById("logout")?.addEventListener("click", () => {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      window.location.href = "login.html";
    });
  });
  