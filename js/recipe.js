import { fetchData } from "./api.js";
import { $skeletonCard, cardQueries } from "./global.js";
import { getTime } from "./module.js";

/**
 * Add event listener to multiple elements
 * @param {NodeList} elements - The elements to attach the event to.
 * @param {string} eventType - The type of the event.
 * @param {Function} callback - The callback function to execute on event trigger.
 */

document.addEventListener("DOMContentLoaded", function () {
  const accordionBtns = document.querySelectorAll("[data-accordion-btn]");

  accordionBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      const newAriaExpanded = isExpanded ? "false" : "true";
      btn.setAttribute("aria-expanded", newAriaExpanded);
      const accordionContent = document.getElementById(
        btn.getAttribute("aria-controls")
      );
      accordionContent.style.display =
        newAriaExpanded === "true" ? "block" : "none";
    });
  });
});

const addEventOnElements = (elements, eventType, callback) => {
  elements.forEach((element) => element.addEventListener(eventType, callback));
};

const $accordions = document.querySelectorAll("[data-accordion]");

/**
 * Initialize accordion functionality
 * @param {NodeList} $element - The accordion element
 */
const initAccordion = function ($element) {
  const $button = $element.querySelector("[data-accordion-btn]");
  let isExpanded = false;

  $button.addEventListener("click", function () {
    isExpanded = !isExpanded;
    this.setAttribute("aria-expanded", isExpanded);
  });
};

$accordions.forEach(($accordion) => initAccordion($accordion));

/**
 * Filter bar Toggle
 */
const $filterBar = document.querySelector("[data-filter-bar]");
const $filterTogglers = document.querySelectorAll("[data-filter-toggler]");
const $overlay = document.querySelector("[data-overlay]");

addEventOnElements($filterTogglers, "click", function () {
  $filterBar.classList.toggle("active");
  $overlay.classList.toggle("active");
  document.body.style.overflow =
    document.body.style.overflow === "hidden" ? "visible" : "hidden";
});

/**
 * Filter bar and submit
 */
const /*{NodeElement}*/ $filterSubmit = document.querySelector("[data-filter-submit]");
const $filterClear = document.querySelector("[data-filter-clear]");
const $filterSearch = $filterBar
  ? $filterBar.querySelector("input[type='search']")
  : null;

$filterSubmit.addEventListener("click", function () {
  if (!$filterBar) return;

  const $filterCheckboxes = $filterBar.querySelectorAll("input:checked");

  const queries = [];

  if ($filterSearch.value) {
    queries.push(["q", $filterSearch.value]);
  }

  if ($filterCheckboxes.length) {
    for (const $checkbox of $filterCheckboxes) {
      const key = $checkbox.parentElement.parentElement.dataset.filter;
      queries.push([key, $checkbox.value]);
    }
  }

  window.location = queries.length
    ? `?${queries.join("&").replace(/,/g, "=")}`
    : "/recipe.html";
});

$filterSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") $filterSubmit.click();
});

$filterClear.addEventListener("click", function () {
  // Clear all checked checkboxes
  const $filterCheckboxes = $filterBar.querySelectorAll(
    "input[type='checkbox']:checked"
  );
  $filterCheckboxes.forEach((elem) => (elem.checked = false));

  // Clear the search input field
  if ($filterSearch) {
    $filterSearch.value = "";
  }
  // Optionally, reset the URL or reload the page to clear the filters
  window.location.href = window.location.pathname; // This will reload the page without any query parameters
});


const queryStr = window.location.search.slice(1);
const queryArr = queryStr && queryStr.split("&").map(i=>i.split("="));

const $filterCount = document.querySelector("[data-filter-count]");

if (queryArr.length) {
  $filterCount.style.display = "block";
  $filterCount.innerHTML = queryArr.length;
} else {
  $filterCount.style.display = "none";
}

queryStr && queryStr.split("&").map(i => {
  if (i.split("=")[0] === "q") {
    $filterBar.querySelector("input[type='search']").value = i.split("=")[1].replace(/%20/g, " ");
  } else {
    $filterBar.querySelector(
      `[value="${i.split("=")[1].replace(/%20/g, " ")}"]`
    ).checked = true;
  }
});


// const $filterBtn = document.querySelector("[data-filter-btn]");

// window.addEventListener("scroll", e => {
//   $filterBtn.classList[window.scrollY >= 120 ? "add" : "remove"]("active");
// })


const $gridlist = document.querySelector("[data-grid-list]");

const $loadMore = document.querySelector("[data-load-more]");

const defaultQueries = [
  ["mealType", "breakfast"],
  ["mealType", "lunch"],
  ["mealType", "dinner"],
  ["mealType", "snack"],
  ["mealType", "teatime"],
  ...cardQueries
];
  
$gridlist.innerHTML = $skeletonCard.repeat(20);
let nextPageurl = "";

const renderRecipe = (data) => {
  data.hits.forEach((item, index) => {
    const {
      recipe: { image, label: title, totalTime, uri },
    } = item;

    const formattedTime = getTime(totalTime);
    const recipeId = uri.slice(uri.lastIndexOf("_") + 1);
    const isSaved = window.localStorage.getItem(`recipe_${recipeId}`);

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
                <button class="icon-btn bookmark-btn has-state ${
                  isSaved ? "saved" : "removed"
                }" data-recipe-id="${recipeId}" aria-label="Add to saved recipes">
                  <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                  <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
                </button>
              </div>
            </div>
          `;
    $gridlist.appendChild($card);
  });
};



let requestedBefore = true;
fetchData(queryArr || defaultQueries, data => {
  console.log(data);
  const { _links: { next } } = data;
  nextPageurl = next?.href;

  $gridlist.innerHTML = "";
  requestedBefore = false;

  if (data.hits.length) {
    renderRecipe(data);
  } else {
    $loadMore.innerHTML=`<p class="body-medium info-text">No recipe found</p>`;
  } 
});

const CONTAINER_MAX_WIDTH = 1200;
const CONTAINER_MAX_CARD = 6;

window.addEventListener("scroll", async e => {
  if ($loadMore.getBoundingClientRect().top < window.innerHeight && !requestedBefore && nextPageurl) {
    $loadMore.innerHTML = $skeletonCard.repeat(Math.round(($loadMore.clientWidth / (CONTAINER_MAX_WIDTH)) * CONTAINER_MAX_CARD));
    requestedBefore = true;

    const response = await fetch(nextPageurl);
    const data = await response.json();

    const { _links: { next } } = data;
    nextPageurl = next?.href;
    renderRecipe(data);
    $loadMore.innerHTML = "";
    requestedBefore = false;

  }
  if (!nextPageurl) $loadMore.innerHTML = `<p class="body-medium info-text">No more recipes </p>`;
})


// Bookmark button event listener
document.addEventListener("click", async (event) => {
  if (event.target.matches(".bookmark-btn, .bookmark-btn *")) {
    const button = event.target.closest(".icon-btn");
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


