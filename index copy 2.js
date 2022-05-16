/////////////
//LIBRARIES///////////////////////////////////////////////////////////////
/////////////

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const vu = require("valid-url");
const mongo = require("mongodb");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const sid = require("shortid");
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

/////////////
//VARIABLES///////////////////////////////////////////////////////////////
/////////////

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
 

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original: {type: String, required:true},
  short: Number
});
const Urll = mongoose.model("URLL", urlSchema);

/////////////
//SECTION 1///////////////////////////////////////////////////////////////
/////////////

//Starting view 
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

//This is the get function that allows us to redirect to links
app.get('/api/shorturl/:short', function(req, res) {
  ShortUrl.find({short_url: req.params.short}).then(function (docs) {
    res.redirect(docs[0].original_url);
  });
});

//This is the post function that allows us to receive links
let responseObject ={};
app.post("/api/shorturl", bodyParser.urlencoded({extended:false}) ,function (req, res) {
  const inputUrl =req.body['url'];
res.json({name:"abc"});
  responseObject['original_url'] = inputUrl;
  console.log(responseObject);
  let inputShort = 1;
  Urll.findOne({})
        .sort({short: 'desc'})
        .exec((error,result)=>{
          if(!error && result != undefined){
            inputShort = result.short + 1;
          }
          if(!error){
            Urll.findOneAndUpdate(
              {original: inputUrl},
              {original:inputUrl, short:inputShort},
              {new : true, upsert: true},
              (error,savedUrl)=>{
                if(!error){
                  responseObject['short_url'] = savedUrl.short;
                  res.json(responseObject);
                }
              }
            )
          }
  })
});

//Set the server port to whatever port is defined and make sure to be using cross-origin for testing
app.listen(3000, function() {console.log(`Listening on port 3000`)});