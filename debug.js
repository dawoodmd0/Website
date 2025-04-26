// Debugging Utilities
const Debug = {
    enabled: true,
  
    log: function (message, data = null) {
      if (!this.enabled) return;
      if (data) {
        console.log(`[ParkEasy] ${message}`, data);
      } else {
        console.log(`[ParkEasy] ${message}`);
      }
    },
  
    error: function (message, error = null) {
      if (!this.enabled) return;
      if (error) {
        console.error(`[ParkEasy Error] ${message}`, error);
      } else {
        console.error(`[ParkEasy Error] ${message}`);
      }
    },
  
    warn: function (message) {
      if (!this.enabled) return;
      console.warn(`[ParkEasy Warning] ${message}`);
    },
  
    group: function (name) {
      if (!this.enabled) return;
      console.group(`[ParkEasy] ${name}`);
    },
  
    groupEnd: function () {
      if (!this.enabled) return;
      console.groupEnd();
    },
  
    table: function (data, columns = null) {
      if (!this.enabled) return;
      if (columns) {
        console.table(data, columns);
      } else {
        console.table(data);
      }
    },
  };
  
  // Location Service
  const LocationService = {
    watchId: null,
    currentPosition: null,
    listeners: [],
  
    init: function () {
      Debug.log("Initializing Location Service");
      this.checkPermission();
    },
  
    checkPermission: function () {
      if (!navigator.geolocation) {
        Debug.error("Geolocation is not supported by this browser");
        return false;
      }
      return true;
    },
  
    startTracking: function (options = {}) {
      if (!this.checkPermission()) return;
  
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };
  
      try {
        this.watchId = navigator.geolocation.watchPosition(
          (position) => this.handleSuccess(position),
          (error) => this.handleError(error),
          { ...defaultOptions, ...options },
        );
        Debug.log("Location tracking started", { watchId: this.watchId });
      } catch (error) {
        Debug.error("Error starting location tracking", error);
      }
    },
  
    stopTracking: function () {
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
        Debug.log("Location tracking stopped");
      }
    },
  
    handleSuccess: function (position) {
      this.currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
  
      Debug.log("Location updated", this.currentPosition);
      this.notifyListeners("update", this.currentPosition);
    },
  
    handleError: function (error) {
      const errorMessages = {
        1: "Permission denied",
        2: "Position unavailable",
        3: "Timeout",
      };
  
      Debug.error("Location error", {
        code: error.code,
        message: errorMessages[error.code] || "Unknown error",
      });
  
      this.notifyListeners("error", error);
    },
  
    addListener: function (callback) {
      this.listeners.push(callback);
      Debug.log("Location listener added", {
        totalListeners: this.listeners.length,
      });
    },
  
    removeListener: function (callback) {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
      Debug.log("Location listener removed", {
        totalListeners: this.listeners.length,
      });
    },
  
    notifyListeners: function (type, data) {
      this.listeners.forEach((listener) => {
        try {
          listener(type, data);
        } catch (error) {
          Debug.error("Error in location listener", error);
        }
      });
    },
  };
  
  // Map Service
  const MapService = {
    map: null,
    markers: [],
  
    init: function (elementId, options = {}) {
      Debug.log("Initializing Map Service");
      try {
        const defaultOptions = {
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
        };
  
        this.map = new google.maps.Map(document.getElementById(elementId), {
          ...defaultOptions,
          ...options,
        });
  
        Debug.log("Map initialized");
        return true;
      } catch (error) {
        Debug.error("Error initializing map", error);
        return false;
      }
    },
  
    addMarker: function (position, options = {}) {
      try {
        const marker = new google.maps.Marker({
          position,
          map: this.map,
          ...options,
        });
        this.markers.push(marker);
        Debug.log("Marker added", { position, options });
        return marker;
      } catch (error) {
        Debug.error("Error adding marker", error);
        return null;
      }
    },
  
    clearMarkers: function () {
      this.markers.forEach((marker) => marker.setMap(null));
      this.markers = [];
      Debug.log("All markers cleared");
    },
  
    setCenter: function (position) {
      try {
        this.map.setCenter(position);
        Debug.log("Map center updated", position);
      } catch (error) {
        Debug.error("Error setting map center", error);
      }
    },
  };
  
  // Storage Service
  const StorageService = {
    set: function (key, value) {
      try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        Debug.log("Data stored", { key, value });
        return true;
      } catch (error) {
        Debug.error("Error storing data", error);
        return false;
      }
    },
  
    get: function (key) {
      try {
        const serialized = localStorage.getItem(key);
        if (serialized === null) return null;
        return JSON.parse(serialized);
      } catch (error) {
        Debug.error("Error retrieving data", error);
        return null;
      }
    },
  
    remove: function (key) {
      try {
        localStorage.removeItem(key);
        Debug.log("Data removed", { key });
        return true;
      } catch (error) {
        Debug.error("Error removing data", error);
        return false;
      }
    },
  
    clear: function () {
      try {
        localStorage.clear();
        Debug.log("Storage cleared");
        return true;
      } catch (error) {
        Debug.error("Error clearing storage", error);
        return false;
      }
    },
  };
  
  // Export services
  window.ParkEasy = {
    Debug,
    LocationService,
    MapService,
    StorageService,
  };
  