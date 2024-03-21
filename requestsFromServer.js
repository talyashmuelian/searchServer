const axios = require("axios");

const baseURL = "http://localhost:8088";

async function requestsGet(path) {
  try {
    const response = await axios.get(baseURL + path);
    return response;
  } catch (error) {
    if (error.response) {
      // Log the entire error response data for debugging
      console.error("Error Response Data:", error.response.data);

      // Log the status code of the error
      console.error("Error Status Code:", error.response.status);
    } else {
      // If the error does not have a response (e.g., network error), log the generic error message
      console.error("Error performing GET request:", error.message);
    }
    throw error;
  }
}

async function requestsPost(path, object) {
  try {
    const response = await axios.post(baseURL + path, object, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    if (error.response) {
      // Log the entire error response data for debugging
      console.error("Error Response Data:", error.response.data);

      // Log the status code of the error
      console.error("Error Status Code:", error.response.status);
    } else {
      // If the error does not have a response (e.g., network error), log the generic error message
      console.error("Error performing POST request:", error.message);
    }
    throw error;
  }
}

module.exports = {
  requestsGet,
  requestsPost,
};
