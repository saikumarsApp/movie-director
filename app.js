const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost/3000/");
    });
  } catch (e) {
    console.log(`DB Error is ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const getObject = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

const getDirectorObject = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie ORDER BY movie_id;
    `;
  const getMovies = await db.all(getMoviesQuery);
  response.send(getMovies.map((item) => getObject(item)));
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieAddQuery = `
    INSERT INTO
        movie (director_id, movie_name, lead_actor)
    VALUES
       (
           ${directorId},
           '${movieName}',
           '${leadActor}'
       );`;
  const postResponse = await db.run(movieAddQuery);
  const movieId = postResponse.lastID;
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const movieId = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
            UPDATE movie 
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}';`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesQuery = `
    SELECT
      *
    FROM
      movie
    WHERE 
        movie_id = ${movieId};`;
  const getMovie = await db.get(getMoviesQuery);
  response.send(getObject(getMovie));
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  getDirectorQuery = `SELECT * FROM director`;
  const director = await db.all(getDirectorQuery);
  response.send(director.map((item) => getDirectorObject(item)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNameQuery = `
  SELECT 
    movie_name
  FROM 
    movie
  WHERE 
    director_id = ${directorId};`;
  const movie = await db.all(getMovieNameQuery);
  response.send(
    movie.map((item) => {
      movieName: item.movie_name;
    })
  );
});

module.exports = app;
