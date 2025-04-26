// Performance Tracking System
const PerformanceTracker = {
    metrics: {
      pageLoads: {},
      errors: [],
      interactions: [],
      apiCalls: {},
      resources: [],
    },
  
    config: {
      sampleRate: 1.0, // 100% tracking
      maxStorageSize: 1000, // Maximum number of entries to store
      flushInterval: 60000, // Flush to storage every minute
      errorThreshold: 5, // Number of errors before alerting
    },
  
    init() {
      this.startPageLoadTracking();
      this.startErrorTracking();
      this.startInteractionTracking();
      this.startResourceTracking();
      this.startPeriodicFlush();
  
      // Report initial page load
      window.addEventListener("load", () => {
        this.recordPageLoad(window.location.pathname);
      });
    },
  
    // Page Load Tracking
    startPageLoadTracking() {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        const domReadyTime =
          timing.domContentLoadedEventEnd - timing.navigationStart;
  
        this.metrics.pageLoads[window.location.pathname] = {
          timestamp: new Date().toISOString(),
          totalLoadTime: pageLoadTime,
          domReadyTime: domReadyTime,
          userAgent: navigator.userAgent,
        };
      }
  
      // Track client-side navigation
      window.addEventListener("popstate", () => {
        this.recordPageLoad(window.location.pathname);
      });
    },
  
    recordPageLoad(page) {
      const startTime = performance.now();
      const entry = {
        page,
        timestamp: new Date().toISOString(),
        loadTime: performance.now() - startTime,
      };
  
      this.metrics.pageLoads[page] = entry;
      this.saveMetrics();
    },
  
    // Error Tracking
    startErrorTracking() {
      window.onerror = (msg, url, lineNo, columnNo, error) => {
        this.recordError("javascript", {
          message: msg,
          url,
          lineNo,
          columnNo,
          stack: error?.stack,
        });
      };
  
      window.addEventListener("unhandledrejection", (event) => {
        this.recordError("promise", {
          message: event.reason,
          stack: event.reason?.stack,
        });
      });
    },
  
    recordError(type, error) {
      const entry = {
        type,
        timestamp: new Date().toISOString(),
        error,
        url: window.location.href,
        userAgent: navigator.userAgent,
      };
  
      this.metrics.errors.push(entry);
  
      // Check error threshold
      const recentErrors = this.metrics.errors.filter(
        (e) => new Date() - new Date(e.timestamp) < 300000, // Last 5 minutes
      );
  
      if (recentErrors.length >= this.config.errorThreshold) {
        this.alertHighErrorRate(recentErrors);
      }
  
      this.saveMetrics();
    },
  
    // User Interaction Tracking
    startInteractionTracking() {
      const trackInteraction = (type, event) => {
        const element = event.target;
        const interaction = {
          type,
          timestamp: new Date().toISOString(),
          element: {
            tag: element.tagName,
            id: element.id,
            class: element.className,
            text: element.textContent?.slice(0, 50),
          },
          page: window.location.pathname,
        };
  
        this.metrics.interactions.push(interaction);
        this.saveMetrics();
      };
  
      // Track clicks
      document.addEventListener("click", (e) => trackInteraction("click", e));
  
      // Track form submissions
      document.addEventListener("submit", (e) =>
        trackInteraction("form_submit", e),
      );
  
      // Track input changes
      document.addEventListener("change", (e) =>
        trackInteraction("input_change", e),
      );
    },
  
    // Resource Tracking
    startResourceTracking() {
      if (window.performance && window.performance.getEntriesByType) {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === "resource") {
              this.recordResourceTiming(entry);
            }
          });
        });
  
        observer.observe({ entryTypes: ["resource"] });
      }
    },
  
    recordResourceTiming(entry) {
      const resource = {
        name: entry.name,
        type: entry.initiatorType,
        startTime: entry.startTime,
        duration: entry.duration,
        transferSize: entry.transferSize,
        timestamp: new Date().toISOString(),
      };
  
      this.metrics.resources.push(resource);
      this.saveMetrics();
    },
  
    // API Call Tracking
    recordApiCall(endpoint, duration, status) {
      if (!this.metrics.apiCalls[endpoint]) {
        this.metrics.apiCalls[endpoint] = [];
      }
  
      this.metrics.apiCalls[endpoint].push({
        timestamp: new Date().toISOString(),
        duration,
        status,
      });
  
      this.saveMetrics();
    },
  
    // Storage Management
    saveMetrics() {
      try {
        const metrics = JSON.stringify(this.metrics);
        localStorage.setItem("performance_metrics", metrics);
      } catch (error) {
        console.error("Error saving metrics:", error);
        this.cleanupOldMetrics();
      }
    },
  
    loadMetrics() {
      try {
        const metrics = localStorage.getItem("performance_metrics");
        if (metrics) {
          this.metrics = JSON.parse(metrics);
        }
      } catch (error) {
        console.error("Error loading metrics:", error);
      }
    },
  
    cleanupOldMetrics() {
      // Keep only recent errors
      this.metrics.errors = this.metrics.errors.slice(
        -this.config.maxStorageSize,
      );
  
      // Keep only recent interactions
      this.metrics.interactions = this.metrics.interactions.slice(
        -this.config.maxStorageSize,
      );
  
      // Keep only recent resources
      this.metrics.resources = this.metrics.resources.slice(
        -this.config.maxStorageSize,
      );
  
      // Clean up API calls
      Object.keys(this.metrics.apiCalls).forEach((endpoint) => {
        this.metrics.apiCalls[endpoint] = this.metrics.apiCalls[endpoint].slice(
          -this.config.maxStorageSize,
        );
      });
  
      this.saveMetrics();
    },
  
    startPeriodicFlush() {
      setInterval(() => {
        this.cleanupOldMetrics();
        // Here you could also send metrics to a server
      }, this.config.flushInterval);
    },
  
    // Alert Handling
    alertHighErrorRate(errors) {
      console.error(
        `High error rate detected: ${errors.length} errors in the last 5 minutes`,
      );
      // Here you could implement actual alerting (e.g., send to a monitoring service)
    },
  
    // Reporting
    generateReport() {
      return {
        summary: {
          totalErrors: this.metrics.errors.length,
          totalInteractions: this.metrics.interactions.length,
          averagePageLoad: this.calculateAveragePageLoad(),
          errorRate: this.calculateErrorRate(),
          mostCommonErrors: this.getMostCommonErrors(),
          mostUsedFeatures: this.getMostUsedFeatures(),
        },
        details: this.metrics,
      };
    },
  
    calculateAveragePageLoad() {
      const loads = Object.values(this.metrics.pageLoads);
      if (loads.length === 0) return 0;
      return loads.reduce((sum, load) => sum + load.loadTime, 0) / loads.length;
    },
  
    calculateErrorRate() {
      const totalPageLoads = Object.keys(this.metrics.pageLoads).length;
      if (totalPageLoads === 0) return 0;
      return this.metrics.errors.length / totalPageLoads;
    },
  
    getMostCommonErrors() {
      const errorCounts = {};
      this.metrics.errors.forEach((error) => {
        const key = error.error.message;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });
      return Object.entries(errorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    },
  
    getMostUsedFeatures() {
      const featureCounts = {};
      this.metrics.interactions.forEach((interaction) => {
        const key = `${interaction.type}_${interaction.element.tag}`;
        featureCounts[key] = (featureCounts[key] || 0) + 1;
      });
      return Object.entries(featureCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);
    },
  };
  
  // Export the tracker
  window.ParkEasy = window.ParkEasy || {};
  window.ParkEasy.PerformanceTracker = PerformanceTracker;
  