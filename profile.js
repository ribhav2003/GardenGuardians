// profile.js
document.addEventListener("DOMContentLoaded", function () {
    const usernameElement = document.getElementById("username");
    const emailElement = document.getElementById("email");
    const plantListElement = document.getElementById("plantList");

    // Retrieve user data from local storage
    const userd = JSON.parse(localStorage.getItem("usersd"));
    const emailsd = JSON.parse(localStorage.getItem("emaild"));

    // Display username and email ID
    usernameElement.textContent = userd;
    emailElement.textContent = emailsd;

    // Fetch and display the list of plants in the nursery
    fetchPlantsInNursery();
});

async function fetchPlantsInNursery() {
    try {
        // Fetch plants from the server (replace with your actual endpoint)
        const response = await fetch("http://localhost:5503/plantsInNursery");
        const data = await response.json();

        // Display the list of plants
        if (data.plants.length > 0) {
            const plantItems = data.plants.map((plant) => `<li>${plant.common_name}</li>`);
            plantListElement.innerHTML = plantItems.join("");
        } else {
            plantListElement.innerHTML = "No plants in the nursery";
        }
    } catch (error) {
        console.error("Error fetching plants:", error);
    }
}
