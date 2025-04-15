import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
    const location = useLocation();
    const paths = location.pathname.split('/').filter(Boolean);

    let pathUrl = '';
    const breadcrumbs = [
        <li key="/" className="text-[16px] text-gray-600 ">
            <Link to="/" className="text-white  ">Home</Link>
        </li>,
    ];

    paths.forEach((segment, index) => {
        pathUrl += `/${segment}`;
        const isLast = index === paths.length - 1;

        breadcrumbs.push(
            <li key={pathUrl} className="text-[16px] text-primary flex items-center">
                <span className="mx-3">/</span>
                {isLast ? (
                    <span className=" text-white  capitalize">{segment}</span>
                ) : (
                    <Link to={pathUrl} className="capitalize">{segment}</Link>
                )}
            </li>
        );
    });

    return (
        <nav className="mb-4 " aria-label="Breadcrumb">
            <ol className="flex flex-wrap ">{breadcrumbs}</ol>
        </nav>
    );
};

export default Breadcrumbs;
