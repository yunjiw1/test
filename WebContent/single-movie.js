function getParameterByName(target) {
    // Get request URL
    let url = window.location.href;
    // Encode target parameter name to url encoding
    target = target.replace(/[\[\]]/g, "\\$&");

    // Ues regular expression to find matched parameter value
    let regex = new RegExp("[?&]" + target + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';

    // Return the decoded parameter value
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * @param resultData jsonObject
 */
function handleStarResult(resultData) {
    // find the table part with tag MovieList
    let  SingleMovieElement = jQuery("#Single_Movie_Body");

    // set(genre...)
    let genresSet = new Set();
    // {starId : starName}
    let starsMap = new Map();
    // Iterate through resultData, no more than 10 entries
    for (let i = 0; i < resultData.length; i++) {
        genresSet.add(resultData[i]["genreName"]);
        starsMap.set(resultData[i]["starId"], resultData[i]["starName"]);
    }

    let rowHTML = "";

    rowHTML += "<tr>"
        + "<td style=\"text-align:center\"><a href=\"single-movie.html?id=" + resultData[0]['movieId'] + "\">" + resultData[0]['title'] + "</td>"
        + "<td style=\"text-align:center\">" + resultData[0]['year'] + "</td>"
        + "<td style=\"text-align:center\">" + resultData[0]['director'] + "</td>";

    rowHTML += "<td><ul>";
    genresSet.forEach(g => rowHTML += "<li>" + g + "</li>");
    rowHTML += "</ul></td>";

    // The order?
    rowHTML += "<td><ul>";
    starsMap.forEach((k, v) => rowHTML += "<li>" + "<a href=\"single-star.html?id=" + v + "\">" + k + "</a>" + "</li>");
    rowHTML += "</ul></td>";

    rowHTML += "<td style=\"text-align:center\">" + resultData[0]['rating'] + "</td>";
    rowHTML += "</tr>";

    SingleMovieElement.append(rowHTML);
}

// Get id from URL
let movieId = getParameterByName('id');

// Makes the HTTP GET request and registers on success callback function handleStarResult
jQuery.ajax({
    cache: false,
    dataType: "json", // Setting return data type
    method: "GET", // Setting request method
    url: "api/single-movie?id=" + movieId, // Setting request url, which is mapped by StarsServlet in Stars.java
    success: (resultData) => handleStarResult(resultData) // Setting callback function to handle data returned successfully by the StarsServlet
});