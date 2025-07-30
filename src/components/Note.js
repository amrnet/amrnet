import React from 'react';
import { Card, CardContent, Button } from '@mui/material';

const Note = ({ disableElevation, ...otherProps }) => {
    // Remove any other MUI-specific props that shouldn't go to Card
    const { sx, ...cardProps } = otherProps;

    return (
        <Card
            elevation={disableElevation ? 0 : undefined}
            sx={sx}
            {...cardProps}
        >
            <CardContent>
                <Button variant="contained" disableElevation={disableElevation}>
                    Action
                </Button>
            </CardContent>
        </Card>
    );
};

export default Note;