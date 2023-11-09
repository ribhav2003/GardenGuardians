document.addEventListener("DOMContentLoaded", function () {
  const passwordField = document.getElementById("fpass");
  const confirmPasswordField = document.getElementById("confirmPassword");
  const formFields = document.querySelectorAll(".c-form__input");

  formFields.forEach((field, index) => {
    field.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        const nextButton = field
          .closest(".c-form__group")
          .querySelector(".c-form__nextIcon");

        if (nextButton) {
          if (nextButton.classList.contains("disabled")) {
            if (field === confirmPasswordField) {
              if (confirmPasswordField.value !== passwordField.value) {
                field
                  .closest(".c-form__group")
                  .querySelector(".c-form__groupLabel")
                  .classList.add("c-form__group-label--error");
              } else {
                field
                  .closest(".c-form__group")
                  .querySelector(".c-form__groupLabel")
                  .classList.remove("c-form__group-label--error");
                nextButton.classList.remove("disabled");
              }
            } else {
              // Handle validation errors or display messages here for other fields
            }
          } else {
            nextButton.click();
          }
        }
      }
    });
  });
});
