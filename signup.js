document.addEventListener("DOMContentLoaded", function () {
  const formFields = document.querySelectorAll(".c-form__input");
  const passwordField = document.getElementById("fpass");
  const confirmPasswordField = document.getElementById("confirmPassword");

  let registrationStep = 0; // Track the current registration step

  formFields.forEach((field, index) => {
    const nextButtons = document.querySelectorAll(".c-form__next");
    const border = document.querySelectorAll(".c-form__border");

    confirmPasswordField.addEventListener("input", function () {
      if (passwordField.value !== confirmPasswordField.value) {
        nextButtons[3].classList.add("disabled");
        nextButtons[3].style.color = "#ff0033";
        border[3].style.color = "#ff0033";
        confirmPasswordField.setCustomValidity("Passwords do not match");
      } else {
        nextButtons[3].classList.remove("disabled");
        nextButtons[3].style.color = "#00ed64";
        border[3].style.color = "#00ed64";
        confirmPasswordField.setCustomValidity("");
      }
    });

    nextButtons[3].addEventListener("click", function () {
      if (passwordField.value !== confirmPasswordField.value) {
        // Handle passwords not matching
        const groupLabel = confirmPasswordField
          .closest(".c-form__group")
          .querySelector(".c-form__groupLabel");
        groupLabel.innerHTML = "Password not the same";
        groupLabel.classList.add("c-form__group-label--error");
      } else {
        const groupLabel = confirmPasswordField
          .closest(".c-form__group")
          .querySelector(".c-form__groupLabel");
        groupLabel.innerHTML = "Confirm your password.";
        groupLabel.classList.remove("c-form__group-label--error");

        // Increment the registration step
        registrationStep++;

        if (registrationStep === 4) {
          // Register the user only if they have completed the entire form
          registerUser({
            username: document.getElementById("username").value,
            email: document.getElementById("femail").value,
            password: document.getElementById("fpass").value,
          });
        }
      }
    });

    // ... (rest of your existing code remains unchanged)

    field.addEventListener("keyup", function (event) {
      const nextButton = field
        .closest(".c-form__group")
        .querySelector(".c-form__nextIcon");
      if (event.key === "Enter") {
        event.preventDefault();
        if (nextButton) {
          if (
            nextButton.classList.contains("disabled") ||
            (field.id === "femail" && !isValidEmail(field.value))
          ) {
            // Handle validation errors or display messages here
            console.log("Email is not valid.");
          } else if (
            nextButton.classList.contains("disabled") ||
            (field.id === "confirmPassword" && !arePasswordsEqual())
          ) {
            // Handle validation errors or display messages here
            console.log("Passwords are not equal.");
          } else {
            nextButton.click();
          }
        }
      }
    });
  });

  function isValidEmail(email) {
    // Use a regular expression to validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  function arePasswordsEqual() {
    const passwordField = document.getElementById("fpass");
    const confirmPasswordField = document.getElementById("confirmPassword");
    return passwordField.value === confirmPasswordField.value;
  }

  function registerUser(data) {
    fetch("http://localhost:5501/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          // Check for specific error status codes
          if (response.status === 400) {
            return response.json().then((data) => {
              // Handle username/email already exists error
              console.error("Registration error:", data.error);
              // Update your UI to show an error message
              // For example, you can display the error message in an alert
              alert("Registration error: " + data.error);
            });
          } else {
            // Handle other error cases
            console.error("Registration error:", response.statusText);
            // Update your UI to show a generic error message
            // For example, you can display a generic error message in an alert
            alert("Registration error: " + response.statusText);
          }
        }
        return response.json();
      })
      .then((data) => {
        // Handle successful registration
        console.log(data.message);
        // Update your UI or redirect the user to the login page
      })
      .catch((error) => {
        // Handle network or other unexpected errors
        console.error("Error:", error);
        // Update your UI to show an error message
        // For example, you can display a generic error message in an alert
        alert("Registration error: Something went wrong");
      });
  }
});
