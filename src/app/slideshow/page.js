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
            <div className="mt-10">         
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
                        <div id="artist-info" className="bg-white absolute flex flex-col ps-14 pt-8">
                            <div id="picture-name" className="md:w-5/7">
                                <span className="data-name text-start font-semibold">{data[currentIndex].name}</span>
                            </div>
                            <div className="mt-3 mb-10">
                                <span id="artist-name" className="text-start">{data[currentIndex].artist.name}</span>
                            </div>
                        </div>
                    </div>  
                    <div id="text-container" className="md:ms-20 md:w-2/4">
                        <div className="top-35 -z-1 absolute">
                            <span id="picture-year">{data[currentIndex].year}</span>
                        </div>
                        <p id="description" className="md:w-3/5 text-left text-pretty align-top">{data[currentIndex].description}</p>
                        <a id="source-anchor" className="mt-15 text-left  border-b-1" href={data[currentIndex].source}>
                            GO TO SOURCE
                        </a>
                    </div>
                </div>
                <div className="">
                    <div>
                        <button onClick={handlePrev}>Previous</button>
                        <button onClick={handleNext}>Next</button>
                    </div>
                </div> 
            </div>
        </main>
    )
}