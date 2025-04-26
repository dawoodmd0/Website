// Location Service with improved accuracy and fallbacks
const LocationService = {
    // Configuration
    config: {
      highAccuracy: {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
      lowAccuracy: {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 30000,
      },
      maxRetries: 3,
      minAccuracy: 100, // meters
    },
  
    // State
    state: {
      watching: false,
      watchId: null,
      lastPosition: null,
      retryCount: 0,
      listeners: new Set(),
      permissionStatus: null,
    },
  
    // Initialize the service
    async init() {
      console.log("Initializing Location Service");
      await this.checkPermission();
      return this;
    },
  
    // Check location permission
    async checkPermission() {
      try {
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported");
        }
  
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({
            name: "geolocation",
          });
          this.state.permissionStatus = permission.state;
  
          permission.addEventListener("change", () => {
            this.state.permissionStatus = permission.state;
            this.notifyListeners("permissionChange", permission.state);
          });
        }
  
        return this.state.permissionStatus;
      } catch (error) {
        console.error("Permission check failed:", error);
        throw error;
      }
    },
  
    // Start tracking location
    async startTracking() {
      if (this.state.watching) {
        return;
      }
  
      try {
        // Try high accuracy first
        const position = await this.getCurrentPosition(
          this.config.highAccuracy,
        ).catch(() => this.getCurrentPosition(this.config.lowAccuracy));
  
        if (position) {
          this.handleSuccess(position);
          this.startWatching();
        }
      } catch (error) {
        this.handleError(error);
      }
    },
  
    // Stop tracking location
    stopTracking() {
      if (this.state.watchId) {
        navigator.geolocation.clearWatch(this.state.watchId);
        this.state.watching = false;
        this.state.watchId = null;
        this.notifyListeners("stopped");
      }
    },
  
    // Get current position as Promise
    getCurrentPosition(options) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    },
  
    // Start watching position
    startWatching() {
      const options = this.config.highAccuracy;
  
      this.state.watchId = navigator.geolocation.watchPosition(
        (position) => this.handleSuccess(position),
        (error) => this.handleError(error),
        options,
      );
  
      this.state.watching = true;
      this.notifyListeners("watching", true);
    },
  
    // Handle successful location update
    handleSuccess(position) {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        heading: position.coords.heading,
        speed: position.coords.speed,
      };
  
      // Validate accuracy
      if (location.accuracy > this.config.minAccuracy) {
        console.warn("Low accuracy location:", location.accuracy);
        this.notifyListeners("lowAccuracy", location);
  
        // Retry with different settings if accuracy is too low
        if (this.state.retryCount < this.config.maxRetries) {
          this.state.retryCount++;
          this.stopTracking();
          this.startTracking();
          return;
        }
      }
  
      this.state.lastPosition = location;
      this.state.retryCount = 0;
      this.notifyListeners("update", location);
    },
  
    // Handle location errors
    handleError(error) {
      const errorTypes = {
        1: "PERMISSION_DENIED",
        2: "POSITION_UNAVAILABLE",
        3: "TIMEOUT",
      };
  
      const errorInfo = {
        code: error.code,
        type: errorTypes[error.code] || "UNKNOWN_ERROR",
        message: error.message,
        timestamp: new Date().toISOString(),
      };
  
      console.error("Location error:", errorInfo);
      this.notifyListeners("error", errorInfo);
  
      // Handle specific error cases
      switch (error.code) {
        case 1: // Permission denied
          this.stopTracking();
          break;
        case 2: // Position unavailable
          if (this.state.retryCount < this.config.maxRetries) {
            this.state.retryCount++;
            setTimeout(() => this.startTracking(), 1000);
          }
          break;
        case 3: // Timeout
          if (this.state.retryCount < this.config.maxRetries) {
            this.state.retryCount++;
            this.startTracking();
          }
          break;
      }
    },
  
    // Add event listener
    addListener(callback) {
      this.state.listeners.add(callback);
  
      // Immediately send last position if available
      if (this.state.lastPosition) {
        callback("update", this.state.lastPosition);
      }
    },
  
    // Remove event listener
    removeListener(callback) {
      this.state.listeners.delete(callback);
    },
  
    // Notify all listeners
    notifyListeners(type, data) {
      this.state.listeners.forEach((listener) => {
        try {
          listener(type, data);
        } catch (error) {
          console.error("Error in location listener:", error);
        }
      });
    },
  
    // Get last known position
    getLastPosition() {
      return this.state.lastPosition;
    },
  
    // Check if location is stale
    isLocationStale(maxAge = 30000) {
      if (!this.state.lastPosition) return true;
      const age = Date.now() - this.state.lastPosition.timestamp;
      return age > maxAge;
    },
  
    // Get location age in seconds
    getLocationAge() {
      if (!this.state.lastPosition) return null;
      return (Date.now() - this.state.lastPosition.timestamp) / 1000;
    },
  };
  
  // Export the service
  window.ParkEasy = window.ParkEasy || {};
  window.ParkEasy.LocationService = LocationService;
  