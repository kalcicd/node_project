import config from '../../config/default.json'
import { Pool } from 'pg'

const databasePool = new Pool({
  host: config.postgresql.address,
  user: config.postgresql.user,
  password: config.postgresql.pass
});

function escapeSql(str){
  //todo: cover other cases
  let escapedStr = str.replace("'","''");
  escapedStr = "'" + escapedStr + "'";
  return escapedStr;
}

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
  /* Takes a row from a database query and the type of update it is associated with and returns an
  array of updates in proper formatting for the frontend */
  const updateList = []
  if (type === 'election') {
    if (row['newdate'] !== null) {
      updateList.push(['datetime', String(row['datetime']), String(row['newdate'])])
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
  return updateList;
}

const getTitle = (row, type) => {
  /* Takes a row from a database query and the type of query it is and returns a title to be
  displayed on the verifier interface */
  if (type === 'location') {
    return (row['locationid']!==null)?row['locationname']:row['newname'];
  }
  if (type === 'election') {
    return (row['electionid']!==null)?`Election id: ${row.electionid}`:'New Election';
  }
  if (type === 'office') {
    return (row['officeid']!==null)?row['officetitle']:row['newtitle'];
  }
  if (type === 'officeholder') {
    return (row['holderid'])?row['name']:row['newname'];
  }
}

const updateField = (type, rowId, updates) => new Promise(async (resolve, reject) => {
  /* Takes a type, rowId, and an object containing the updates to be made to a row in a table.
   Constructs and sends an query to update the given fields */
  let updateStrings = [];
  updates.forEach((elem) => {
    let fieldName = elem[0];
	 let value = escapeSql(elem[1]);
    updateStrings.push(`${fieldName} = ${value}`);
  });
  const queryString = `UPDATE ${tableDict[type].tableName} SET ${updateStrings.join(',')} WHERE ${tableDict[type].idName} = ${rowId}`;
  const response = await databasePool.query(queryString).catch((err) => reject(err));
  console.log(response);
  resolve(response);
});

const getPendingChanges = () => new Promise(async (resolve, reject) => {
  /* Retrieves all entries from pending data tables to be displayed to verifier */
  const allPending = []
  for (const type of Object.keys(tableDict)) {
    const { idName, tableName, pendingIdName, pendingTableName } = tableDict[type]
    const query = `SELECT * FROM ${tableName} AS a JOIN ${pendingTableName} AS b ON a.${idName} = b.${idName}`;
    const { rows } = await databasePool.query(query).catch((err) => {
      reject(err);
    });

    //format queried data into the correct structure for the frontend
    for (const row of rows) {
      allPending.push({
        'title': getTitle(row, type),
        'type': type,
        'id': type + "_" + row[tableDict[type]['pendingIdName']],
        'isNew': row[tableDict[type]['idName']]===null,
        'reference': row['referencelink'],
        'updates': getFormattedUpdates(row, type),
        'updateTarget': row[tableDict[type]['idName']]
      });
    }
  }
  resolve(allPending);
});

const updateData = (updateIdStr, updateTarget, updateChanges) => new Promise(async (resolve, reject) => {
  /* Updates data or creates new entry based on the updateIdStr and deletes the pending entry from
  the database*/
  //todo: error handling
  let updateType = updateIdStr.split("_")[0];
  let updateChangesArr = updateChanges.split(",").map(elem => elem.split(":"));
  await updateField(updateType, updateTarget, updateChangesArr).catch((err)=>{reject(err)});;
  await deletePendingData(updateIdStr).catch((err)=>{reject(err)});
  resolve(null);
});

const deletePendingData = (updateIdStr) => new Promise(async (resolve, reject) => {
  /* Deletes a pending data row from the database */
  //extact the id and type from the given string
  let type = updateIdStr.split("_")[0];
  let id = updateIdStr.split("_")[1];
  //get table and id column names
  let tableName = tableDict[type]["pendingTableName"];
  let idField = tableDict[type]["pendingIdName"];
  //todo: check for errors before sending query
  //send delete request
  //let deleteQuery = `DELETE FROM ${tableName} WHERE ${idField} = ${id}`;
  let deleteQuery = "SLEEct * FORM table";
  const result = await databasePool.query(deleteQuery).catch((err)=>{reject(err)});
  resolve(result);
});

export { updateField, getPendingChanges, updateData, deletePendingData }
