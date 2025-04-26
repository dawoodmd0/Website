document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const tabBtns = document.querySelectorAll(".tab-btn");
    const forms = document.querySelectorAll(".form-section");
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const notification = document.getElementById("notification");
  
    // Form Toggle Functionality
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const formType = btn.dataset.form;
  
        // Update active states
        tabBtns.forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        forms.forEach((f) => f.classList.remove("active"));
  
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
  
        // Show selected form
        const selectedForm = document.getElementById(`${formType}Form`);
        selectedForm.classList.add("active");
  
        // Clear form and errors
        selectedForm.reset();
        clearAllErrors(selectedForm);
      });
    });
  
    // Validation Functions
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: emailRegex.test(email),
        error: "Please enter a valid email address",
      };
    };
  
    const validatePassword = (password) => {
      const requirements = {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      };
  
      const errors = [];
      if (!requirements.minLength) errors.push("At least 8 characters");
      if (!requirements.hasUpperCase) errors.push("One uppercase letter");
      if (!requirements.hasLowerCase) errors.push("One lowercase letter");
      if (!requirements.hasNumbers) errors.push("One number");
      if (!requirements.hasSpecialChar) errors.push("One special character");
  
      return {
        isValid: Object.values(requirements).every(Boolean),
        errors,
        strength: Object.values(requirements).filter(Boolean).length,
      };
    };
  
    // Error Handling Functions
    const showFieldError = (fieldId, error) => {
      const field = document.getElementById(fieldId);
      const errorEl = document.getElementById(`${fieldId}-error`);
  
      field.classList.add("border-red-500");
      errorEl.textContent = error;
      errorEl.classList.remove("hidden");
    };
  
    const clearFieldError = (fieldId) => {
      const field = document.getElementById(fieldId);
      const errorEl = document.getElementById(`${fieldId}-error`);
  
      if (field && errorEl) {
        field.classList.remove("border-red-500");
        errorEl.classList.add("hidden");
        errorEl.textContent = "";
      }
    };
  
    const clearAllErrors = (form) => {
      form.querySelectorAll("input").forEach((input) => {
        clearFieldError(input.id);
      });
    };
  
    // Show notification
    const showNotification = (message, type = "success") => {
      const notificationEl = document.getElementById("notification");
      const messageEl = notificationEl.querySelector("p");
  
      messageEl.textContent = message;
      notificationEl.classList.remove("hidden");
      notificationEl.className = `fixed top-4 right-4 max-w-sm p-4 rounded-lg shadow-lg z-50 ${
        type === "success"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`;
  
      setTimeout(() => {
        notificationEl.classList.add("hidden");
      }, 5000);
    };
  
    // Password strength indicator
    const updatePasswordStrength = (password) => {
      const strengthEl = document.getElementById("password-strength");
      const validation = validatePassword(password);
  
      const strengthClasses = [
        "bg-red-200 w-1/4",
        "bg-orange-200 w-2/4",
        "bg-yellow-200 w-3/4",
        "bg-green-200 w-full",
      ];
  
      const strengthText = ["Weak", "Fair", "Good", "Strong"];
      const strengthIndex = Math.min(Math.floor(validation.strength / 2), 3);
  
      strengthEl.innerHTML = `
              <div class="h-2 rounded-full bg-gray-200">
                  <div class="h-full rounded-full transition-all duration-300 ${strengthClasses[strengthIndex]}"></div>
              </div>
              <p class="text-sm mt-1 text-gray-600">
                  ${strengthText[strengthIndex]} ${validation.errors.length ? `(${validation.errors.join(", ")})` : ""}
              </p>
          `;
    };
  
    // Input Event Listeners
    document.getElementById("signup-password").addEventListener("input", (e) => {
      updatePasswordStrength(e.target.value);
    });
  
    // Form Submission Handlers
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const buttonText = submitBtn.querySelector(".button-text");
      const buttonLoader = submitBtn.querySelector(".button-loader");
  
      // Clear previous errors
      clearAllErrors(loginForm);
  
      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        showFieldError("login-email", emailValidation.error);
        return;
      }
  
      try {
        submitBtn.disabled = true;
        buttonText.classList.add("hidden");
        buttonLoader.classList.remove("hidden");
  
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
  
        // Store session data
        sessionStorage.setItem("auth_token", "sample_token");
        localStorage.setItem("user_email", email);
  
        showNotification("Login successful! Redirecting...", "success");
  
        setTimeout(() => {
          window.location.href = "gps.html";
        }, 1500);
      } catch (error) {
        showNotification("Invalid credentials. Please try again.", "error");
      } finally {
        submitBtn.disabled = false;
        buttonText.classList.remove("hidden");
        buttonLoader.classList.add("hidden");
      }
    });
  
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = document.getElementById("signup-name").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      const confirmPassword = document.getElementById(
        "signup-confirm-password",
      ).value;
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const buttonText = submitBtn.querySelector(".button-text");
      const buttonLoader = submitBtn.querySelector(".button-loader");
  
      // Clear previous errors
      clearAllErrors(signupForm);
  
      // Validate name
      if (name.length < 2) {
        showFieldError("signup-name", "Name must be at least 2 characters long");
        return;
      }
  
      // Validate email
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        showFieldError("signup-email", emailValidation.error);
        return;
      }
  
      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        showFieldError("signup-password", passwordValidation.errors[0]);
        return;
      }
  
      // Validate password confirmation
      if (password !== confirmPassword) {
        showFieldError("signup-confirm-password", "Passwords do not match");
        return;
      }
  
      try {
        submitBtn.disabled = true;
        buttonText.classList.add("hidden");
        buttonLoader.classList.remove("hidden");
  
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
  
        showNotification(
          "Account created successfully! Please check your email for verification.",
          "success",
        );
  
        // Store email for login form
        localStorage.setItem("pendingVerification", email);
  
        // Switch to login form after delay
        setTimeout(() => {
          tabBtns[0].click();
          document.getElementById("login-email").value = email;
        }, 2000);
      } catch (error) {
        showNotification("Registration failed. Please try again.", "error");
      } finally {
        submitBtn.disabled = false;
        buttonText.classList.remove("hidden");
        buttonLoader.classList.add("hidden");
      }
    });
  
    // Initialize forms
    document.querySelectorAll("form").forEach((form) => {
      form.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
          clearFieldError(input.id);
        });
      });
    });
  });
  