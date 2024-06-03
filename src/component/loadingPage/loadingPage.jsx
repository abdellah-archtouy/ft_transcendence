import React from 'react'
import da2ira from './da2ira.svg'
import moraba3 from './moraba3.svg'
import x from './x.svg'
import motalat from './motalat.svg'
import './loadingPage.css'

const loadingPage = () => {
  return (
    <div className="LoadingPagecontent">
      <div className='ashkal'>
        <div className="first">
          <img src={moraba3} alt="" className='moraba3' />
        </div>
        <div className="second">
          <img src={x} alt="" className='x' />
        </div>
        <div className="third">
          <img src={motalat} alt="" className='motalat' />
        </div>
        <div className="fourth">
          <img src={da2ira} alt="" className='da2ira' />
        </div>
      </div>
      <span>Loading...</span>
    </div>
  )
}

export default loadingPage
