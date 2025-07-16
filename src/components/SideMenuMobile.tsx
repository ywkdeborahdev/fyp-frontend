import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import { logout } from '../apiFunction/logout'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthContext';
// import CardAlert from './CardAlert';

interface SideMenuMobileProps {
    open: boolean | undefined;
    toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
    const { setAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await logout();
            console.log('Logout response:', response);
            if (response?.ok) {
                setAuthenticated(false);
                navigate('/signin');
            } else {
                // handle error or show a message to the user
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Sign-in error:', error);
            alert('An error occurred during sign-in.');
        }
    }



    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={toggleDrawer(false)}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                [`& .${drawerClasses.paper}`]: {
                    backgroundImage: 'none',
                    backgroundColor: 'background.paper',
                },
            }}
        >
            <Stack
                sx={{
                    maxWidth: '70dvw',
                    height: '100%',
                }}
            >
                <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
                    <Stack
                        direction="row"
                        sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
                    >
                        <Avatar
                            sizes="small"
                            alt="deborah"
                            src="/static/images/avatar/7.jpg"
                            sx={{ width: 24, height: 24 }}
                        />
                        <Typography component="p" variant="h6">
                            Deborah
                        </Typography>
                    </Stack>
                    <MenuButton showBadge>
                        <NotificationsRoundedIcon />
                    </MenuButton>
                </Stack>
                <Divider />
                <Stack sx={{ flexGrow: 1 }}>
                    <MenuContent />
                    <Divider />
                </Stack>
                {/* <CardAlert /> */}
                <Stack sx={{ p: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={handleLogout}
                        fullWidth
                        startIcon={<LogoutRoundedIcon />}>
                        Logout
                    </Button>
                </Stack>
            </Stack>
        </Drawer>
    );
}