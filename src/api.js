const axios = require('axios')
const express = require("express");
const cheerio = require("cheerio");
const fs = require("fs-extra");

//API scope validation
const router  = module.exports = express.Router();

/**
 * @api {post} /postalcode/sg/:postCd This API provides postal code details of given postal code.
 * @apiName /postalcode/sg/:postCd
 * @apiGroup /postalcode
 *
 *
 */
router.get("/postalcode/sg/:postCd", function(req, res) {
   let address = {};
   let validInput = true;
   let message = "";
   if (req.params.postCd == undefined || req.params.postCd.trim() == ""){
     validInput = false;
     message = "Postal Code is required";
   } else if (req.params.postCd.trim().length != 6){
     validInput = false;
     message = "Postal Code should have 6 digits";
   }
   if (!validInput){
     console.log("Input params not valid");
     res.status(400).json({"message": message});
     return;
   }
   //Validation Succss
   let postCd = req.params.postCd;
   console.log('Validation Success and Postal Code = ', postCd);
   let mapurl = "https://developers.onemap.sg/commonapi/search?searchVal="+postCd+"&returnGeom=Y&getAddrDetails=Y&pageNum=1";
   axios.get(mapurl).then(resp => {
        console.log(resp.data);
        if(resp.data.results.length > 0) {
          address.Building = resp.data.results[0].SEARCHVAL;
          address.BlockNo = resp.data.results[0].BLK_NO;
          address.RoadName = resp.data.results[0].ROAD_NAME;
          address.Address = resp.data.results[0].ADDRESS;
          address.PostalCode = resp.data.results[0].POSTAL;
          address.Geo_X = resp.data.results[0].X;
          address.Geo_Y = resp.data.results[0].Y;
          address.Latitude = resp.data.results[0].LATITUDE;
          address.Longitude = resp.data.results[0].LONGITUDE;
          res.status(200).json({success: true,"message": address});
          return
        } else {
          res.status(200).json({success: false,"message": "Postal Code not found"});
          return
        }
    }).catch(error => {
        console.log(error);
        res.status(500).json({success: false,"message": "Postal Code not found"});
        return
    });
});

/**
 * @api {post} /postalcode/sg/search This API search singapore postal codes.
 * @apiName postalCode Search
 * @apiGroup api/postalcode/sg/search
 *
 * @apiParam {String} [Block Number]  Block Number
 * @apiParam {String} [Street Name]  Street Name
 *
 */
  router.get("/postalcode/sg/search/:street", async function(req, res) {
    console.log("Searching Singapore postal code...");
    //console.log(JSON.stringify(req.body));
    var validInput = true;
    var message = "";
    //Validations for postal code search
   if (req.params.street == undefined || req.params.street.trim() == ""){
     validInput = false;
     message = "Street is required";
   }
   if (!validInput){
      console.log("Street Name not valid");
      res.status(400).json({success: false,"message": message});
      return;
   }

   let street = req.params.street;
   console.log('Validation Success  = ', street);
   let addressList = [];
   let mapurl = "https://developers.onemap.sg/commonapi/search?searchVal="+street+"&returnGeom=Y&getAddrDetails=Y&pageNum=1";
   axios.get(mapurl).then(resp => {
        console.log(resp.data);
        if(resp.data.results.length > 0) {
	   for(var i=0; i<resp.data.results.length; i++) {
		let address = {};
          	address.Building = resp.data.results[i].SEARCHVAL;
          	address.BlockNo = resp.data.results[i].BLK_NO;
          	address.RoadName = resp.data.results[i].ROAD_NAME;
          	address.Address = resp.data.results[i].ADDRESS;
          	address.PostalCode = resp.data.results[i].POSTAL;
          	address.Geo_X = resp.data.results[i].X;
          	address.Geo_Y = resp.data.results[i].Y;
          	address.Latitude = resp.data.results[i].LATITUDE;
          	address.Longitude = resp.data.results[i].LONGITUDE;
		addressList.push(address);
	   }
          res.status(200).json({success: true,"addressList": addressList});
          return
        } else {
          res.status(500).json({success: false,"message": "Not found"});
          return
        }
    }).catch(error => {
        console.log(error);
        res.status(500).json({success: false,"message": "Not found"});
        return
    });
});



router.get("/countrycodes", async function(req, res) {
    const url = "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3";
	const { data } = await axios.get(url);
	const $ = cheerio.load(data);
	const listItems = $(".plainlist ul li");
	let countries = [];
	listItems.each((idx, el) => {
      	   const country = { name: "", iso3: "" };
      	   country.name = $(el).children("a").text();
      	   country.iso3 = $(el).children("span").text();
      	   countries.push(country);
   	 });
	console.dir(countries);
	res.status(200).json(countries);
   });

