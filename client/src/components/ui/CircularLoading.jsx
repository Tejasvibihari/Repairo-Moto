import * as React from 'react';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

// GradientCircularProgress with size as a prop
function GradientCircularProgress({ size = 40 }) { // Default size is 40
    return (
        <React.Fragment>
            <svg width={0} height={0}>
                <defs>
                    <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#e01cd5" />
                        <stop offset="100%" stopColor="#1CB5E0" />
                    </linearGradient>
                </defs>
            </svg>
            <CircularProgress
                sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }}
                size={size} // Pass the size prop to CircularProgress
            />
        </React.Fragment>
    );
}

export default function CircularLoading({ size }) {
    return (
        <Stack>
            <GradientCircularProgress size={size} /> {/* Pass size prop */}
        </Stack>
    );
}