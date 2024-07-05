import { fetchData } from "./api.js";
import { $skeletonCard, cardQueries } from "./global.js";
import { getTime } from "./module.js";

document.addEventListener("DOMContentLoaded", function () {
  /* HOMEPAGE */

  // Search field and button setup
  const $searchField = document.querySelector("[data-search-field]");
  const $searchBtn = document.querySelector("[data-search-btn]");

  // Handle search button click
  $searchBtn.addEventListener("click", function () {
    if ($searchField.value) {
      window.location = `recipe.html?q=${$searchField.value}`;
    }
  });

  // Handle search submit on pressing Enter
  $searchField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      $searchBtn.click();
    }
  });

  /* TAB NAVIGATION */

  const $tabBtns = document.querySelectorAll("[data-tab-btn]");
  const $tabPanels = document.querySelectorAll("[data-tab-panel]");

  let [$lastActiveTabPanel] = $tabPanels;
  let [$lastActiveTabBtn] = $tabBtns;

  // Add event listener to tab buttons for navigation
  $tabBtns.forEach((tabBtn) => {
    tabBtn.addEventListener("click", function () {
      $lastActiveTabPanel.setAttribute("hidden", "");
      $lastActiveTabBtn.setAttribute("aria-selected", false);
      $lastActiveTabBtn.setAttribute("tabindex", -1);

      const $currentTabPanel = document.querySelector(
        `#${this.getAttribute("aria-controls")}`
      );

      $currentTabPanel.removeAttribute("hidden");
      this.setAttribute("aria-selected", true);
      this.setAttribute("tabindex", 0);

      $lastActiveTabPanel = $currentTabPanel;
      $lastActiveTabBtn = this;

      addTabContent(this, $currentTabPanel);
    });
  });

  // Function to add content to a tab
  const addTabContent = ($currentTabBtn, $currentTabPanel) => {
    const $gridList = document.createElement("div");
    $gridList.classList.add("grid-list");

    $currentTabPanel.innerHTML = `
      <div class="grid-list">
        ${$skeletonCard.repeat(12)}
      </div>
    `;

    fetchData(
      [
        ["mealType", $currentTabBtn.textContent.trim().toLowerCase()],
        ...cardQueries,
      ],
      function (data) {
        if (
          data &&
          data.hits &&
          Array.isArray(data.hits) &&
          data.hits.length > 0
        ) {
          $currentTabPanel.innerHTML = ""; // Clear the panel before adding new content

          data.hits.forEach((hit, i) => {
            const {
              recipe: { image, label: title, totalTime: cookingTime, uri },
            } = hit;

            const formattedTime = getTime(cookingTime); // Format cooking time

            const recipeId = uri.slice(uri.lastIndexOf("_") + 1);
            const isSaved = localStorage.getItem(`recipe_${recipeId}`);

            const $card = document.createElement("div");
            $card.classList.add("card");
            $card.style.animationDelay = `${100 * i}ms`;

            $card.innerHTML = `
              <figure class="card-medium img-holder">
                <img
                  src="${image}"
                  loading="eager"
                  alt="${title}"
                  width="200"
                  height="200"
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
                  <button class="icon-btn bookmark-btn has-state ${
                    isSaved ? "saved" : "removed"
                  }" data-recipe-id="${recipeId}" aria-label="Add to saved recipes">
                    <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                    <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
                  </button>
                </div>
              </div>
            `;
            $gridList.appendChild($card);
          });

          // Append the grid list to the panel
          $currentTabPanel.appendChild($gridList);

          // Append "Show more" link if data exists
          $currentTabPanel.innerHTML += `
            <a href="recipe.html?mealType=${$currentTabBtn.textContent
              .trim()
              .toLowerCase()}" class="btn btn-secondary label-large has-state">Show more</a>
          `;
        } else {
          $currentTabPanel.innerHTML = "<p>No recipes found.</p>";
        }
      }
    );
  };

  addTabContent($lastActiveTabBtn, $lastActiveTabPanel);

  /**
   * Fetch data for slider section
   */

  let cuisineType = ["indian", "chinese"]; // Ensure correct casing if API is case-sensitive

  const $sliderSections = document.querySelectorAll("[data-slider-section]");

  $sliderSections.forEach(($sliderSection, index) => {
    $sliderSection.innerHTML = `
      <div class="container">
        <h2 class="section-title headline-small" id="slider-label-${
          index + 1
        }">Latest ${
      cuisineType[index].charAt(0).toUpperCase() + cuisineType[index].slice(1)
    } Recipes</h2>
        <div class="slider">
          <ul class="slider-wrapper" data-slider-wrapper>
            ${`<li class="slider-item">${$skeletonCard}</li>`.repeat(10)}
          </ul>
        </div>
      </div>
    `;

    const $sliderWrapper = $sliderSection.querySelector(
      "[data-slider-wrapper]"
    );

    fetchData(
      [...cardQueries, ["cuisineType", cuisineType[index]]],
      function (data) {
        if (
          data &&
          data.hits &&
          Array.isArray(data.hits) &&
          data.hits.length > 0
        ) {
          $sliderWrapper.innerHTML = ""; // Clear existing skeleton cards

          data.hits.forEach((item) => {
            const {
              recipe: { image, label: title, totalTime: cookingTime, uri },
            } = item;

            const formattedTime = getTime(cookingTime); // Format cooking time

            const recipeId = uri.slice(uri.lastIndexOf("_") + 1);
            const isSaved = localStorage.getItem(`recipe_${recipeId}`);

            const $sliderItem = document.createElement("li");
            $sliderItem.classList.add("slider-item");

            $sliderItem.innerHTML = `
              <div class="card">
                  <figure class="card-medium img-holder">
                    <img
                      src="${image}"
                      loading="lazy"
                      alt="${title}"
                      width="200"
                      height="200"
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
                      <button class="icon-btn bookmark-btn has-state ${
                        isSaved ? "saved" : "removed"
                      }" data-recipe-id="${recipeId}" aria-label="Add to saved recipes">
                        <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                        <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
                      </button>
                    </div>
                  </div>
              </div>
            `;

            $sliderWrapper.appendChild($sliderItem);
          });

          $sliderWrapper.innerHTML += `
            <li class="slider-item" data-slider-item>
              <a href="recipe.html?cuisineType=${cuisineType[
                index
              ].toLowerCase()}" class="load-more-card has-state">
                <span class="label-large">Show more</span>
                <span class="material-symbols-outlined" aria-hidden="true">navigate_next</span>
              </a>
            </li>
          `;
        } else {
          $sliderWrapper.innerHTML = "<p>No recipes found.</p>";
        }
      }
    );
  });

  // Event listener for bookmark buttons (delegate to handle dynamic content)
  document.addEventListener("click", async (event) => {
    if (event.target.matches(".bookmark-btn, .bookmark-btn *")) {
      const button = event.target.closest(".bookmark-btn");
      const recipeId = button.getAttribute("data-recipe-id");

      const isSaved = localStorage.getItem(`recipe_${recipeId}`);

      if (!isSaved) {
        localStorage.setItem(`recipe_${recipeId}`, true);
        button.classList.add("saved");
        button.classList.remove("removed");
        showNotification("Added to Saved Recipes");
      } else {
        localStorage.removeItem(`recipe_${recipeId}`);
        button.classList.remove("saved");
        button.classList.add("removed");
        showNotification("Removed from Saved Recipes");
      }
    }
  });

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
    $snackbar.textContent = message;
    $snackbarContainer.appendChild($snackbar);

    setTimeout(() => {
      $snackbar.remove();
    }, 3000);
  }
});
