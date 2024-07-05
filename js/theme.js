const $HTML = document.documentElement;
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (sessionStorage.getItem("theme")) {
  $HTML.dataset.theme = sessionStorage.getItem("theme");
} else {
  $HTML.dataset.theme = isDark ? "Dark" : "Light";
}

let isPressed = false;
const changeTheme = function () {
  isPressed = !isPressed;
  this.setAttribute("aria-pressed", isPressed);
  $HTML.setAttribute(
    "data-theme",
    $HTML.dataset.theme === "Light" ? "Dark" : "Light"
  );
  sessionStorage.setItem("theme", $HTML.dataset.theme);
};

window.addEventListener("load", function () {
  const $themeBtn = document.querySelector("[data-theme-btn]");
  $themeBtn.addEventListener("click", changeTheme);
});
