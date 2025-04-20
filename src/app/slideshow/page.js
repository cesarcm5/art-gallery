'use client'
import Header from "../header/page"
import data from "../../../starter-code/data.json"
import { useState } from "react"
export default function Slideshow() {

    const [currentIndex, setCurrentIndex] = useState(0)

    const [openModal, setOpenModal] = useState(false)
    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length)
    }

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => prevIndex === 0 ? data.length - 1 : prevIndex - 1)
    }

    return (
        <main>
            <Header/>
            <div className="">         
                <div className="grid grid-cols md:flex ms-10">
                    <div className="md:flex">
                        <div id="artist-picture" className="md:mx-8 md:my-10">
                            <img
                                src={data[currentIndex].images.hero.large}
                                alt={data[currentIndex].name}
                                className=""
                                width={475}
                                height={560}
                                />
                        </div>
                        <div id="artist-info" className="bg-white absolute">
                            <p>{data[currentIndex].name}</p>
                            <p>{data[currentIndex].artist.name}</p>
                        </div>
                    </div>
                    <div id="text-container" className="md:ms-20 md:w-2/4">
                        <p id="description" className="md:w-3/5 text-left text-pretty align-top">{data[currentIndex].description}</p>
                    </div>   
                </div>
                <div className="absolute bottom-0">
                    <button onClick={handlePrev}>Previous</button>
                    <button onClick={handleNext}>Next</button>
                </div> 
            </div>
        </main>
    )
}