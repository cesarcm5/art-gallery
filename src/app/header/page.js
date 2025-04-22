import Link from 'next/link'

export default function Header() {
    return (
        <nav id='navbar' className='md:mx-7 flex p-10 border-b border-b-gray-300'>
            <Link href="/">
                <div className=''>
                    <img src='./assets/shared/logo.svg' className='' />
                </div>
            </Link>
            <div className='md:ms-auto md:mt-4'>
                <Link href="/slideshow">
                    <button >
                        <p id='start-slideshow' className='text-nowrap'>START SLIDESHOW</p>
                    </button>
                </Link>
            </div>
        </nav>
    )
}