import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Alert
} from '@mui/material';
import { Visibility, VisibilityOff, Delete, VpnKey } from '@mui/icons-material';
import { getUsers, createUser, deleteUser, resetUserPassword } from '../apiFunction/usersApi';


export default function Settings() {
    // State for the main form fields
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userGroup, setUserGroup] = useState('2'); // Defaulted to '2' for User
    const [showPassword, setShowPassword] = useState(false);

    // State for email validation
    const [emailError, setEmailError] = useState(false);
    const [emailHelperText, setEmailHelperText] = useState('');

    // State for modals, user list, loading, and errors
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openResetDialog, setOpenResetDialog] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');


    // Fetch users when the component mounts
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailBlur = () => {
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError(true);
            setEmailHelperText('Please enter a valid email address.');
        } else {
            setEmailError(false);
            setEmailHelperText('');
        }
    };

    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = (event) => event.preventDefault();

    const handleAddUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            const newUser = { username, useremail: email, password, userGroup: parseInt(userGroup) };
            await createUser(newUser);
            setSuccessMessage('User added successfully!');
            // Reset form and refetch users
            setUsername('');
            setEmail('');
            setPassword('');
            setUserGroup('2');
            fetchUsers();
        } catch (err) {
            setError(err.message);
        }
    };

    // --- Modal and Table Logic ---
    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;
        setError('');
        setSuccessMessage('');
        try {
            await deleteUser(selectedUser.id);
            setSuccessMessage(`User "${selectedUser.username}" deleted successfully.`);
            fetchUsers(); // Refetch users to update the list
        } catch (err) {
            setError(err.message);
        } finally {
            handleCloseDialogs();
        }
    };

    const handleResetPasswordClick = (user) => {
        setSelectedUser(user);
        setOpenResetDialog(true);
    };

    const handleConfirmResetPassword = async () => {
        if (!selectedUser || !newPassword) {
            setError("New password cannot be empty.");
            return;
        }
        setError('');
        setSuccessMessage('');
        try {
            await resetUserPassword(selectedUser.id, newPassword);
            setSuccessMessage(`Password for "${selectedUser.username}" has been reset.`);
        } catch (err) {
            setError(err.message);
        } finally {
            handleCloseDialogs();
        }
    };

    const handleCloseDialogs = () => {
        setOpenDeleteDialog(false);
        setOpenResetDialog(false);
        setSelectedUser(null);
        setNewPassword('');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Stack spacing={4} sx={{ width: '100%', maxWidth: '800px' }}>
                {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
                {successMessage && <Alert severity="success" onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

                {/* --- Add User Form --- */}
                <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
                    <Typography variant="h5" gutterBottom>Add New User</Typography>
                    <Box component="form" onSubmit={handleAddUser} noValidate>
                        <Stack spacing={3}>
                            <TextField id="username" name="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} variant="outlined" required fullWidth />
                            <TextField error={emailError} helperText={emailHelperText} id="email" name="email" type="email" label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={handleEmailBlur} variant="outlined" required fullWidth />
                            <FormControl fullWidth variant="outlined">
                                <InputLabel htmlFor="password">Password</InputLabel>
                                <OutlinedInput id="password" name="password" type={showPassword ? 'text' : 'password'} label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required endAdornment={<InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>} />
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel id="user-group-label">User Group</InputLabel>
                                <Select labelId="user-group-label" id="user-group" value={userGroup} label="User Group" onChange={(e) => setUserGroup(e.target.value)} required>
                                    <MenuItem value={'2'}>User</MenuItem>
                                    <MenuItem value={'1'}>Admin</MenuItem>
                                </Select>
                                <FormHelperText>Select the user's permission group.</FormHelperText>
                            </FormControl>
                            <Button type="submit" variant="contained" sx={{ mt: 2, alignSelf: 'flex-start' }}>Add User</Button>
                        </Stack>
                    </Box>
                </Paper>

                {/* --- Users Table --- */}
                <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
                    <Typography variant="h5" gutterBottom>Manage Users</Typography>
                    {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> :
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Username</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>User Group</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>{user.useremail}</TableCell>
                                            <TableCell>{user.userGroup === 1 ? 'Admin' : 'User'}</TableCell>
                                            <TableCell align="right">
                                                <IconButton onClick={() => handleResetPasswordClick(user)} color="primary" aria-label="reset password"><VpnKey /></IconButton>
                                                <IconButton onClick={() => handleDeleteClick(user)} color="error" aria-label="delete user"><Delete /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }
                </Paper>
            </Stack>

            {/* --- Dialogs --- */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent><DialogContentText>Are you sure you want to delete the user "{selectedUser?.username}"? This action cannot be undone.</DialogContentText></DialogContent>
                <DialogActions><Button onClick={handleCloseDialogs}>Cancel</Button><Button onClick={handleConfirmDelete} color="error">Delete</Button></DialogActions>
            </Dialog>

            <Dialog open={openResetDialog} onClose={handleCloseDialogs}>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>Please enter a new password for "{selectedUser?.useremail}".</DialogContentText>
                    <TextField autoFocus margin="dense" id="new-password" label="New Password" type="password" fullWidth variant="outlined" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </DialogContent>
                <DialogActions><Button onClick={handleCloseDialogs}>Cancel</Button><Button onClick={handleConfirmResetPassword} variant="contained">Reset Password</Button></DialogActions>
            </Dialog>
        </Box>
    );
}
