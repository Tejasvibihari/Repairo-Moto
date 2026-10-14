import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router keeps the previous scroll position on navigation, so reset it on every route change.
// Hash links (e.g. /page#section) are left alone so in-page anchors keep working.
export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) return;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname, hash]);

    return null;
}
