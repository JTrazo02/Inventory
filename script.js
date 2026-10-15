// Toggle Password Visibility
const togglePassword = document.getElementById("togglePassword");
const invCodeInput = document.getElementById("invCode");

togglePassword.addEventListener("click", function () {
  const type =
    invCodeInput.getAttribute("type") === "password" ? "text" : "password";
  invCodeInput.setAttribute("type", type);

  // Switch icon feedback
  this.textContent = type === "password" ? "👁️" : "👁️‍🗨️";
});

// Login Verification Submission
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const codeInput = invCodeInput.value.trim();
  const errorDisplay = document.getElementById("errorMessage");

  // Master verification access code
  const MASTER_CODE = "03241954";

  if (codeInput === MASTER_CODE) {
    errorDisplay.textContent = "";
    localStorage.setItem("plaspack_authenticated", "true");
    window.location.href = "dashboard.html";
  } else {
    errorDisplay.textContent = "Invalid code. Please try again.";
  }
});
