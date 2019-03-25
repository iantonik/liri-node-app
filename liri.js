require("dotenv").config();
var fs = require("fs");
var keys = require("./keys.js");
var axios = require("axios");
var moment = require('moment');

var divider = "\n------------------------------------------------------------\n\n";


var runService = function (searchRequest, searchCriteria) {
    switch (searchRequest) {
        case ("concert-this"):
            findConcert(searchCriteria);
            break;
        case ("spotify-this-song"):
            sportifySong(searchCriteria);
            break;
        case ("movie-this"):
            findMovieDetails(searchCriteria);
            break;
        case ("do-what-it-says"):
            runFile();
            break;
        default:
            console.log("Please try again. Search criteria could not be read");
    }
}

//do-what-it-says

var runFile = function () {
    fs.readFile('random.txt', 'utf8', (err, data) => {
        if (err) throw err;
        var parameters = data.split(",");
        console.log(parameters)
        searchRequest = parameters[0].trim();
        searchCriteria = parameters[1].trim();
        runService(searchRequest, searchCriteria);
    });
}

var Spotify = require('node-spotify-api');
var spotify = new Spotify(keys.spotify);

//songs 

var sportifySong = function (songTitle) {
    
    if(!songTitle){
        songTitle = 'Ace of Base - The Sign';
    } 

    spotify.search({ type: 'track', query: songTitle, limit: 1 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        var songInfo = data.tracks.items[0];
        var artistList = data.tracks.items[0].artists;
        
        var songArtist = artistList.map(a => {return a.name});

        var songDetails = [
            "Song Name: " + songInfo.name,
            "Album Name: " + songInfo.album.name,
            "Artist Name: " + songArtist.join(","),
            "preview Link: " + (songInfo.preview ? songInfo.preview : "Not available."),
            // "Preview Link:" + songInfo.external_urls.spotify,
        ].join("\n")

        fs.appendFile("log.txt", songDetails + divider, function (err) {
            if (err) throw err;
            console.log(songDetails, divider);
        });
    });
}

//Bands

// Date of the Event (use moment to format this as "MM/DD/YYYY")

var findConcert = function (artist) {
    searchCriteria = process.argv[3];
    axios({
        method: 'get',
        url: `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`
    })
        .then(function (response) {
            var events = response.data;
            events.forEach(event => {

                var eventDetails = [
                    "Name of the Venue: " + event.venue.name,
                    "Venue City: " + event.venue.city,
                    "Venue Country " + event.venue.country,
                    "Date " + moment(event.datetime).format("MM/DD/YYYY")
                ].join("\n")

                fs.appendFile("log.txt", eventDetails + divider, function (err) {
                    if (err) throw err;
                    console.log(eventDetails, divider);
                });



            })
        });
}



//Movies

var findMovieDetails = function (movieTitle) {

    if(!movieTitle){
        searchCriteria = 'Mr. Nobody';
    } 

    axios({
        method: 'get',
        url: `http://www.omdbapi.com/?apikey=trilogy&t=${movieTitle}`
    })
        .then(function (response) {
            var movieInfo = response.data;

            var movieRating = movieInfo.Ratings

            var rottenTomatoes = function () {
                var retVal;
                movieRating.forEach(ratingSource => {

                    if (ratingSource.Source === "Rotten Tomatoes") {

                        retVal = ratingSource.Value;
                        return;
                    }
                });
                return retVal;
            }
            var movieDetails = [
                "Movie Title: " + movieInfo.Title,
                "Release Year: " + movieInfo.Year,
                "IMDB Rating: " + movieInfo.imdbRating,
                "Rotten Tomatoes: " + rottenTomatoes(),
                "Production Country: " + movieInfo.Country,
                "Language: " + movieInfo.Language,
                "Plot: " + movieInfo.Plot,
                "Actors: " + movieInfo.Actors,
            ].join("\n");

            fs.appendFile("log.txt", movieDetails + divider, function (err) {
                if (err) throw err;
                console.log(movieDetails, divider);
            });

        });
}


runService(process.argv[2], process.argv[3]);