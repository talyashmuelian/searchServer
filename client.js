const axios = require("axios");
const { requestsGet, requestsPost } = require("./requestsFromServer"); // Assuming you have stored the functions in a file named clientFunctions.js

async function main() {
  try {
    // Perform GET request to /hello API
    const helloResponse = await requestsGet("/hello");
    console.log("GET /hello Status Code:", helloResponse.status); // Print the status code
    console.log("GET /hello Response Data:", helloResponse.data); // Print the response data

    // Perform POST request to /lastSearch API
    // const searchObject = {
    //   userId: "Bobi",
    //   searchPhrase: "marvel1",
    // };
    // const postResponse = await requestsPost("/lastSearch", searchObject);
    // console.log("POST /lastSearch Status Code:", postResponse.status); // Print the status code
    // console.log("POST /lastSearch Response Data:", postResponse.data); // Print the response data

    // // Perform GET request to /health API
    // const healthResponse = await requestsGet("/health");
    // //console.log("GET /health Response:", healthResponse);
    // console.log("GET /health Status Code:", healthResponse.status); // Print the status code
    // console.log("GET /health Response Data:", healthResponse.data); // Print the response data

    // Perform GET request to /lastSearches API
    const lastSearchesResponse = await requestsGet(
      "/lastSearches?userId=Bob&limit=2"
    );
    console.log("GET /lastSearches Status Code:", lastSearchesResponse.status); // Print the status code
    console.log("GET /lastSearches Response Data:", lastSearchesResponse.data); // Print the response data

    // Perform GET request to /mostPopular API
    const mostPopularResponse = await requestsGet("/mostPopular?limit=4");
    console.log("GET /mostPopular Status Code:", mostPopularResponse.status); // Print the status code
    console.log("GET /mostPopular Response Data:", mostPopularResponse.data); // Print the response data
  } catch (error) {
    console.log("line 45");
    console.error("Error:", error.message);
  }
}

// Call the main function to execute the requests
main();
