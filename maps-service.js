// Enhanced Google Maps Service
class GoogleMapsService {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.map = null;
      this.markers = new Map();
      this.infoWindows = new Map();
      this.directionsService = null;
      this.directionsRenderer = null;
      this.placesService = null;
      this.geocoder = null;
      this.currentLocationMarker = null;
      this.searchBox = null;
    }
  
    async init(elementId, options = {}) {
      const defaultOptions = {
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      };
  
      this.map = new google.maps.Map(document.getElementById(elementId), {
        ...defaultOptions,
        ...options,
      });
  
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: true,
      });
      this.placesService = new google.maps.places.PlacesService(this.map);
      this.geocoder = new google.maps.Geocoder();
  
      // Initialize search box
      const input = document.getElementById("locationSearch");
      this.searchBox = new google.maps.places.SearchBox(input);
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  
      // Bias SearchBox results towards current map's viewport
      this.map.addListener("bounds_changed", () => {
        this.searchBox.setBounds(this.map.getBounds());
      });
  
      // Listen for search box events
      this.searchBox.addListener("places_changed", () => {
        const places = this.searchBox.getPlaces();
        if (places.length === 0) return;
  
        this.handlePlacesChanged(places);
      });
    }
  
    handlePlacesChanged(places) {
      const bounds = new google.maps.LatLngBounds();
  
      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) return;
  
        // Add marker for the place
        const marker = this.addMarker({
          position: place.geometry.location,
          title: place.name,
          icon: {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25),
          },
        });
  
        // Add info window
        const infoContent = `
                  <div class="p-3">
                      <h3 class="font-bold">${place.name}</h3>
                      <p class="text-gray-600">${place.formatted_address}</p>
                      ${
                        place.rating
                          ? `
                          <div class="mt-2">
                              <span class="text-yellow-500">★</span>
                              ${place.rating} (${place.user_ratings_total} reviews)
                          </div>
                      `
                          : ""
                      }
                  </div>
              `;
        this.addInfoWindow(marker, infoContent);
  
        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
  
      this.map.fitBounds(bounds);
    }
  
    updateCurrentLocation(position) {
      const location = new google.maps.LatLng(position.lat, position.lng);
  
      if (!this.currentLocationMarker) {
        this.currentLocationMarker = new google.maps.Marker({
          map: this.map,
          position: location,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
          title: "Your Location",
        });
  
        // Add accuracy circle
        this.accuracyCircle = new google.maps.Circle({
          map: this.map,
          center: location,
          radius: position.accuracy,
          strokeColor: "#4285F4",
          strokeOpacity: 0.2,
          strokeWeight: 1,
          fillColor: "#4285F4",
          fillOpacity: 0.1,
        });
      } else {
        this.currentLocationMarker.setPosition(location);
        this.accuracyCircle.setCenter(location);
        this.accuracyCircle.setRadius(position.accuracy);
      }
  
      this.map.setCenter(location);
    }
  
    addMarker(options) {
      const marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        ...options,
      });
  
      this.markers.set(marker.getPosition().toString(), marker);
      return marker;
    }
  
    addInfoWindow(marker, content) {
      const infoWindow = new google.maps.InfoWindow({ content });
      this.infoWindows.set(marker, infoWindow);
  
      marker.addListener("click", () => {
        this.infoWindows.forEach((iw) => iw.close());
        infoWindow.open(this.map, marker);
      });
    }
  
    async getRoute(origin, destination) {
      try {
        const response = await this.directionsService.route({
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        });
  
        this.directionsRenderer.setDirections(response);
        return response;
      } catch (error) {
        console.error("Error getting route:", error);
        throw error;
      }
    }
  
    async reverseGeocode(position) {
      try {
        const response = await this.geocoder.geocode({
          location: position,
        });
        return response.results[0];
      } catch (error) {
        console.error("Error reverse geocoding:", error);
        throw error;
      }
    }
  
    clearMarkers() {
      this.markers.forEach((marker) => marker.setMap(null));
      this.markers.clear();
      this.infoWindows.clear();
    }
  
    setMapOnAll(map) {
      this.markers.forEach((marker) => marker.setMap(map));
    }
  
    showMarkers() {
      this.setMapOnAll(this.map);
    }
  
    hideMarkers() {
      this.setMapOnAll(null);
    }
  
    getBounds() {
      return this.map.getBounds();
    }
  
    fitBounds(bounds) {
      this.map.fitBounds(bounds);
    }
  
    panTo(position) {
      this.map.panTo(position);
    }
  }
  
  // Export the service
  window.ParkEasy = window.ParkEasy || {};
  window.ParkEasy.GoogleMapsService = GoogleMapsService;
  