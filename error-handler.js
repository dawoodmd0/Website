// Error Handler Utility
const ErrorHandler = {
    // Error types
    ERROR_TYPES: {
      LOCATION: "LOCATION_ERROR",
      MAP: "MAP_ERROR",
      NETWORK: "NETWORK_ERROR",
      PERMISSION: "PERMISSION_ERROR",
      GENERAL: "GENERAL_ERROR",
    },
  
    // Debug mode flag
    debugMode: true,
  
    // Initialize error handler
    init() {
      window.onerror = (msg, url, lineNo, columnNo, error) => {
        this.logError("GLOBAL_ERROR", { msg, url, lineNo, columnNo, error });
        return false;
      };
  
      window.addEventListener("unhandledrejection", (event) => {
        this.logError("UNHANDLED_PROMISE", event.reason);
      });
    },
  
    // Log error with details
    logError(type, error) {
      if (this.debugMode) {
        console.error(`[${type}]`, error);
      }
  
      // You can add error reporting service here
      // this.reportError(type, error);
    },
  
    // Show error message to user
    showError(message, type = "error") {
      const errorDiv =
        document.getElementById("errorMessage") || this.createErrorElement();
      errorDiv.textContent = message;
      errorDiv.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === "error"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700"
      }`;
      errorDiv.style.display = "block";
  
      setTimeout(() => {
        errorDiv.style.display = "none";
      }, 5000);
    },
  
    // Create error element if not exists
    createErrorElement() {
      const errorDiv = document.createElement("div");
      errorDiv.id = "errorMessage";
      document.body.appendChild(errorDiv);
      return errorDiv;
    },
  
    // Handle location errors
    handleLocationError(error) {
      let message = "Error getting your location: ";
      switch (error.code) {
        case 1:
          message += "Permission denied. Please enable location services.";
          this.logError(this.ERROR_TYPES.PERMISSION, error);
          break;
        case 2:
          message += "Position unavailable. Please try again.";
          this.logError(this.ERROR_TYPES.LOCATION, error);
          break;
        case 3:
          message += "Request timed out. Please try again.";
          this.logError(this.ERROR_TYPES.LOCATION, error);
          break;
        default:
          message += "Unknown error occurred.";
          this.logError(this.ERROR_TYPES.GENERAL, error);
      }
      this.showError(message);
      return message;
    },
  
    // Handle map errors
    handleMapError(error) {
      const message = "Error loading map: " + error.message;
      this.logError(this.ERROR_TYPES.MAP, error);
      this.showError(message);
      return message;
    },
  
    // Handle network errors
    handleNetworkError(error) {
      const message = "Network error: " + error.message;
      this.logError(this.ERROR_TYPES.NETWORK, error);
      this.showError(message);
      return message;
    },
  };
  
  // Loading Handler Utility
  const LoadingHandler = {
    show(message = "Loading...") {
      const loadingDiv = document.getElementById("loadingOverlay");
      if (loadingDiv) {
        const textElement = loadingDiv.querySelector("#loadingText");
        if (textElement) textElement.textContent = message;
        loadingDiv.style.display = "flex";
      }
    },
  
    hide() {
      const loadingDiv = document.getElementById("loadingOverlay");
      if (loadingDiv) {
        loadingDiv.style.display = "none";
      }
    },
  
    updateMessage(message) {
      const textElement = document.querySelector("#loadingText");
      if (textElement) {
        textElement.textContent = message;
      }
    },
  };
  
  // Export utilities
  window.ParkEasy = window.ParkEasy || {};
  window.ParkEasy.ErrorHandler = ErrorHandler;
  window.ParkEasy.LoadingHandler = LoadingHandler;
  