import React from 'react'

export default class SearchBar extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <form action='/search' method='GET' id='searchBarWrapper'>
        <button type='submit' id='searchButton'>
          <img src='/icons/search.svg' id='searchIcon' />
        </button>
        <input name='q' type='text' id='searchBar' className='flexGrow'
          placeholder='Search by address' />
      </form>
    )
  }
}
