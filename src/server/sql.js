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
  console.log(response)
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

export { updateField, getPendingChanges }
