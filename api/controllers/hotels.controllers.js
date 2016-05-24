// Bring in the mongoose model for the hotels
var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

// Location query function.
var runGeoQuery = function(req, res) {
  var lng = parseFloat(req.query.lng);
  var lat = parseFloat(req.query.lat);

  // Check to make sure lng and lat are numbers
  if (isNaN(lng) || isNaN(lat)) {
    res
      .status(400)
      .json({
        "message": "If supplied in querystring, lng and lat should be numbers."
      });
    return;
  }

  // Create a geoJSON point
  var point = {
    type: "Point",
    coordinates: [lng, lat]
  };

  // Set options for the location search
  var geoOptions = {
    spherical: true,
    maxDistance: 2000,  // Units here is metres
    num : 5
  };

  Hotel
    .geoNear(point, geoOptions, function(err, results, stats) {
      console.log('Geo results', results);
      console.log('Geo stats', stats);
      res
        .status(200)
        .json(results);
    });

};

// Controller to return all the hotel data.
module.exports.hotelsGetAll = function(req, res) {

  // Set defaults for paganation
  var offset = 0;
  var count = 5;
  var maxCount = 10;

  // Check for a location query string
  if (req.query && req.query.lat && req.query.lng) {
    runGeoQuery(req, res);
    return;
  }

  // Process any offset query string
  if (req.query && req.query.offset) {
    offset = parseInt(req.query.offset, 10);
  }

  // Process any count query string
  if (req.query && req.query.count) {
    count = parseInt(req.query.count, 10);
  }

  // Make sure offset and count are numbers
  if (isNaN(offset) || isNaN(count)) {
    res
      .status(400)
      .json({
        "message": "If supplied in querystring, count and offset should be numbers."
      });
    return;
  }

  // Enforce the maximum number of hotels that can be returned through the API
  if (count > maxCount) {
    res
      .status(400)
      .json({
        "message": "Count limit of " + maxCount + " exceeded"
      });
    return;
  }

  // From the hotel Mongoose model, get the hotels according to any offset and
  // count query strings present in the requested URL.
  Hotel
    .find()
    .skip(offset)
    .limit(count)
    .exec(function(err, hotels) {
      if (err) {
        console.log("Error finding hotels");
        res
          .status(500)
          .json(err);
      }
      else {
        console.log('Found hotels', hotels.length);
        res
          .status(200)
          .json(hotels);
      }
    });

};

// Controller to return data on a singal hotel.
module.exports.hotelsGetOne = function(req, res) {

  // Get the URL parmater for the hotel ID.
  var hotelId = req.params.hotelId;

  console.log('GET hotelId', hotelId);

  // Return the data for the requested
  Hotel
    .findById(hotelId)
    .exec(function(err, doc) {
      var response = {
        status: 200,
        message: doc
      };
      if (err) {
        console.log("Error finding hotel");
        response.status = 500;
        response.message = err;
      }
      else if (!doc) {
        response.status = 404;
        response.message = {
          "message": "Hotel ID not found"
        };
      }

      // Return the response
      res
        .status(response.status)
        .json(response.message);
    });

};

// Controller to add a hotel
module.exports.hotelsAddOne = function(req, res) {

  // Get the database connection
  var db = dbconn.get();
  var collection = db.collection('hotels');
  var newHotel;

  console.log('POST new hotel');

  if (req.body && req.body.name && req.body.stars) {
    newHotel = req.body;
    newHotel.stars = parseInt(req.body.stars, 10);

    collection.insertOne(newHotel, function(err, response) {
      console.log(response.ops);
      res
        .status(201)
        .json(response.ops);
    });

  }
  else
  {
    console.log('Data missing from body');
    res
      .status(400)
      .json({ message: "Required data missing from body"});
  }
};