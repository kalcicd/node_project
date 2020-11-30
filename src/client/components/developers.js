import React from 'react';
import Title from './title';

export default function Developers(props){
	return(
	<div id="app">
		<Title />
		<div id="mainColumn">
			<div id="sectionHeader">Developers</div>
			<p className="mainColumnText">
				Interested in using our data for your own awesome civic tech project?
			</p>
			<p className="mainColumnText">
				Awesome!
			</p>
			<a href="https://mit-license.org/" className="mainColumnText">
				All of our data is available under the open source MIT License - details to be found here
			</a>
			<form action="/download" method="GET" id="downloadForm">
				<div className="selectLabel">Select State:</div>
				<StateSelect class="formSelect" />
				<div className="selectLabel">Select Layer of Government:</div>
				<LevelSelect class="formSelect" />
				<div className="selectLabel">Shapefiles Included:</div>
				<ShapefileSelect class="formSelect" />
				<button type="submit" id="submitButton">Submit</button>
			</form>
		</div>
	</div>
	)
}

export function StateSelect(props){
	const states = ["Oregon"];
	const options = [];
	states.forEach((elem,i)=>{
		options.push(<option value={elem.toLowerCase()} key={i}>{elem}</option>);
	});
	return(
		<select className={props.class} name="state">{options}</select>
	)
}

export function LevelSelect(props){
	const levels = ["State","County","City"];
	const options = [];
	levels.forEach((elem,i)=>{
		options.push(<option value={elem.toLowerCase()} key={i}>{elem}</option>);
	});
	return(
		<select className={props.class} name="level">{options}</select>
	)
}

export function ShapefileSelect(props){
	const shapefiles = ["No","Yes"];
	const options = [];
	shapefiles.forEach((elem,i)=>{
		options.push(<option value={elem.toLowerCase()} key={i}>{elem}</option>);
	});
	return(
		<select className={props.class} name="shapefiles">{options}</select>
	)
}
