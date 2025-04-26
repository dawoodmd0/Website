// Authentication logic
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notification-message");
  
    loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const remember = document.getElementById("remember").checked;
  
      try {
        // Simulate API call
        await authenticateUser(email, password);
  
        // Store auth token
        if (remember) {
          localStorage.setItem("auth_token", "dummy_token");
        } else {
          sessionStorage.setItem("auth_token", "dummy_token");
        }
  
        // Redirect to GPS page
        window.location.href = "gps.html";
      } catch (error) {
        showNotification("Invalid email or password", "error");
      }
    });
  
    function showNotification(message, type) {
      notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg ${
        type === "error"
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`;
      notificationMessage.textContent = message;
      notification.classList.remove("hidden");
  
      setTimeout(() => {
        notification.classList.add("hidden");
      }, 3000);
    }
  
    // Simulate authentication API call
    async function authenticateUser(email, password) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === "test@example.com" && password === "password") {
            resolve({ token: "dummy_token" });
          } else {
            reject(new Error("Invalid credentials"));
          }
        }, 1000);
      });
    }
  });
  