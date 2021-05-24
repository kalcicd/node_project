import wmsclient from 'wms-client'
import config from '../../config/default.json'

// Send request based on lat and lng
const gisLocationQuery = (lat, lng) => new Promise((resolve, reject) => {
  // Import the wms client

  // Create a wms client at server url
  const url = config.gisInfo.url
  const wms = wmsclient(url)
  const parsedLat = parseFloat(lat)
  const parsedLng = parseFloat(lng)

  // Set Location to query (bbox based on latitude and longitude input)
  const bboxvar = `${parsedLat - 0.01},${parsedLng - 0.01},${parsedLat + 0.01},${parsedLng + 0.01}`

  // Set Query Options
  const queryOptions = {
    service: 'WMS',
    version: '1.3.0',
    layers: 'congressionaldistrict,county,elementaryschooldistrict,place,secondaryschooldistrict,state,statehouse,statesenate,unifiedschooldistrict',
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

    // Get array of responses
    const responseList = response['wfs%3afeaturecollection']['gml%3afeaturemember']

    const results = []

    if (responseList != null) {
      // Parse response list into results object
      let i, r
      for (i = 0; i < responseList.length; i++) {
        r = responseList[i]
		//US Congress
        if (r['qgs%3acongressionaldistrict']) {
          results.push(r['qgs%3acongressionaldistrict']['qgs%3ageoid'] + r['qgs%3acongressionaldistrict']['qgs%3anamelsad'])
        }
		//US County
        if (r['qgs%3acounty']) {
          results.push(r['qgs%3acounty']['qgs%3ageoid'] + r['qgs%3acounty']['qgs%3anamelsad'])
        }
		//Cities, Towns, and CDPs
        if (r['qgs%3aplace']) {
          results.push(r['qgs%3aplace']['qgs%3ageoid'] + r['qgs%3aplace']['qgs%3anamelsad'])
        }
		//States
        if (r['qgs%3astate']) {
          results.push(r['qgs%3astate']['qgs%3ageoid'] + r['qgs%3astate']['qgs%3aname'])
        }
		//State House
        if (r['qgs%3astatehouse']) {
          results.push(r['qgs%3astatehouse']['qgs%3ageoid'] + r['qgs%3astatehouse']['qgs%3anamelsad'])
        }
		//State Senate
        if (r['qgs%3astatesenate']) {
          results.push(r['qgs%3astatesenate']['qgs%3ageoid'] + r['qgs%3astatesenate']['qgs%3anamelsad'])
        }
		//School District
        if (r['qgs%3aunifiedschooldistrict']) {
          results.push(r['qgs%3aunifiedschooldistrict']['qgs%3ageoid'] + r['qgs%3aunifiedschooldistrict']['qgs%3aname'])
        }
		//School District 2
        if (r['qgs%3aelementaryschooldistrict']) {
          results.push(r['qgs%3aelementaryschooldistrict']['qgs%3ageoid'] + r['qgs%3aelementaryschooldistrict']['qgs%3aname'])
        }
		//School District 3
        if (r['qgs%3asecondaryschooldistrict']) {
          results.push(r['qgs%3asecondaryschooldistrict']['qgs%3ageoid'] + r['qgs%3asecondaryschooldistrict']['qgs%3aname'])
        }		
      }
      resolve(results)
    } else {
      console.log('No results received from GIS Response')
      resolve(null)
    }
  })
})

export { gisLocationQuery }
