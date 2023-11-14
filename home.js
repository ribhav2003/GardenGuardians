document.addEventListener("DOMContentLoaded", function () {
  const welcomeMessageElement = document.getElementById("username");
  const userd = JSON.parse(localStorage.getItem("usersd"));
  const emailsd = JSON.parse(localStorage.getItem("emaild"));
  console.log(userd);
  console.log(emailsd);
  welcomeMessageElement.textContent = userd;

  const searchBarContainerEl = document.querySelector(".search-bar-container");

  const magnifierEl = document.querySelector(".magnifier");

  magnifierEl.addEventListener("click", () => {
    searchBarContainerEl.classList.toggle("active");
  });

  // Assume this code is running in another client-side script, like within a browser

  // fetch('http://localhost:5502/getUserDataFromOtherClient', {
  //   method: 'GET',
  //   credentials: 'same-origin', // include cookies when making the request, assumes the server is on the same origin
  // })
  //   .then(async(response) => {
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  //     return response.json();
  //   })
  //   .then(data => {
  //     // Handle the data received from the server
  //     console.log('User data from another client-side script:', data);
  //   })
  //   .catch(error => {
  //     // Handle errors during the fetch
  //     console.error('Fetch error:', error);
  //   });
});
