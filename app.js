// **NOTE** - Install and use the latest node version by 'nvm install stable', cuz with the current verion in cloud9 (v6.11.0), async functions are not supported, so program wont run. Set the latest version as default by 'nvm alias default v11.10.1'
// Run 'npm install --save-dev nodemon'  or 'npm install -D nodemon' to install nodemon(nodemon is a tool that helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected) as a dev dependency
// With a local installation, nodemon will not be available in your system path(To do that<not recommended> type 'npm install -g nodemon'). Instead, the local installation of nodemon can be run by calling it from within an npm script (in our case, 'npm run dev' where dev is the script 'nodemon app.js' in the package.json file. Note: We made a seperate script "start":"node app.js" before "dev" cuz the app will first look for app.js)
const express = require("express");
const app = express();
// Promise based HTTP client for the browser and node.js
const axios = require('axios');


app.set("view engine", "ejs");

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/results", function(req, res) {
    var  data;
    const imdbID = [];
    let movieInfo = [];
    const search = req.query.search;
    const url = 'http://www.omdbapi.com/?apikey=d0b74394&s=' + search;
    
    axios.get(url)
        .then(response => {
            // In Axios responses are already served as javascript object, no need to parse, simply get response and access data.
            // The response.data is in JSON so we dont need to parse it or do response.json like working with Fetch API (Coding Train Promises Tuturial - https://www.youtube.com/watch?v=QO4NXhWo_NM&list=PLRqwX-V7Uu6bKLPQvPRNNE65kBL62mVfx)
            data = response.data;
            if(data["Response"] == "True") {
                for(let i = 0; i < data["Search"].length; i++) {
                    imdbID.push(data["Search"][i]["imdbID"]);
                }
            }
            // Else next then() gets imdbID[] as empty array and hence no 'newUrl' requests are made and movieInfo[] remains empty
        })
        .then(() => {
            // Make an array of promises so that we get data in the same order as requested in the first place<from search 1 to last search>
            let promises = [];
            imdbID.forEach(function(id) {
                promises.push(fetchMovieByID(id));
            });
            
            // When all the promises are fulfilled
            Promise.all(promises)
                .then(results => {
                    // We can send this movieInfo (array of objects<particular movie detials> to the reuslts.ejs file
                    movieInfo = results;
                })
                .catch(err => console.error(err))
                .then(() => {
                    // Runs after everything and renders the results page
                    res.render("results", {search: search, data: data, movieInfo: movieInfo});
                }); 

            async function fetchMovieByID(id) {
                const newUrl = 'http://www.omdbapi.com/?apikey=d0b74394&i=' + id;
                const response = await axios.get(newUrl);
                return response.data;
            }
        })
        .catch((error) => console.error(error));
        
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started...");
});




// ** THIS CODE DOESNT WORK (CUZ ITS INEFFICIENT WHEN DEALING WITH ASYNCHRONOUS JS) **

// app.get("/results", function(req, res) {
//     // req.query will return a JS object after the query string is parsed
//     var search = req.query.search;
//     var url = 'http://www.omdbapi.com/?apikey=d0b74394&s=' + search;
//     request(url, function (error, response, body) {
//         if(!error && response.statusCode == 200) {
//             var parsedData = JSON.parse(body);
//             // var imdbID = [];
//             // var movieInfo = [];
            
//             // for(var i = 0; i < parsedData["Search"].length; i++) {
//             //     imdbID.push(parsedData["Search"][i]["imdbID"]);
//             // }
            
//             // imdbID.forEach(function(id) {
//             //   var newUrl = 'http://www.omdbapi.com/?apikey=d0b74394&i=' + id;
//             //   request(newUrl, function(error, response, body) {
//             //       movieInfo.push(JSON.parse(body));
//             //       // Requests are made asynchronously i.e. when 1st id is used to make a id search on omdb, in the meantime some other id sends a request to the api and pushes the movie detials JSON to the movieInfo array. P.S. requests are served kinda like threads in Java
//             //   });
//             // });
            
//             res.render("results", {search: search, parsedData: parsedData});
//         }
//     });
// });
