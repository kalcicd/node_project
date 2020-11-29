import fs from 'fs'
import path from 'path'
import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'

import Index from '../client/components/index'
import Title from '../client/components/title'
import Head from '../client/components/head'

const app = express()

app.use(express.static('./src/server/public'));

app.get('/', (req, res) => {
	const page = renderToString(<Index />);
	res.status(200).send(page);
})

// Opens a socket and listens for connections only if there is no parent module running the script.
if (!module.parent) {
	app.listen(8080, () => {
		console.log('Server started on port 8080...')
	})
}

export default app
