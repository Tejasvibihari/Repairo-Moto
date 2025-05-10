import { Link } from 'react-router-dom';

const BreadCrumbs = ({ items = [] }) => {
    return (
        <nav className="text-white" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center text-sm md:text-base font-semibold ">
                        {index !== 0 && <span className="mx-2"> &gt; </span>}
                        {item.href ? (
                            <Link to={item.href} className="capitalize text-white hover:text-primary">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="capitalize">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default BreadCrumbs;
