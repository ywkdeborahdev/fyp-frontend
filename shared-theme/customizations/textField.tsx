import { Theme, Components } from '@mui/material/styles';

/* eslint-disable import/prefer-default-export */
export const textFieldCustomizations: Components<Theme> = {
    MuiInputLabel: {
        styleOverrides: {
            root: {
                paddingLeft: '8px',
                transition: 'all 0.3s ease',
                // When label is focused (floating)
                '&.Mui-focused': {
                    paddingLeft: '12px',
                    top: '-12px',
                },
                // When label is shrunk (floated above)
                '&.MuiInputLabel-shrink': {
                    paddingLeft: '12px',
                    top: '-12px',
                },
            },
        },
    },
};