import React from 'react'
import Title from './title'

export default function Volunteer(props){
	return (
		<div id="app">
			<Title />
			<div id="mainColumn">
				<div id="sectionHeader">Volunteer Sign Up</div>
				<form action="/signup" method="POST" id="signUpForm">
					<div className="formInputRow">
						<label for="nameInput" className="formLabel">Name:</label>
						<input type="text" id="nameInput" className="formInput"></input>
					</div>
					<div className="formInputRow">
						<label for="" className="formLabel">Email:</label>
						<input type="text" id="" className="formInput"></input>
					</div>
					<div className="formInputRow">
						<label for="" className="formLabel">Phone:</label>
						<input type="text" id="" className="formInput"></input>
					</div>
					<div className="formInputRow">
						<label for="" className="formLabel">Zip code:</label>
						<input type="text" id="" className="formInput"></input>
					</div>
					<div className="formInputRow">
						<label for="" className="formLabel">
							What state/city are you interested in helping us crowdsource?
						</label>
						<input type="text" id="" className="formInput"></input>
					</div>
					<div className="formInputRow">
						<label for="" className="formLabel">
							Did we miss an elected position in your community?
						</label>
						<input type="text" id="" className="formInput"></input>
					</div>
				</form>
			</div>
		</div>
	)
}
