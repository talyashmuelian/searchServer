const axios = require("axios");

const baseURL = "http://localhost:8088";

async function requestsGet(path) {
  try {
    const response = await axios.get(baseURL + path);
    return response.data;
  } catch (error) {
    console.error("Error performing GET request:", error.message);
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
    return response.data;
  } catch (error) {
    console.error("Error performing POST request:", error.message);
    throw error;
  }
}

async function requestsPut(path, object) {
  try {
    const response = await axios.put(baseURL + path, object, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error performing PUT request:", error.message);
    throw error;
  }
}

async function requestsDelete(path) {
  try {
    const response = await axios.delete(baseURL + path);
    return response.data;
  } catch (error) {
    console.error("Error performing DELETE request:", error.message);
    throw error;
  }
}

module.exports = {
  requestsGet,
  requestsPost,
  requestsPut,
  requestsDelete,
};
