import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.servlet.ServletConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;

// Declaring a WebServlet called StarsServlet, which maps to url "/api/top-rating-movies"
@WebServlet(name = "TopRatingMoviesServlet", urlPatterns = "/api/top-rating-movies")
public class TopRatingMovies extends HttpServlet{
    private static final long serialVersionUID = 3L;

    // Create a dataSource which registered in web.xml
    private DataSource dataSource;

    public void init(ServletConfig config) {
        try {
            dataSource = (DataSource) new InitialContext().lookup("java:comp/env/jdbc/moviedb");
        } catch (NamingException e) {
            e.printStackTrace();
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

        response.setContentType("application/json");

        // Output stream to STDOUT
        PrintWriter out = response.getWriter();

        try  {
            Connection conn = dataSource.getConnection();
            // query1 &  rs1: retrieve top 20
            String query = "with topRatingMovies as (select * from ratings r, movies m where r.movieId = m.id order by r.rating desc limit 20)," +
                    "starsMovies as (select s.id as starId, s.name, sm.movieId from stars s, stars_in_movies sm where s.id = sm.starId)," +
                    "genresMovies as (select g.name, gm.movieId from genres g, genres_in_movies gm where g.id = gm.genreId) " +
                    "select trm.id as movieId, trm.title, trm.year, trm.director, sm.name as starName, sm.starId, gm.name as genreName, trm.rating " +
                    "from topRatingMovies trm, starsMovies sm, genresMovies gm where trm.id = sm.movieId and  trm.id = gm.movieId;";

            // Construct & execute a query
            PreparedStatement statement = conn.prepareStatement(query);

            ResultSet rs = statement.executeQuery(query);

            HashMap<String, ArrayList<String>> genres = new HashMap<>();
            HashMap<String, ArrayList<String>> stars = new HashMap<>();
            HashMap<String, String[]> singleAttrs = new HashMap<>();
            ArrayList<String> movieOrder = new ArrayList<>();
            JsonArray jsonArray = new JsonArray();

            // Add results to the jsonArray
            while (rs.next()) {
                JsonObject jsonObject = new JsonObject();
                jsonObject.addProperty("movieId", rs.getString("movieId"));
                jsonObject.addProperty("title", rs.getString("title"));
                jsonObject.addProperty("year", rs.getString("year"));
                jsonObject.addProperty("director", rs.getString("director"));
                jsonObject.addProperty("starName", rs.getString("starName"));
                jsonObject.addProperty("starId", rs.getString("starId"));
                jsonObject.addProperty("genreName", rs.getString("genreName"));
                jsonObject.addProperty("rating", rs.getString("rating"));

                jsonArray.add(jsonObject);
            }

            // write JSON string to output
            out.write(jsonArray.toString());
            // set response status to 200 (OK)
            response.setStatus(200);

            rs.close();
            statement.close();
            conn.close();

        } catch (Exception e) {

            // write error message JSON object to output
            JsonObject jsonObject = new JsonObject();
            jsonObject.addProperty("errorMessage", e.getMessage());
            out.write(jsonObject.toString());

            // set reponse status to 500 (Internal Server Error)
            response.setStatus(500);

        }
        out.close();
    }
}
