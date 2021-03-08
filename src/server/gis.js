import wmsclient from 'wms-client'
import config from '../../config/default.json'

// Send request based on lat and lng
const gisLocationQuery = (lat, lng) => new Promise((resolve, reject) => {
  // Import the wms client

  // Create a wms client at server url
  const url = "http://73.11.11.122/cgi-bin/qgis_mapserv.fcgi";
  console.log("clientUrl: " + url);
  const wms = wmsclient(url);
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  // Set Location to query (bbox based on latitude and longitude input)
  const bboxvar = `${parsedLat - 0.01},${parsedLng - 0.01},${parsedLat + 0.01},${parsedLng + 0.01}`

  // Set Query Options
  const queryOptions = {
    service: 'WMS',
    version: '1.3.0',
    layers: 'ORStateHouse,ORStateSenate,ORSchoolDistricts,USHouse',
    crs: 'EPSG:4269',
    width: 1024,
    height: 1024,
    bbox: bboxvar,
    map: '/home/qgis/projects/node.qgs'
  }
  const xy = {
    x: 512,
    y: 512
  }

  // Make Feature Info Request
  wms.getFeatureInfo(xy, queryOptions, (err, response) => {
    // Display error if received
    if (err) {
      reject(err)
      return
    }
    //console.log('RESPONSE: ', response)

    // Get array of responses
    const responseList = response['wfs%3afeaturecollection']['gml%3afeaturemember']
	
	console.log('ResponseList: ' + responseList);
	
	var results = []
	
	if(responseList != null){

		// Parse response list into results object
		let i, r
		for (i = 0; i < responseList.length; i++) {
		  r = responseList[i]
		  if (r['qgs%3aushouse']) {
			results.push(r['qgs%3aushouse']['qgs%3ageoid']+r['qgs%3aushouse']['qgs%3anamelsad'])
		  }
		  if (r['qgs%3aorstatesenate']) {
			results.push(r['qgs%3aorstatesenate']['qgs%3ageoid']+r['qgs%3aorstatesenate']['qgs%3anamelsad'])
		  }
		  if (r['qgs%3aorstatehouse']) {
			results.push(r['qgs%3aorstatehouse']['qgs%3ageoid']+r['qgs%3aorstatehouse']['qgs%3anamelsad'])
		  }
		  if (r['qgs%3aorschooldistricts']) {
			results.push(r['qgs%3aorschooldistricts']['qgs%3ageoid']+r['qgs%3aorschooldistricts']['qgs%3aname'])
		  }
		}
		resolve(results)
	} else {
		console.log("No results received from GIS Response")
		resolve(null)
	}
  })
})

export { gisLocationQuery }
