import config from '../../config/default.json'
import { Pool } from 'pg'

const databasePool = new Pool({
  host: config.postgresql.address,
  user: config.postgresql.user,
  password: config.postgresql.pass
})

const escapeSql = (str) => {
  // todo: cover other cases
  let escapedStr = str.replace('\'', '\'\'')
  escapedStr = '\'' + escapedStr + '\''
  return escapedStr
}

const tableDict = {
  election: {
    idName: 'electionid',
    tableName: 'elections',
    pendingIdName: 'electionchangeid',
    pendingTableName: 'pendingelectionchanges',
    updatableFields: ['newlocation', 'newdate']
  },
  location: {
    idName: 'locationid',
    tableName: 'locations',
    pendingIdName: 'locationchangeid',
    pendingTableName: 'pendinglocationchanges',
    updatableFields: ['newname']
  },
  office: {
    idName: 'officeid',
    tableName: 'offices',
    pendingIdName: 'officechangeid',
    pendingTableName: 'pendingofficechanges',
    updatableFields: ['newlocationid', 'newholder', 'newnextelection', 'newtitle', 'newtermstart', 'newtermend']
  },
  officeholder: {
    idName: 'holderid',
    tableName: 'officeholders',
    pendingIdName: 'officeholderchangeid',
    pendingTableName: 'pendingofficeholderchanges',
    updatableFields: ['newname', 'newphone', 'newemail', 'newmeeting', 'newsitelink']
  }
}

const addPendingData = (type, username, referenceLink, referenceId, updateChanges) => new Promise(async (resolve, reject) => {
  /* Pushes a new data change request to the appropriate pending database tables */
  const schema = tableDict[type]
  const updateKeys = Object.keys(updateChanges)
  const quotedValues = []

  updateKeys.forEach((key) => {
    if (schema === undefined || schema.updatableFields === undefined) {
      reject(Error('Could not find the schema for the table'))
      return
    }
    if (!schema.updatableFields.includes(key)) {
      reject(Error(`Field '${key}' is not in the schema`))
      return
    }
    quotedValues.push(`'${updateChanges[key]}'`)
  })
  let idField = "'" + referenceId + "'"
  if (referenceId === null || referenceId === '') idField = 'null'
  const query = 'INSERT INTO ' + schema.pendingTableName +
               '(username, referencelink, ' + schema.idName + ', ' + updateKeys.join(', ') + ') ' +
               "VALUES ('" + username + "', '" + referenceLink + "', " + idField + ', ' + quotedValues.join(', ') + ')'
  console.log('QUERY: ', query)
  const response = await databasePool.query(query).catch((err) => reject(err))
  console.log('RESPONSE: ', response)
  resolve(response)
})

const getFormattedUpdates = (row, type) => {
  /* Takes a row from a database query and the type of update it is associated with and returns an
  array of updates in proper formatting for the frontend */
  const updateList = []
  function formatDate (obj) {
    if (typeof (obj) === 'object' && obj !== null && obj.toDateString !== undefined) {
      return obj.toDateString()
    } else return String(obj)
  }
  if (type === 'election') {
    if (row['newdate'] !== null) {
      updateList.push(['datetime', formatDate(row['datetime']), formatDate(row['newdate'])])
    }
    // this may result in a failure to update if new locationid does not already exist
    if (row['newLocation'] !== null) {
      updateList.push(['location', row['location'], row['newlocation']])
    }
  } else if (type === 'location') {
    if (row['newname'] !== null) {
      updateList.push(['name', row['locationname'], row['newname']])
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
      updateList.push(['termstart', formatDate(row['termstart']), formatDate(row['newtermstart'])])
    }
    if (row['newtermend'] !== null) {
      updateList.push(['termend', formatDate(row['termend']), formatDate(row['newtermend'])])
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
  /* Takes a row from a database query and the type of query it is and returns a title to be
  displayed on the verifier interface */
  if (type === 'location') {
    return (row['locationid'] !== null) ? row['locationname'] : row['newname']
  }
  if (type === 'election') {
    return (row['electionid'] !== null) ? `Election id: ${row['electionid']}` : 'New Election'
  }
  if (type === 'office') {
    return (row['officeid'] !== null) ? row['officetitle'] : row['newtitle']
  }
  if (type === 'officeholder') {
    return (row['holderid']) ? row['name'] : row['newname']
  }
}

const updateField = (type, rowId, updates) => new Promise(async (resolve, reject) => {
  /* Takes a type, rowId, and an object containing the updates to be made to a row in a table.
   Constructs and sends an query to update the given fields */
  const schema = tableDict[type]
  let queryString
  if (rowId === 'null') {
    // Create a new entry instead of modifying an existing one
    let updateFields = []
    let updateValues = []
    updates.forEach((elem) => {
      updateFields.push(elem[0])
      updateValues.push(escapeSql(elem[1]))
    })
    queryString = `INSERT INTO ${schema.tableName} (${updateFields.join(',')}) VALUES (${updateValues.join(',')})`
  } else {
    // Modify an exsiting entry
    let updateStrings = []
    updates.forEach((elem) => {
      let fieldName = elem[0]
      let value = escapeSql(elem[1])
      updateStrings.push(`${fieldName} = ${value}`)
    })
    queryString = `UPDATE ${schema.tableName} SET ${updateStrings.join(',')} WHERE ${schema.idName} = ${rowId}`
  }
  console.log('QUERY:', queryString)
  const response = await databasePool.query(queryString).catch((err) => reject(err))
  console.log('RESPONSE:', response)
  resolve(response)
})

const getPendingChanges = () => new Promise(async (resolve, reject) => {
  /* Retrieves all entries from pending data tables to be displayed to verifier */
  const allPending = []
  for (const type of Object.keys(tableDict)) {
    const { idName, tableName, pendingIdName, pendingTableName } = tableDict[type]
    const query = `SELECT * FROM ${tableName} AS a RIGHT JOIN ${pendingTableName} AS b ON a.${idName} = b.${idName}`
    const { rows } = await databasePool.query(query).catch((err) => {
      reject(err)
    })

    // format queried data into the correct structure for the frontend
    for (const row of rows) {
      allPending.push({
        'title': getTitle(row, type),
        'type': type,
        'id': type + '_' + row[pendingIdName],
        'isNew': row[idName] === null,
        'reference': row['referencelink'],
        'updates': getFormattedUpdates(row, type),
        'updateTarget': row[idName],
        'user': row['username']
      })
    }
  }
  resolve(allPending)
})

const updateData = (updateIdStr, updateTarget, updateChanges) => new Promise(async (resolve, reject) => {
  /* Updates data or creates new entry based on the updateIdStr and deletes the pending entry from
  the database */
  // todo: error handling
  let updateType = updateIdStr.split('_')[0]
  let updateChangesArr = updateChanges.split(',').map(elem => elem.split(':'))
  await updateField(updateType, updateTarget, updateChangesArr).catch((err) => { reject(err) })

  await deletePendingData(updateIdStr).catch((err) => { reject(err) })
  resolve(null)
})

const deletePendingData = (updateIdStr) => new Promise(async (resolve, reject) => {
  /* Deletes a pending data row from the database */
  // extract the id and type from the given string
  let type = updateIdStr.split('_')[0]
  let id = updateIdStr.split('_')[1]
  // get table and id column names
  const { pendingTableName, pendingIdName } = tableDict[type]
  // todo: check for errors before sending query
  // send delete request
  let deleteQuery = `DELETE FROM ${pendingTableName} WHERE ${pendingIdName} = ${id}`
  const result = await databasePool.query(deleteQuery).catch((err) => { reject(err) })
  resolve(result)
})

const getLocationProps = (gisResponse) => new Promise(async (resolve, reject) => {
  let locationList = []

  // Format Query
  const queryString = 'SELECT a.gisidentifier, a.locationname, a.locationid, b.officetitle, c.name, c.holderid, d.levelnum' +
    ' FROM Locations a' +
    ' JOIN Offices b ON a.locationid=b.locationid' +
    ' JOIN LocationTypes d ON a.typeid=d.typeid' +
    ' LEFT JOIN OfficeHolders c ON b.currentholder=c.holderid' +
    ' WHERE a.gisidentifier = ANY ($1)'
  const response = String(gisResponse)
  let gisIdentifiers = response.split(',')
  gisIdentifiers.push('USA') // add federal level results (mainly the president)

  // Send Query
  console.log('QUERY:', queryString)
  const locationRes = await databasePool.query(queryString, [gisIdentifiers]).catch((err) => {
    console.error(err)
    reject(err)
  })
  console.log('RESULT:', locationRes)

  // make location list
  if (locationRes['rows'] !== undefined) {
    locationList = locationRes['rows']
    resolve(locationList)
  }
  resolve(locationList)
})

const getOfficeholderData = (queryId) => new Promise(async (resolve, reject) => {
  const queryString = 'SELECT * FROM OfficeHolders a, Offices b WHERE a.holderid=$1 AND a.holderid=b.currentholder'
  const officeRes = await databasePool.query(queryString, [queryId]).catch((err) => {
    reject(err)
  })

  function formatDate (date) {
    // Formats the date objects for termStart and termEnd into human-readable format
    if (date !== null && date !== undefined && date.toDateString !== undefined) {
      return date.toDateString()
    }
    return null
  }

  let officeholderVar = null
  if (officeRes['rows'] !== undefined && officeRes['rows'][0] !== undefined) {
    officeholderVar = {}
    let sourceInfo = officeRes['rows']
    officeholderVar.officeholderName = sourceInfo[0]['name']
    officeholderVar.phone = sourceInfo[0]['contactphone']
    officeholderVar.email = sourceInfo[0]['contactemail']
    officeholderVar.meetings = sourceInfo[0]['contactmeeting']
    officeholderVar.holderId = sourceInfo[0]['holderid']
    officeholderVar.offices = []
    for (let i = 0; i < sourceInfo.length; i++) {
      let newOffice = {}
      newOffice.termStart = formatDate(sourceInfo[i]['termstart'])
      newOffice.termEnd = formatDate(sourceInfo[i]['termend'])
      newOffice.nextElection = sourceInfo[i]['nextelection']
      newOffice.officeTitle = sourceInfo[i].officetitle
      newOffice.officeId = sourceInfo[i].officeid
      officeholderVar.offices.push(newOffice)
    }
  }

  resolve(officeholderVar)
})

export {
  updateField,
  getPendingChanges,
  getLocationProps,
  getOfficeholderData,
  updateData,
  deletePendingData,
  addPendingData
}
