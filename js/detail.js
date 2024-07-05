import { getTime } from "./module.js";
import { addEventOnElements } from "./global.js";

document.addEventListener("DOMContentLoaded", function () {
  const edamamApiKey = "da1c86026ceed6de2f2af11c804ca565"; // Replace with your Edamam API key
  const spoonacularApiKey = "2dcd0ce1e1104b72aeaa9a8df6097b7a"; // Replace with your Spoonacular API key
  const recipeId = new URLSearchParams(location.search).get("recipe");
  const recipeTitleElement = document.getElementById("recipe-title");
  const recipeImageElement = document
    .getElementById("recipe-image")
    .querySelector("img");
  const recipeIngredientsElement =
    document.getElementById("recipe-ingredients");
  const recipeInstructionsElement = document.getElementById(
    "recipe-instructions"
  );
  const recipeAuthorElement = document.getElementById("recipe-author");
  const ingredientsCountElement = document.getElementById("ingredients-count");
  const cookingTimeElement = document.getElementById("cooking-time");
  const caloriesElement = document.getElementById("calories");
  const dietLabelsElement = document.getElementById("diet-labels");
  const cuisineTypeElement = document.getElementById("cuisine-type");
  const dishTypeElement = document.getElementById("dish-type");
  const saveButton = document.getElementById("save-button");
  const saveButtonText = document.getElementById("save-button-text");

  const fetchRecipeDetails = async () => {
    try {
      const edamamResponse = await fetch(
        `https://api.edamam.com/api/recipes/v2/${recipeId}?type=public&app_id=ee6ab7da&app_key=${edamamApiKey}`
      );
      if (!edamamResponse.ok) throw new Error("Network response was not ok");
      const edamamData = await edamamResponse.json();
      const recipe = edamamData.recipe;

      recipeTitleElement.textContent = recipe.label || "Untitled";
      recipeImageElement.src = recipe.image || "";
      recipeAuthorElement.innerHTML = `<span class="span">by</span> ${
        recipe.source || "Unknown"
      }`;
      ingredientsCountElement.textContent = recipe.ingredientLines.length || 0;
      cookingTimeElement.textContent = getTime(recipe.totalTime || 0);
      caloriesElement.textContent = Math.floor(recipe.calories) || 0;

      if (recipe.dietLabels) {
        dietLabelsElement.innerHTML = `<span class="label-medium">Diet Labels:</span> ${recipe.dietLabels
          .map((label) => `<span class="tag">${label}</span>`)
          .join("")}`;
      }

      if (recipe.cuisineType) {
        cuisineTypeElement.innerHTML = `<span class="label-medium">Cuisine Type:</span> ${recipe.cuisineType
          .map((type) => `<span class="tag">${type}</span>`)
          .join("")}`;
      }

      if (recipe.dishType) {
        dishTypeElement.innerHTML = `<span class="label-medium">Dish Type:</span> ${recipe.dishType
          .map((type) => `<span class="tag">${type}</span>`)
          .join("")}`;
      }

      recipeIngredientsElement.innerHTML = `
        ${
          recipe.ingredientLines
            ? `<ul>${recipe.ingredientLines
                .map((ingredient) => `<li>${ingredient}</li>`)
                .join("")}</ul>`
            : ""
        }
      `;

      // Fetch instructions from Spoonacular
      await fetchRecipeInstructions(recipe.label);

      // Handle save button state based on localStorage or any other logic
      const isSaved = checkIfRecipeSaved(recipeId);
      updateSaveButton(isSaved);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      recipeTitleElement.textContent =
        "Failed to fetch recipe details. Please try again later.";
    }
  };

  const fetchRecipeInstructions = async (recipeTitle) => {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
          recipeTitle
        )}&apiKey=${spoonacularApiKey}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const recipeDetailsResponse = await fetch(
          `https://api.spoonacular.com/recipes/${data.results[0].id}/information?includeNutrition=false&apiKey=${spoonacularApiKey}`
        );
        if (!recipeDetailsResponse.ok)
          throw new Error("Network response was not ok");
        const recipeDetails = await recipeDetailsResponse.json();

        recipeInstructionsElement.innerHTML = recipeDetails.instructions
          ? `<p>${recipeDetails.instructions}</p>`
          : `<p>No specific instructions available.</p>`;
      } else {
        recipeInstructionsElement.innerHTML = `<p>No specific instructions available.</p>`;
      }
    } catch (error) {
      console.error("Error fetching instructions from Spoonacular:", error);
      recipeInstructionsElement.innerHTML = `<p>No specific instructions available.</p>`;
    }
  };

  const checkIfRecipeSaved = (id) => {
    // Example: Implement your logic to check if the recipe is saved
    return localStorage.getItem(`recipe_${id}`) !== null;
  };

  const updateSaveButton = (isSaved) => {
    if (isSaved) {
      saveButton.classList.add("saved");
      saveButtonText.textContent = "Unsave";
    } else {
      saveButton.classList.remove("saved");
      saveButtonText.textContent = "Save";
    }
  };

  saveButton.addEventListener("click", () => {
    const isSaved = saveButton.classList.contains("saved");
    if (isSaved) {
      // Handle unsaving logic
      localStorage.removeItem(`recipe_${recipeId}`);
      updateSaveButton(false);
    } else {
      // Handle saving logic
      localStorage.setItem(`recipe_${recipeId}`, true);
      updateSaveButton(true);
    }
  });

  fetchRecipeDetails();
});

document.addEventListener("DOMContentLoaded", function () {
  const tagLists = document.querySelectorAll(".tags");

  tagLists.forEach((tagList) => {
    tagList.addEventListener("click", function (event) {
      if (event.target.classList.contains("filter-chip")) {
        const tagText = event.target.innerText.trim();
        // Redirect to recipes page with tag query parameter
        window.location.href = `recipes.html?tag=${encodeURIComponent(
          tagText
        )}`;
      }
    });
  });
});
