/**
 * Fetch data from Edamam API
 * @param {Array} queries 
 * @param {Function} successCallback -
 */
window.ACCESS_POINT = "https://api.edamam.com/api/recipes/v2";
const app_id = "ee6ab7da";
const app_key = "da1c86026ceed6de2f2af11c804ca565";
const type = "public";

export const fetchData = async function (queries, successCallback) {
  const query = queries
    ?.join("&")
    .replace(/,/g, "=")
    .replace(/ /g, "%20")
    .replace(/\+/g, "%2B");

  const url = `${ACCESS_POINT}?app_id=${app_id}&app_key=${app_key}&type=${type}${
    query ? `&${query}` : ""
    }`;
  
  const response = await fetch(url);

  if (response.ok) {
    const data = await response.json();
    successCallback(data);
  }
};
