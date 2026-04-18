import React from 'react'
import Hero from '../../components/landing/Hero'
import NavBar from "../../components/ui/NavBar"
import Feature from '../../components/landing/Feature'
import Footer from '../../components/landing/Footer'
import AboutSection from '../../components/landing/AboutSection'
import WhyChooseUs from '../../components/landing/WhyChooseUs'
import HowItWorks from '../../components/landing/HowItWork'
import CTASection from '../../components/landing/CtaSection'
import BikeEngineComponent from '../../components/landing/BikeEngineComponent'
import MobileAppBanner from '../../components/landing/MobileAppBanner'

export default function Home() {
    return (
        <div>
            <NavBar />
            <Hero />
            <BikeEngineComponent />
            <AboutSection />
            <Feature />
            <MobileAppBanner />
            <WhyChooseUs />
            <HowItWorks />
            <CTASection />
            <Footer />
        </div>
    )
}