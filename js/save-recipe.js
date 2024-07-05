import { getTime } from "./module.js";

const edamamApiKey = "da1c86026ceed6de2f2af11c804ca565"; // Replace with your Edamam API key
const edamamAppId = "ee6ab7da"; // Replace with your Edamam App ID

// Get saved recipes from localStorage
let savedRecipes = Object.keys(localStorage).filter((item) => {
  return item.startsWith("recipe_"); // Corrected to match the format "recipe_<id>"
});

const $savedRecipeContainer = document.querySelector(
  "[data-saved-recipe-container]"
);

$savedRecipeContainer.innerHTML = `
  <h2 class="headline-small section-title">All Saved Recipes</h2>
`;

const $gridList = document.createElement("div");
$gridList.classList.add("grid-list");

if (savedRecipes.length) {
  savedRecipes.forEach(async (savedRecipeKey, index) => {
    try {
      const recipeId = savedRecipeKey.replace("recipe_", ""); // Extract recipeId from localStorage key

      // Fetch recipe details from Edamam API
      const response = await fetch(
        `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_id=${edamamAppId}&app_key=${edamamApiKey}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch recipe details for recipeId: ${recipeId}`
        );
      }

      const data = await response.json();

      if (data && data.recipe) {
        const {
          image,
          label: title,
          totalTime: cookingTime,
          uri,
        } = data.recipe;

        const formattedTime = getTime(cookingTime); // Format cooking time

        const $card = document.createElement("div");
        $card.classList.add("card");
        $card.style.animationDelay = `${100 * index}ms`;

        $card.innerHTML = `
          <figure class="card-medium img-holder">
            <img
              src="${image}"
              loading="eager"
              alt="${title}"
              width="195"
              height="195"
              class="img-cover"
            />
          </figure>
          <div class="card-body">
            <h3 class="title-small">
              <a href="detail.html?recipe=${recipeId}" class="card-link">${
          title ?? "Untitled"
        }</a>
            </h3>
            <div class="meta-wrapper">
              <div class="meta-time">
                <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
                <span class="label-medium">${formattedTime}</span>
              </div>
              <button class="icon-btn has-state saved" data-recipe-id="${recipeId}" aria-label="Remove from saved recipes">
                <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
              </button>
            </div>
          </div>
        `;

        $gridList.appendChild($card);
      } else {
        console.error(
          `Failed to fetch or parse recipe details for recipeId: ${recipeId}`
        );
      }
    } catch (error) {
      console.error(
        `Error processing saved recipe ${savedRecipeKey}: ${error}`
      );
    }
  });
} else {
  $savedRecipeContainer.innerHTML += `<p class="body-large">You haven't saved any recipes yet!</p>`;
}



$savedRecipeContainer.appendChild($gridList);
