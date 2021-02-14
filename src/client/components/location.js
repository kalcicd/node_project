import React from 'react'
import Title from './title'


export default function Location (props) {
	
	//Import the wms client
	var wmsclient = require("wms-client");
	
	//Create a wms client at server url
	var url = "http://192.168.1.108/cgi-bin/qgis_mapserv.fcgi";
	var wms = wmsclient(url);
	
	//Set Location to query (bbox based on latitude and longitude input)
	var lati = 44.578669;
	var longi = -123.278411;
	var bboxvar = '' + (lati-0.01) + ',' + (longi-0.01) + ',' + (lati+0.01) + ',' + (longi+0.01);
	
	//Set Query Options
	var queryOptions = {
		service: 'WMS',
		version: '1.3.0',
		layers: 'ORStateHouse,ORStateSenate,ORSchoolDistricts,USHouse',
		crs: 'EPSG:4269',
		width: 1024,
		height: 1024,
		bbox: bboxvar,
		map: '/home/qgis/projects/node.qgs'
	}
	var xy = {
		x: 512,
		y: 512
	}	
	
	//Make Feature Info Request
	wms.getFeatureInfo( xy, queryOptions, function( err, response ) {
		//Display error if received
		if ( err ) {
			console.log(err);
		}
		
		//Get array of responses
		var responseList = response['wfs%3afeaturecollection']['gml%3afeaturemember'];
		
		//Set up results object
		var results = {
			USHouse: null,
			StateSenate: null,
			StateHouse: null,
			SchoolDistrict: null};
		
		//Parse response list into results object
		var i,r;
		for(i = 0; i < responseList.length; i++){
			r = responseList[i];
			if(r['qgs%3aushouse']){
				results.USHouse = r['qgs%3aushouse']['qgs%3anamelsad'];
			}
			if(r['qgs%3aorstatesenate']){
				results.StateSenate = r['qgs%3aorstatesenate']['qgs%3anamelsad'];
			}
			if(r['qgs%3aorstatehouse']){
				results.StateHouse = r['qgs%3aorstatehouse']['qgs%3anamelsad'];
			}
			if(r['qgs%3aorschooldistricts']){
				results.SchoolDistrict = r['qgs%3aorschooldistricts']['qgs%3aname'];
			}
		}
		//Debug results
		console.log('GetFeatureInfo:');
		console.log(results);		
	} );
	
  let logged_in = (props.logged_in!=undefined)?props.logged_in:false;
  let is_verifier = (props.is_verifier!=undefined)?props.is_verifier:false;
  return (
    <div id="app">
      <Title logged_in={logged_in} is_verifier={is_verifier}/>
      <div id="mainColumn">
        <div id="searchBarWrapper">
          <a href='/location'>
            <img src="/icons/search.svg" id="searchIcon"/>
          </a>
          <input
            type="text" id="searchBar"
            className="flexGrow"
            placeholder="Enter address for officeholders, contact information, and meetings" />
        </div>
        <div id="resultsTitle">
          <h2>Here Are the Results We Found in Your Area:</h2>
        </div>
        <div id="mapContent">
          <img src="/icons/mapsEmbed.png" id="mapsPhoto"/>
        </div>
      </div>
      <div id='locationResults'>
        <h3>Federal</h3>
        <ul>
          <li>President: Donald Trump</li>
        </ul>
        <h3>State</h3>
        <ul>
          <li>Governor: Kate Brown</li>
        </ul>
        <h3>County</h3>
        <ul>
          <li>County Commissioner: Joe Berney</li>
        </ul>
        <h3>City</h3>
        <ul>
          <li>Mayor: Biff Traber</li>
        </ul>
        <h3>School</h3>
        <ul>
          <li>Superintendent: Ryan Noss</li>
        </ul>
        <h3>Local</h3>
        <ul>
          <li>Utility Board Member: Jane Doe</li>
        </ul>
      </div>
    </div>
  )
}
