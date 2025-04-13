import React from 'react'
import Hero from '../../components/landing/Hero'
import NavBar from '../../components/ui/NavBar'
import Feature from '../../components/landing/Feature'

export default function Home() {
    return (
        <div>
            <NavBar />
            <Hero />
            <Feature />
        </div>
    )
}
