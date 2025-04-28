import React from 'react'
import Hero from '../../components/landing/Hero'
import NavBar from '../../components/ui/NavBar'
import Feature from '../../components/landing/Feature'
import Footer from '../../components/landing/Footer'


export default function Home() {
    return (
        <div>
            <NavBar />
            <Hero />
            <Feature />
            <Footer/>
          
        </div>
    )
}
