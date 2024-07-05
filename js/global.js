import { fetchData } from "./api.js";

// Define ACCESS_POINT or import from a configuration
const ROOT = "https://api.edamam.com/api/recipes/v2";

/**
 * Add Event on multiple elements
 * @param {NodeList} $elements NodeList
 * @param {String} eventType Event Type
 * @param {Function} callback Callback Function
 */
export const addEventOnElements = (elements, eventType, callback) => {
  elements.forEach((element) => element.addEventListener(eventType, callback));
};

/**
 * Query fields for card data
 */
export const cardQueries = [
  ["field", "uri"],
  ["field", "label"],
  ["field", "image"],
  ["field", "totalTime"],
];

/**
 * Skeleton card HTML template
 */
export const $skeletonCard = `
<div class="card skeleton-card">
  <div class="skeleton card-banner"></div>
  <div class="card-body">
    <div class="skeleton card-title"></div>
    <div class="skeleton card-text"></div>
  </div>
</div>
`;

/**
 * Save or remove a recipe from localStorage
 * @param {HTMLElement} element Clicked element
 * @param {String} recipeId Recipe ID
 */
export function saveRecipe(element, recipeId) {
  const isSaved = localStorage.getItem(`FoodMa-recipe-${recipeId}`);
  const button = element.closest(".icon-btn"); // Find the closest parent with class "icon-btn"

  if (!isSaved) {
    // Define the API endpoint for fetching the recipe
    const ACCESS_POINT = `${ROOT}/${recipeId}`;

    // Fetch recipe data
    fetchData(ACCESS_POINT, (data) => {
      localStorage.setItem(
        `FoodMa-recipe-${recipeId}`,
        JSON.stringify(data)
      );
      button.classList.add("saved");
      button.classList.remove("removed");
      showNotification("Added to Recipe Book");
    });
  } else {
    localStorage.removeItem(`FoodMa-recipe-${recipeId}`);
    button.classList.remove("saved");
    button.classList.add("removed");
    showNotification("Removed from Recipe Book");
  }
}

// Snackbar container
const $snackbarContainer = document.createElement("div");
$snackbarContainer.classList.add("snackbar-container");
document.body.appendChild($snackbarContainer);

/**
 * Show notification
 * @param {String} message Message to display
 */
function showNotification(message) {
  const $snackbar = document.createElement("div");
  $snackbar.classList.add("snackbar");
  $snackbar.innerHTML = `
    <p class="body-medium">${message}</p>
  `;
  $snackbarContainer.appendChild($snackbar);

  $snackbar.addEventListener("animationend", () =>
    $snackbarContainer.removeChild($snackbar)
  );
}
