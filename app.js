const express = require("express");
const app = express();
const https = require("https");
const bodyParser = require("body-parser")
require('dotenv').config();
// const API_KEY = process.env.API_KEY;
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index.ejs');
  });
  app.get('/result', (req, res) => {
    res.render('result.ejs');
  });
// app.set('views', path.join(__dirname, 'views'));
// PLEASE DONT USE MY API KEY I AM STILL FIGURING OUT HOW TO HIDE IT
const API_KEY = " - - - -  ADD API KEY HERE - - - - ";

app.post("/", function(req,res){
    const movie1 = req.body.movie1;
    const movie2 = req.body.movie2;
    const query = `i want you to list 5 key aspects in which the movie is good at. 5 each for these two movies: ${movie1} and ${movie2}. use maximum 4-5 words for the aspects and write them in this format "Aspect Number": "(aspect described in short)". the reponse should be strictly in this format:
    {
    "${movie1}": {
    "Aspect 1": " ",
    "Aspect 2": " ",
    "Aspect 3": " ",
    "Aspect 4": " ",
    "Aspect 5": " "
    },
    "${movie2}": {
    "Aspect 1": " ",
    "Aspect 2": " ",
    "Aspect 3": " ",
    "Aspect 4": " ",
    "Aspect 5": " "
    }
    }`

    async function fetchData() { 
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{
              role: "user",
              content: `${query}`
          }]
          }),
        });
        const data = await response.json();        
        res.render("choices.ejs", { movies: JSON.parse(data.choices[0].message.content) });
        app.post("/result", function(req, res){
            formData = req.body
            const selectedOptions = {};
            Object.keys(formData).forEach((key) => {
              const [movie, aspect] = key.split("-");
              if (!selectedOptions[movie]) {
                selectedOptions[movie] = {};
              }
              selectedOptions[movie][aspect] = formData[key];
            });

            const formattedOptions = {};

            // Iterate over the selectedOptions object
            Object.keys(selectedOptions).forEach((movie) => {
              const aspects = selectedOptions[movie];
              const aspectDescriptions = Object.values(aspects);
            
            // Assign the array of aspect descriptions to the movie key in the reformattedOptions object
              formattedOptions[movie] = aspectDescriptions;
            });
            const aspects1 = formattedOptions[movie1]
            const aspects2 = formattedOptions[movie2]
            const finalquery = `list down 3 movies that are similar to aspects like ${aspects1} from ${movie1} and ${aspects2} from ${movie2}. Also stricty mention in one sentance why you chose that movie. give your respense strictly in this JSON format:-
            {
            "(movie title)": "(reason you selected it)"
            "(movie title)": "(reason you selected it)"
            "(movie title)": "(reason you selected it)
            }`
            async function finalresult() { 
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{
                      role: "user",
                      content: `${finalquery}`
                  }]
                  }),
                });
                const data = await response.json();
                movieDescriptions = JSON.parse(data.choices[0].message.content); 
                res.render('result', { movieDescriptions }) 
              }
              finalresult();            
        })      
      }
      fetchData()
})

app.listen(3000, function(){
    console.log("Server is running on port 3000");
})
