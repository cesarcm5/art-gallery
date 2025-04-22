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

    const toggleGallery = () => {
        openModal ? setOpenModal(false) : setOpenModal(true);
    }

    return (
        <main>
            <Header />
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
                            <div id="view-image" className="absolute bottom-1 bg-black ms-3 mb-2">
                                <button onClick={toggleGallery} className="flex ms-5 mt-3 gap-x-2 ">
                                    <img src="./assets/shared/icon-view-image.svg" className="p-1" />
                                    <span className="text-white text-[9px] tracking-[2px] font-bold mt-1">VIEW IMAGE</span>
                                </button>
                            </div>
                        </div>
                        <div id="artist-info" className="bg-white absolute flex flex-col ps-14 pt-8">
                            <div id="picture-name" className="md:w-5/7">
                                <span className="data-name text-start font-semibold">{data[currentIndex].name}</span>
                            </div>
                            <div className="mt-3 mb-10">
                                <span id="artist-name" className="text-start">{data[currentIndex].artist.name}</span>
                            </div>
                        </div>
                        <div className="self-end">
                            <img
                                src={data[currentIndex].artist.image}
                                alt={data[currentIndex].artist.name}
                            />
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
                <div className="flex justify-between mt-20 mb-10 ms-15">
                    <div className="">
                        <p className="text-lg font-bold">{data[currentIndex].name}</p>
                        <p>{data[currentIndex].artist.name}</p>
                    </div>
                    <div className="me-8">
                        <button type="button" className={`me-6  ${currentIndex == 0 ? "disabled:opacity-20" : " "} `} onClick={handlePrev} disabled={currentIndex == 0}>
                            <img className="" src="./assets/shared/icon-back-button.svg"/>
                        </button>
                        <button className={ ` ${currentIndex == data.length - 1 ? "disabled:opacity-20" : " "} ` } onClick={handleNext} disabled={currentIndex == data.length - 1}>
                            <img src="./assets/shared/icon-next-button.svg"/>
                        </button>
                    </div>
                </div>
            </div>
            {openModal ? (
                <div className="modal">
                    <div className="modalContainer">
                        <div className="closeContainer">
                            <button onClick={toggleGallery} className="close">
                                <h4 className="close">close</h4>
                            </button>
                        </div>
                        <img
                            className="galleryImage"
                            src={data[currentIndex].images.gallery}
                            alt={data[currentIndex].name}
                        />
                    </div>
                </div>
            ) : null}
        </main>
    )
}