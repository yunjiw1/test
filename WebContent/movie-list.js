
function handleStarResult(resultData) {
    console.log("handleStarResult: populating movie table from resultData");
    let movieListElement = jQuery("#Movie_List_body");
    movieListElement.empty();

    // {movieId : set(genres)}
    let genresMap = new Map();
    // {movieId : set([starName, starId])
    let starsMap = new Map();
    // {movieId : [title, year, director, rating}
    let singleAttrs = new Map();

    for (let i = 0; i < resultData.length; i++) {
        let m = resultData[i]['movieId'];
        if (!genresMap.has(m)) genresMap.set(m, new Set())
        if (genresMap.get(m).size < 3) genresMap.set(m, genresMap.get(m).add(resultData[i]['genreName']))
        if (!starsMap.has(m)) starsMap.set(m, new Set())
        if (starsMap.get(m).size < 3) starsMap.set(m, starsMap.get(m).add([resultData[i]['starName'], resultData[i]['starId']]))
        if (singleAttrs.has(m)) continue;
        singleAttrs.set(m, [resultData[i]['title'], resultData[i]['year'], resultData[i]['director'], resultData[i]['rating']]);
    }

    for (let [key, value] of singleAttrs){
        let rowHTML = "";

        rowHTML += "<tr>"
            + "<td style=\"text-align:center\"><a href=\"single-movie.html?id=" + key + "\">" + value[0] + "</td>"
            + "<td style=\"text-align:center\">" + value[1] + "</td>"
            + "<td style=\"text-align:center\">" + value[2] + "</td>";


        rowHTML += "<td><ul>";
        genresMap.get(key).forEach(g => rowHTML += "<li>" + g + "</li>");
        rowHTML += "</ul></td>";

        rowHTML += "<td><ul>";
        starsMap.get(key).forEach( s => rowHTML += "<li>" + "<a href=\"single-star.html?id=" + s[1] + "\">" + s[0] + "</a>" + "</li>" )
        rowHTML += "</ul></td>";

        rowHTML += "<td style=\"text-align:center\">" + value[3] + "</td>";
        rowHTML += "</tr>";

        movieListElement.append(rowHTML);
    }
}

jQuery.ajax({
    dataType: "json", // Setting return data type
    method: "GET", // Setting request method
    url: "api/top-rating-movies", // Setting request url, which is mapped by StarsServlet in Stars.java
    success: (resultData) => handleStarResult(resultData) // Setting callback function to handle data returned successfully by the StarsServlet
});