import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function AlertSnackBar({ open, message, severity = 'success', onClose }) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Position in the top-right corner
        >
            <Alert
                onClose={onClose}
                severity={severity} // Accept severity as a prop (e.g., 'success', 'error', 'warning', 'info')
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message} {/* Display the message passed as a prop */}
            </Alert>
        </Snackbar>
    );
}