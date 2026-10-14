import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, CalendarDays, IndianRupee } from 'lucide-react';
import NavBar from '../../components/ui/NavBar';
import BreadCrumbs from '../../components/ui/BreadCrumbs';
import Footer from '../../components/landing/Footer';
import CircularLoading from '../../components/ui/CircularLoading';
import { careerApi, formatDate } from '../../service/careerApi';

export default function Careers() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        careerApi
            .listOpen()
            .then((data) => setJobs(data.jobs || []))
            .catch(() => setError('Could not load job openings right now. Please try again later.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <NavBar />

            <div className="min-h-screen bg-gray-50">
                <motion.div
                    className="relative bg-cover bg-center h-72 flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/20 z-0" />
                    <div className="relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Careers</h2>
                        <BreadCrumbs items={[{ label: 'Home', href: '/' }, { label: 'Careers' }]} />
                    </div>
                </motion.div>

                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-primary font-semibold uppercase text-sm tracking-wide mb-2">Join Repairo Moto</p>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">Current Openings</h1>
                        <p className="text-gray-600 mb-10">
                            Help us make bike and scooter care simple. Pick a role below and apply with your resume.
                        </p>

                        {loading ? (
                            <div className="flex justify-center items-center min-h-[200px]"><CircularLoading /></div>
                        ) : error ? (
                            <div className="text-center text-red-500 py-8">{error}</div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center text-gray-500 text-lg font-medium py-12 bg-white rounded-xl shadow-sm">
                                No openings right now. Please check back soon.
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {jobs.map((job) => (
                                    <motion.article
                                        key={job._id}
                                        initial={{ opacity: 0, y: 24 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
                                    >
                                        <div className="min-w-0">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h3>
                                            {job.department && <p className="text-sm text-gray-500 mb-3">{job.department}</p>}
                                            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                                                <li className="flex items-center gap-1.5"><MapPin size={16} className="text-primary" />{job.location}</li>
                                                <li className="flex items-center gap-1.5"><Briefcase size={16} className="text-primary" />{job.jobType}</li>
                                                {job.experience && <li className="flex items-center gap-1.5"><Clock size={16} className="text-primary" />{job.experience}</li>}
                                                {job.salary && <li className="flex items-center gap-1.5"><IndianRupee size={16} className="text-primary" />{job.salary}</li>}
                                                {job.lastDate && <li className="flex items-center gap-1.5"><CalendarDays size={16} className="text-primary" />Apply by {formatDate(job.lastDate)}</li>}
                                            </ul>
                                        </div>
                                        <Link
                                            to={`/careers/${job._id}`}
                                            className="flex-shrink-0 text-center bg-primary hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
                                        >
                                            View & Apply →
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
