import React from 'react'

export default function Head(props){
	return(
		<head>
			<meta charSet="UTF-8"></meta>
			<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no"></meta>
			<title>NODE Project</title>
			<link rel="stylesheet" href={props.stylesheet}></link>
			<link rel="stylesheet" href="/css/layout.css"></link>
		</head>
	)
}
