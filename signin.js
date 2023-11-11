document.addEventListener("DOMContentLoaded", function () {
  const formFields = document.querySelectorAll(".user-box input");
  const usernameField = formFields[0];
  const passwordField = formFields[1];

  const signInButton = document.querySelector(".login-box a");

  signInButton.addEventListener("click", function (event) {
    event.preventDefault();

    const username = usernameField.value;
    const password = passwordField.value;

    signInUser({
      email: username,
      password: password,
    });
  });

  function signInUser(data) {
    fetch("http://localhost:5501/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        if (!response.ok) {
          // Handle specific error status codes
          if (response.status === 401) {
            const errorData = await response.json();
            console.error("Login error:", errorData.error);
            alert("Login error: " + errorData.error);
          } else {
            console.error("Login error:", response.statusText);
            alert("Login error: Something went wrong");
          }
          throw new Error("Login failed");
        }
        return response.json();
      })
      .then((data) => {
        // Handle successful login
        console.log(data.message);
        // Update your UI or redirect the user to the dashboard
      })
      .catch((error) => {
        console.error("Error:", error);
        // Additional error handling if needed
      });
  }
});
