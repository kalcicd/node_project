import wmsclient from 'wms-client'
import config from '../../config/default.json'

// Send request based on lat and lng
const gisLocationQuery = (lat, lng) => new Promise((resolve, reject) => {
  // Import the wms client

  // Create a wms client at server url
  const wms = wmsclient(config.gis.clientUrl)
  const parsedLat = parseFloat(lat)
  const parsedLng = parseFloat(lng)

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
    console.log('RESPONSE: ', response)

    // Get array of responses
    const responseList = response['wfs%3afeaturecollection']['gml%3afeaturemember']

    // Set up results object
    const results = {
      USHouse: null,
      StateSenate: null,
      StateHouse: null,
      SchoolDistrict: null
    }

    // Parse response list into results object
    let i, r
    for (i = 0; i < responseList.length; i++) {
      r = responseList[i]
      if (r['qgs%3aushouse']) {
        results.USHouse = r['qgs%3aushouse']['qgs%3anamelsad']
      }
      if (r['qgs%3aorstatesenate']) {
        results.StateSenate = r['qgs%3aorstatesenate']['qgs%3anamelsad']
      }
      if (r['qgs%3aorstatehouse']) {
        results.StateHouse = r['qgs%3aorstatehouse']['qgs%3anamelsad']
      }
      if (r['qgs%3aorschooldistricts']) {
        results.SchoolDistrict = r['qgs%3aorschooldistricts']['qgs%3aname']
      }
    }
    resolve(results)
  })
})

export { gisLocationQuery }
