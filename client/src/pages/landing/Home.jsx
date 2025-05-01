import React from 'react'
import Hero from '../../components/landing/Hero'
import NavBar from "../../components/ui/NavBar"
import Feature from '../../components/landing/Feature'
import Footer from '../../components/landing/Footer'
import AboutSection from '../../components/landing/AboutSection'


export default function Home() {
    return (
        <div>
            <NavBar />
            <Hero />
            <AboutSection/>
            <Feature />
            <Footer/>
          
        </div>
    )
}
 