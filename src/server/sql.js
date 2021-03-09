import config from '../../config/default.json'
import { Pool } from 'pg'

const databasePool = new Pool({
  host: config.postgresql.address,
  user: config.postgresql.user,
  password: config.postgresql.pass
})

const tableDict = {
  election: {
    idName: 'electionid',
    tableName: 'elections',
    pendingIdName: 'electionchangeid',
    pendingTableName: 'pendingelectionchanges'
  },
  location: {
    idName: 'locationid',
    tableName: 'locations',
    pendingIdName: 'locationchangeid',
    pendingTableName: 'pendinglocationchanges'
  },
  office: {
    idName: 'officeid',
    tableName: 'offices',
    pendingIdName: 'officechangeid',
    pendingTableName: 'pendingofficechanges'
  },
  officeholder: {
    idName: 'holderid',
    tableName: 'officeholders',
    pendingIdName: 'officeholderchangeid',
    pendingTableName: 'pendingofficeholderchanges'
  }
}

const getFormattedUpdates = (row, type) => {
  const updateList = []
  if (type === 'election') {
    if (row['newdate'] !== null) {
      updateList.push(['datetime', row['datetime'], row['newdate']])
    }
    // this may result in a failure to update if new locationid does not already exist
    if (row['newLocation'] !== null) {
      updateList.push(['location', row['location'], row['newlocation']])
    }
  } else if (type === 'location') {
    if (row['newname'] !== null) {
      updateList.push(['name', row['name'], row['newname']])
    }
  } else if (type === 'office') {
    if (row['newlocationid'] !== null) {
      updateList.push(['locationid', row['locationid'], row['newlocationid']])
    }
    if (row['newholder'] !== null) {
      updateList.push(['currentholder', row['currentholder'], row['newholder']])
    }
    if (row['newnextelection'] !== null) {
      updateList.push(['nextelection', row['nextelection'], row['newnextelection']])
    }
    if (row['newtitle'] !== null) {
      updateList.push(['officetitle', row['officetitle'], row['newtitle']])
    }
    if (row['newtermstart'] !== null) {
      updateList.push(['termstart', row['termstart'], row['newtermstart']])
    }
    if (row['newtermend'] !== null) {
      updateList.push(['termend', row['termend'], row['newtermend']])
    }
  } else if (type === 'officeholder') {
    if (row['newname'] !== null) {
      updateList.push(['name', row['name'], row['newname']])
    }
    if (row['newphone'] !== null) {
      updateList.push(['contactphone', row['contactphone'], row['newphone']])
    }
    if (row['newemail'] !== null) {
      updateList.push(['contactemail', row['contactemail'], row['newemail']])
    }
    if (row['newmeeting'] !== null) {
      updateList.push(['contactmeeting', row['contactmeeting'], row['newmeeting']])
    }
    if (row['newsitelink'] !== null) {
      updateList.push(['sitelink', row['sitelink'], row['newsitelink']])
    }
  }
  return updateList
}

const getTitle = (row, type) => {
  if (type === 'location') {
    return row['locationName']
  }
  if (type === 'election') {
    return `Election id: ${row[tableDict[type].idName]}`
  }
  if (type === 'office') {
    return row['officetitle']
  }
  if (type === 'officeholder') {
    return row['name']
  }
}

// Takes a type, rowId, and an object containing the updates to be made to a row in a table.
// Constructs and sends an query to update the given fields
const updateField = (type, rowId, updates) => new Promise(async (resolve, reject) => {
  let updateStrings = []
  updates.forEach((field, newValue) => updateStrings.push(`${field}= ${newValue}`))
  const queryString = 'UPDATE $1 SET $2 WHERE $3 = $4'
  const response = await databasePool.query(
    queryString, [tableDict[type].tableName, updateStrings.join(', '), tableDict[type].idName, rowId]
  ).catch((err) => reject(err))
  resolve(response)
})

// Retrieves all entries from pending data tables to be displayed to verifier
const getPendingChanges = () => new Promise(async (resolve, reject) => {
  const allPending = []
  for (const type of Object.keys(tableDict)) {
    const { idName, tableName, pendingIdName, pendingTableName } = tableDict[type]
    const query = `SELECT * FROM ${tableName} as a JOIN ${pendingTableName} as b ON a.${idName} = b.${pendingIdName}`
    const { rows } = await databasePool.query(query).catch((err) => {
      reject(err)
    })

    for (const row of rows) {
      allPending.push({
        'title': getTitle(row, type),
        'type': type,
        'id': row[tableDict[type].idName],
        'reference': row['referencelink'],
        'updates': getFormattedUpdates(row, type)
      })
    }
  }
  resolve(allPending)
})

const getLocationProps = (gisResponse) => new Promise(async (resolve, reject) => {
  let locationList = []

  // Format Query
  const queryString = 'SELECT a.gisidentifier, b.officetitle, c.name, c.holderid, d.levelnum' +
    ' FROM Locations a, Offices b, OfficeHolders c, LocationTypes d' +
    ' WHERE a.gisidentifier = ANY ($1) AND a.locationid = b.locationid AND b.currentholder = c.holderid AND a.typeid = d.typeid'
  const response = String(gisResponse)
  let gisIdentifiers = response.split(',')

  // Send Query
  await databasePool.query('SELECT * FROM pendingelectionchanges').catch((err) => reject(err))
  const locationRes = await databasePool.query(queryString, [gisIdentifiers]).catch((err) => {
    console.error(err)
    reject(err)
  })

  // make location list
  if (locationRes['rows'] !== undefined) {
    locationList = locationRes['rows']

    locationList.push({
      name: 'Joe Biden',
      holderid: '0114',
      officetitle: 'President',
      levelnum: 0
    })
    resolve(locationList)
  }
  resolve(locationList)
})

const getOfficeholderData = (queryId) => new Promise(async (resolve, reject) => {
  const queryString = 'SELECT * FROM OfficeHolders a, Offices b WHERE a.holderid=$1 AND a.holderid=b.currentholder'
  const officeRes = await databasePool.query(queryString, [queryId]).catch((err) => {
    reject(err)
  })

  // todo: query db with officeholder id to get officeholderProps. An example response from the db is hardcoded below
  const officeholderVar = {
    officeTitle: 'Lane County Commissioner',
    officeholderName: 'Joe Berney',
    termStart: 'January 2019',
    termEnd: 'May 2022',
    nextElectionDate: 'May 2022',
    phone: '541-746-2583',
    email: 'joe.berney@lanecounty-or.gov',
    meetings: 'Every Monday at 9am at Lance county Courthouse, Eugene, Oregon'
  }

  if (officeRes['rows'] != null && officeRes['rows'][0] != null) {
    const sourceInfo = officeRes['rows'][0]
    officeholderVar.officeTitle = sourceInfo.officetitle
    officeholderVar.officeholderName = sourceInfo['name']
    officeholderVar.termStart = String(sourceInfo['termstart'])
    officeholderVar.termEnd = String(sourceInfo['termend'])
    officeholderVar.nextElectionDate = String(sourceInfo['termend'])
    officeholderVar.phone = sourceInfo['contactphone']
    officeholderVar.email = sourceInfo['contactemail']
    officeholderVar.meetings = sourceInfo['contactmeeting']
  }

  resolve(officeholderVar)
})

export { updateField, getPendingChanges, getLocationProps, getOfficeholderData }
