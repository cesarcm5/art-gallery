'use client'
import React, { useState, useEffect } from 'react';
import Header from "./header/page"
import data from "../../starter-code/data.json"; // Import the JSON data

function App() {
  const [paintings, setPaintings] = useState(data); // Set the data to state

  return (
    <main className="">
      <Header/>
      <div id='gallery' className=' columns-1  md:columns-3  lg:columns-4 mt-10'>
        {paintings.map((painting, index) => (
          <div id="art" key={index} className="mb-5 relative ms-2">
            <img id='portrait' src={painting.images.thumbnail} alt={painting.name} className=' object-cover' />
            <div id='gradient-overlay' className="absolute bg-black inset-0 mask-t-from-1"></div>
            <div className="absolute bottom-0 text-white mb-5 ms-5 ">
                <p className="text-left text-xl font-bold italic">{painting.name}</p>
                <p className='text-left text-md'>{painting.artist.name}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;