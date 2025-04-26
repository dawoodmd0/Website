// Confirmation page handling
document.addEventListener("DOMContentLoaded", () => {
    // Load booking details from session storage
    const loadBookingDetails = () => {
      const bookingId = sessionStorage.getItem("booking_id");
      const location = sessionStorage.getItem("selected_location");
      const slotType = sessionStorage.getItem("selected_slot_type");
  
      if (bookingId && location && slotType) {
        const locationData = JSON.parse(location);
        const slotData = JSON.parse(slotType);
  
        document.getElementById("bookingId").textContent = bookingId;
        document.getElementById("location").textContent = locationData.address;
        document.getElementById("slotType").textContent = slotData.type;
        document.getElementById("duration").textContent = "2 hours";
        document.getElementById("amountPaid").textContent =
          `$${slotData.rate * 2}.00`;
      }
    };
  
    loadBookingDetails();
  
    // Clear session storage after loading details
    setTimeout(() => {
      sessionStorage.removeItem("booking_id");
      sessionStorage.removeItem("selected_location");
      sessionStorage.removeItem("selected_slot_type");
    }, 1000);
  });
  