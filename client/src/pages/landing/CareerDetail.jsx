import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Briefcase, MapPin, Clock, CalendarDays, IndianRupee, Users } from 'lucide-react';
import NavBar from '../../components/ui/NavBar';
import BreadCrumbs from '../../components/ui/BreadCrumbs';
import Footer from '../../components/landing/Footer';
import CircularLoading from '../../components/ui/CircularLoading';
import ApplyForm from '../../components/careers/ApplyForm';
import { careerApi, formatDate } from '../../service/careerApi';

export default function CareerDetail() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        careerApi
            .getOpen(id)
            .then((data) => setJob(data.job))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <>
            <NavBar />

            <div className="min-h-screen bg-gray-50">
                <div
                    className="relative bg-cover bg-center h-60 flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/20 z-0" />
                    <div className="relative z-10 text-center px-4">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">{job?.title || 'Careers'}</h2>
                        <BreadCrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Careers', href: '/careers' },
                                { label: job?.title || 'Job' },
                            ]}
                        />
                    </div>
                </div>

                <div className="container mx-auto px-6 py-12">
                    {loading ? (
                        <div className="flex justify-center min-h-[200px] items-center"><CircularLoading /></div>
                    ) : notFound || !job ? (
                        <div className="text-center py-16">
                            <p className="text-gray-600 text-lg mb-4">This position is no longer open.</p>
                            <Link to="/careers" className="text-primary font-semibold hover:underline">← See all openings</Link>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto grid gap-8">
                            <section className="bg-white rounded-xl shadow-md p-8">
                                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-6">
                                    <li className="flex items-center gap-1.5"><MapPin size={16} className="text-primary" />{job.location}</li>
                                    <li className="flex items-center gap-1.5"><Briefcase size={16} className="text-primary" />{job.jobType}</li>
                                    {job.experience && <li className="flex items-center gap-1.5"><Clock size={16} className="text-primary" />{job.experience}</li>}
                                    {job.salary && <li className="flex items-center gap-1.5"><IndianRupee size={16} className="text-primary" />{job.salary}</li>}
                                    <li className="flex items-center gap-1.5"><Users size={16} className="text-primary" />{job.openings} opening{job.openings > 1 ? 's' : ''}</li>
                                    {job.lastDate && <li className="flex items-center gap-1.5"><CalendarDays size={16} className="text-primary" />Apply by {formatDate(job.lastDate)}</li>}
                                </ul>

                                <h3 className="text-xl font-bold mb-2">About the role</h3>
                                <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-6">{job.description}</p>

                                {job.requirements && (
                                    <>
                                        <h3 className="text-xl font-bold mb-2">Requirements</h3>
                                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.requirements}</p>
                                    </>
                                )}
                            </section>

                            <section className="bg-white rounded-xl shadow-md p-8" aria-labelledby="apply-title">
                                <h3 id="apply-title" className="text-2xl font-bold mb-6">Apply for this position</h3>
                                <ApplyForm jobId={job._id} />
                            </section>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </>
    );
}
