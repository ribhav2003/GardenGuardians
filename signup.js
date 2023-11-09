document.addEventListener("DOMContentLoaded", function () {
  const formFields = document.querySelectorAll(".c-form__input");
  const passwordField = document.getElementById("fpass");
  const confirmPasswordField = document.getElementById("confirmPassword");

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
      }
    });
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
});
