import Navbar from '../../components/ui/Navbar';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Footer from '../../components/landing/Footer';

export default function Services() {
  return (
      <>
          <Navbar />
          <div>
              {/* hero and breadcrumbs */}
              {/* Hero Section */}
              <div
                  className="relative bg-cover bg-center bg-no-repeat h-72 flex items-center justify-center text-white"
                  style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
              >
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent z-0" />
                  <div className="relative z-10 text-center">
                      <h2 className="text-4xl md:text-5xl font-bold">Service</h2>

                      <Breadcrumbs
                          items={[
                              { label: 'Home', href: '/' },
                              { label: 'Service', href: '/service' },
                          ]}
                      />
                  </div>
              </div>
          </div>
      <Footer/>
    </>
  )
}
