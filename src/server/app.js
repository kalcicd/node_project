import fs from 'fs'
import path from 'path'
import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'

import Index from '../client/components/index'
import AboutUs from '../client/components/aboutus'
import Volunteer from '../client/components/volunteer'
import Developers from '../client/components/developers'
import Error404 from '../client/components/404'

const pathToTemplate = path.join(__dirname,'./views/layout.html');
const template = fs.readFileSync(pathToTemplate,'utf8');

const app = express();

app.use(express.static('./src/server/public'));

app.get('/', (req, res, next) => {
	const renderedContent = renderToString(<Index />);
	let page = template.replace("<!-- CONTENT -->",renderedContent);
	page = page.replace("<!-- STYLESHEET -->","/css/index.css");
	res.status(200).send(page);
});
app.get('/about', (req, res, next) => {
	const renderedContent = renderToString(<AboutUs />);
	let page = template.replace("<!-- CONTENT -->",renderedContent);
	page = page.replace("<!-- STYLESHEET -->","/css/aboutus.css");
	res.status(200).send(page);
});
app.get('/volunteer', (req, res, next) => {
	const renderedContent = renderToString(<Volunteer />);
	let page = template.replace("<!-- CONTENT -->",renderedContent);
	page = page.replace("<!-- STYLESHEET -->","/css/volunteer.css");
	res.status(200).send(page);
});
app.get('/developers', (req, res, next) => {
	const renderedContent = renderToString(<Developers />);
	let page = template.replace("<!-- CONTENT -->",renderedContent);
	page = page.replace("<!-- STYLESHEET -->","/css/developers.css");
	res.status(200).send(page);
});

//404 error handling
app.use(function(req,res,next){
	const renderedContent = renderToString(<Error404 />);
	let page = template.replace("<!-- CONTENT -->",renderedContent);
	page = page.replace("<!-- STYLESHEET -->","/css/404.css");
	res.status(404).send(page);
});
// Opens a socket and listens for connections only if there is no parent module running the script.
if (!module.parent) {
	app.listen(8080, () => {
		console.log('Server started on port 8080...')
	})
}

export default app
