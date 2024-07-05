// module.js

/**
 * @param {Number} minute Cooking time in minutes
 * @returns {String} Formatted time
 */
// module.js
export const getTime = (totalTime) => {
  if (typeof totalTime !== "number" || totalTime < 1) {
    return "<1 minute";  // For times less than 1 minute or invalid totalTime
  }

  const days = Math.floor(totalTime / 1440); // 1440 minutes in a day
  const remainingMinutes = totalTime % 1440;
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  let formattedTime = "";
  if (days > 0) {
    formattedTime += `${days} day${days > 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    if (days > 0) {
      formattedTime += ", ";
    }
    formattedTime += `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  if (minutes > 0) {
    if (days > 0 || hours > 0) {
      formattedTime += " and ";
    }
    formattedTime += `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  return formattedTime;
};


