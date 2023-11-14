document.addEventListener("DOMContentLoaded", async function () {
  const commonNameElement = document.getElementById("commonName");
  const scientificNameElement = document.getElementById("scientificName");
  const cycleElement = document.getElementById("cycle");
  const wateringElement = document.getElementById("watering");
  const sunlightElement = document.getElementById("sunlight");
  const plantImageElement = document.getElementById("plantImage");

  // Extract plant ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const plantId = urlParams.get("id");

  if (!plantId) {
    console.error("Plant ID not provided");
    return;
  }

  try {
    // Fetch plant details from the server
    const response = await fetch(
      `http://localhost:5503/getPlantDetails?plantId=${plantId}`
    );
    const data = await response.json();

    if (data.plant) {
      const plant = data.plant;

      // Update HTML elements with plant details
      commonNameElement.textContent = `Common Name: ${plant.common_name}`;
      scientificNameElement.textContent = `Scientific Name: ${plant.scientific_name}`;
      cycleElement.textContent = `Cycle: ${plant.cycle}`;
      wateringElement.textContent = `Watering: ${plant.watering}`;
      sunlightElement.textContent = `Sunlight: ${JSON.stringify(
        plant.sunlight
      )}`;

      // Set the image source
      plantImageElement.src = plant.image_url;
    } else {
      console.error("Plant not found");
    }
  } catch (error) {
    console.error("Error fetching plant details:", error);
  }
});
