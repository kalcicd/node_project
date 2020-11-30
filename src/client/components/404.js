import React from 'react'
import Title from './title'

export default function Error404(props){
	return (
		<div id="app">
			<Title />
			<div id="mainColumn">
				<div id="errorBox">
					<div id="errorTitle">404 Error</div>
					<div id="errorMessage">
						The requested page could not be found
					</div>
				</div>
			</div>
		</div>
	)
}
