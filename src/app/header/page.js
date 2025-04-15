import Link from 'next/link'

export default function Header() {
    return (
        <nav id='navbar' className='flex p-10 border-b border-b-gray-300'>
            <div className=''>
                <img src='./assets/shared/logo.svg' className='' />
            </div>
            <div className='md:ms-auto md:mt-4'>
                <button >
                    <p id='start-slideshow' className='text-nowrap'>START SLIDESHOW</p>
                </button>
            </div>
        </nav>
    )
}