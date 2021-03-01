import config from '../../config/default.json'
import { Pool } from 'pg'

const databasePool = new Pool({
  host: config.postgresql.address,
  user: config.postgresql.user,
  password: config.postgresql.pass
})

// Takes a table name, rowId, and an object containing the updates to be made. Constructs and sends an query to update the given fields
const testTable = 'Officeholders'
const testIdFieldName = 'HolderId'
const rowId = '1'
const testUpdates = {
  'Name': 'Jane Doe',
  'ContactEmail': 'test@gmail.com'
}
const updateField = (type, idFieldName, rowId, updates) => new Promise(async (resolve, reject) => {
  let updateStrings = []
  updates.forEach((field, newValue) => updateStrings.push(`${field}= ${newValue}`))
  const queryString = 'UPDATE $1 SET $2 WHERE $3 = $4'
  const response = await databasePool.query(queryString, [type, updateStrings.join(', '), idFieldName, rowId])
  response.catch((err) => {
    reject(err)
  }).then((sqlRes) => {
    resolve(sqlRes)
  })
})

// retrieves all entries from pending data tables to be displayed to verifier
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

export { updateField, getAllPending }