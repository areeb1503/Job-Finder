import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import { useEffect,useState } from 'react';
import logo from '../../assets/briefcase.png';


function Loader({ logo }) {

    // pulse animation for the logo
    const logoSpring = useSpring({
        loop: true,
        to: [
            { scale: 1.1 },  
            { scale: 1.0 },  
        ],
        from: { scale: 1.0 }, 
        config: { duration: 800 },  
    });

    // Pulse animation for the text
    const textSpring = useSpring({
        // loop: true,
        to: [{ opacity: 1 }],
        from: { opacity: 0.3 },
        config: { duration: 2500 }
    });


    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
        <animated.img
          style={logoSpring}
          src={logo}
          className="h-24 w-24 sm:h-32 sm:w-32 lg:h-48 lg:w-48" 
          alt="Logo"
        />
      
        {/* Animated text */}
        <animated.p
          style={textSpring}
          className="text-orange-700 font-extrabold mt-4 text-4xl sm:text-5xl lg:text-6xl"
        >
          KAAM
        </animated.p>
      </div>
    )
}

function PageContent() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}


function Page() {
    const [Load, setLoad] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoad(false);
        }, 5000);
    }, [])
    
    return (
        <>
        {Load ? <Loader logo={logo}/> : <PageContent/>}
        </>
    )
}

export default Page;

export { Loader };