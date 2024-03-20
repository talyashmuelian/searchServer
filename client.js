const axios = require("axios");
const {
  requestsGet,
  requestsPost,
  requestsPut,
  requestsDelete,
} = require("./requestsFromServer"); // Assuming you have stored the functions in a file named clientFunctions.js

async function main() {
  try {
    // Perform GET request to /hello API
    const helloResponse = await requestsGet("/hello");
    console.log("GET /hello Response:", helloResponse);

    // // Perform POST request to /lastSearch API
    // const searchObject = {
    //   userId: "Bob",
    //   searchPhrase: "marvel",
    // };
    // const postResponse = await requestsPost("/lastSearch", searchObject);
    // console.log("POST /lastSearch Response:", postResponse);

    // // Perform GET request to /health API
    // const healthResponse = await requestsGet("/health");
    // console.log("GET /health Response:", healthResponse);

    // Perform GET request to /lastSearches API
    // const lastSearchesResponse = await requestsGet(
    //   "/lastSearches?userId=Bob&limit=1"
    // );
    // console.log("GET /lastSearches Response:", lastSearchesResponse);

    // Perform GET request to /mostPopular API
    const mostPopularResponse = await requestsGet("/mostPopular?limit=1");
    console.log("GET /mostPopular Response:", mostPopularResponse);

    // // Perform DELETE request to /lastSearch API
    // const deleteResponse = await requestsDelete("/lastSearch");
    // console.log("DELETE /lastSearch Response:", deleteResponse);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Call the main function to execute the requests
main();
