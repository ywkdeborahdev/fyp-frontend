import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { Link, useLocation } from 'react-router-dom';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import { useAuth } from './Auth/AuthContext';

const mainListItems = [
    { text: 'Discover', icon: <HomeRoundedIcon />, link: '/home' },
    { text: 'Write Log', icon: <AssignmentRoundedIcon />, link: '/writeLog' },
    { text: 'Batch Write Log', icon: <FileUploadRoundedIcon />, link: '/batchWriteLog' }
];

const secondaryListItems = [
    { text: 'Settings', icon: <SettingsRoundedIcon />, link: '/settings' },
];

export default function MenuContent() {
    const location = useLocation();
    const { userGroup } = useAuth(); // Get userGroup from context

    return (
        <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
            <List dense>
                {mainListItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            selected={location.pathname === item.link}
                            to={item.link}
                            component={Link}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <List dense>
                {/* Only show settings if userGroup is not 2 */}
                {userGroup !== 2 && secondaryListItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            selected={location.pathname === item.link}
                            to={item.link}
                            component={Link}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Stack>
    );
}