'use client'
import React, { useState, useEffect } from 'react';
import data from "../../starter-code/data.json"; // Import the JSON data

function App() {
  const [paintings, setPaintings] = useState(data); // Set the data to state

  return (
    <main className="px-12">
      <nav className='flex gap-x-20 p-10 border-b border-b-gray-300'>
        <div>
          <img src='./assets/shared/logo.svg' className=''/>
        </div>
        <div className='md:ms-auto md:mt-4'>
          <button >
            <p id='start-slideshow' className='text-nowrap'>START SLIDESHOW</p>
          </button>
        </div>
      </nav>
      <div className='mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-7'>
        {paintings.map((painting, index) => (
          <div key={index} className="group relative">
            <img src={painting.images.thumbnail} alt={painting.name} className=' object-cover w-full h-full ' />
            <div id='gradient-overlay' className="px-12 pe-24 p-3 absolute  bottom-0 flex flex-col justify-center items-center text-white ">
                <p className="text-left me-12 text-xl font-bold italic">{painting.name}</p>
                <p className='text-left me-12 text-md'>{painting.artist.name}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;