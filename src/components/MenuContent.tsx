import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import { Link } from 'react-router-dom';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';

const mainListItems = [
    { text: 'Discover', icon: <HomeRoundedIcon />, link: '/home' },
    { text: 'Write Log', icon: <AssignmentRoundedIcon />, link: '/writeLog' },
    { text: 'Batch Write Log', icon: <FileUploadRoundedIcon />, link: '/batchWriteLog' }
    // { text: 'Analytics', icon: <AnalyticsRoundedIcon /> },
    // { text: 'Clients', icon: <PeopleRoundedIcon /> },
    // { text: 'Tasks', icon: <AssignmentRoundedIcon /> },
];

const secondaryListItems = [
    { text: 'Settings', icon: <SettingsRoundedIcon />, link: '/settings' },
    // { text: 'About', icon: <InfoRoundedIcon /> },
    // { text: 'Feedback', icon: <HelpRoundedIcon /> },
];

export default function MenuContent() {
    return (
        <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
            <List dense>
                {mainListItems.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton selected={index === 0} to={item.link} component={Link}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <List dense>
                {secondaryListItems.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton to={item.link} component={Link}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Stack>
    );
}