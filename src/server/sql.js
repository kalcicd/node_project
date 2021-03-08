import config from '../../config/default.json'
import { Pool } from 'pg'

const databasePool = new Pool({
  host: config.postgresql.address,
  user: config.postgresql.user,
  password: config.postgresql.pass
})

// Takes a type, rowId, and an object containing the updates to be made to a row in a table.
// Constructs and sends an query to update the given fields
const updateField = (type, rowId, updates) => new Promise(async (resolve, reject) => {
  const tableDict = {
    election: {
      idName: 'electionid',
      tableName: 'elections'
    },
    location: {
      idName: 'locationid',
      tableName: 'locations'
    },
    office: {
      idName: 'officeid',
      tableName: 'offices'
    },
    officeholder: {
      idName: 'officeholderid',
      tableName: 'officeholders'
    }
  }
  let updateStrings = []
  updates.forEach((field, newValue) => updateStrings.push(`${field}= ${newValue}`))
  const queryString = 'UPDATE $1 SET $2 WHERE $3 = $4'
  const response = await databasePool.query(
    queryString, [tableDict[type].tableName, updateStrings.join(', '), tableDict[type].idName, rowId]
  ).catch((err) => reject(err))
  console.log(response)
  resolve(response)
})

// Retrieves all entries from pending data tables to be displayed to verifier
const getAllPending = () => new Promise(async (resolve, reject) => {
  let allPending = []
  const pendingElection = await databasePool.query('SELECT * FROM pendingelectionchanges').catch((err) => reject(err))
  if (pendingElection.rows !== undefined) {
    pendingElection.rows.forEach((row) => {
      row.type = 'election'
      allPending.push(row)
    })
  }
  const pendingLocation = await databasePool.query('SELECT * FROM pendinglocationchanges').catch(err => reject(err))
  if (pendingLocation.rows !== undefined) {
    pendingElection.rows.forEach((row) => {
      row.type = 'location'
      allPending.push(row)
    })
  }
  const pendingOffice = await databasePool.query('SELECT * FROM pendingofficechanges').catch(err => reject(err))
  if (pendingOffice.rows !== undefined) {
    pendingOffice.rows.forEach((row) => {
      row.type = 'office'
      allPending.push(row)
    })
  }
  const pendingOfficeholder = await databasePool.query('SELECT * FROM pendingofficeholderchanges').catch(err => reject(err))
  if (pendingOfficeholder.rows !== undefined) {
    pendingOfficeholder.rows.forEach((row) => {
      row.type = 'officeholder'
      allPending.push(row)
    })
  }
  console.log(allPending)
  resolve(allPending)
})

const getLocationProps = (gisResponse) => new Promise(async (resolve, reject) => {
	
	
	var locationList = []
	
  //Format Query
  const queryString = 'SELECT a.gisidentifier, b.officetitle, c.name, c.holderid, d.levelnum'
	+  ' FROM Locations a, Offices b, OfficeHolders c, LocationTypes d'
	+  ' WHERE a.gisidentifier = ANY ($1) AND a.locationid = b.locationid AND b.currentholder = c.holderid AND a.typeid = d.typeid';
  var response = String(gisResponse);
  let gisIdentifiers = response.split(',');
  console.log(gisIdentifiers);
  
  //Send Query
  await databasePool.query('SELECT * FROM pendingelectionchanges').catch((err) => reject(err))
  const locationRes = await databasePool.query(queryString, [gisIdentifiers]).catch((err) => {
    console.error(err)
	reject(err)
  })
  
  //make location list
   if(locationRes.rows != undefined){
	  console.log("Location Res Name: " + JSON.stringify(locationRes.rows))
	  
	   
	  locationList = locationRes.rows
	  
	  locationList.push({
		  name: "Joe Biden",
		  holderid: "0114",
		  officetitle: "President",
		  levelnum: 0
	  });
	  console.log(locationList)
	  resolve(locationList)
   }
   resolve(locationList)
  
})

const getOfficeholderData = (queryId) => new Promise(async (resolve, reject) => {

  const queryString = 'SELECT * FROM OfficeHolders a, Offices b WHERE a.holderid=$1 AND a.holderid=b.currentholder';  
  const officeRes = await databasePool.query(queryString, [queryId]).catch((err) => {
    console.error(err)
    return res.status(500).send('A server error occurred, please try again')
  })
  console.log(JSON.stringify(officeRes.rows));
  
  
  
  // todo: query db with officeholder id to get officeholderProps. An example response from the db is hardcoded below
  var officeholderVar = {
    officeTitle: 'Lane County Commissioner',
    officeholderName: 'Joe Berney',
    termStart: 'January 2019',
    termEnd: 'May 2022',
    nextElectionDate: 'May 2022',
    phone: '541-746-2583',
    email: 'joe.berney@lanecounty-or.gov',
    meetings: 'Every Monday at 9am at Lance county Courthouse, Eugene, Oregon'
  }
  
  if(officeRes.rows != null && officeRes.rows[0] != null){
	var sourceInfo = officeRes.rows[0]
	officeholderVar.officeTitle = sourceInfo.officetitle
	officeholderVar.officeholderName = sourceInfo.name
	officeholderVar.termStart = String(sourceInfo.termstart)
	officeholderVar.termEnd = String(sourceInfo.termend)
	officeholderVar.nextElectionDate = String(sourceInfo.termend)
	officeholderVar.phone = sourceInfo.contactphone
	officeholderVar.email = sourceInfo.contactemail
	officeholderVar.meetings = sourceInfo.contactmeeting
  } 
  
  resolve(officeholderVar);
  
})









export { updateField, getAllPending, getLocationProps, getOfficeholderData }
