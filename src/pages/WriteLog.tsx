/// <reference types="vite/client" />

import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { Stack, Button, Paper, Typography, CircularProgress, Divider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
// import { DiscoverWalletProviders } from '../components/WalletProviders';
import TextField from '@mui/material/TextField';
import dayjs, { Dayjs } from 'dayjs';
import { ethers } from 'ethers';
import LogEmitterABI from '../contracts/abi.json';
import { useSyncProviders } from "../hooks/useSyncProviders"
import { formatAddress } from "../utils"

const serverOptions = [
    { id: 1, name: 'logUbuntuDemo1' },
    { id: 2, name: 'Server 2' },
    { id: 3, name: 'Server 3' },
]

// const contractAddress = `${import.meta.env.CONTRACT_ADDRESS}`;
// console.log(`console.log ${contractAddress}`);
// const contractAddress = "0x7B92a5662891FA2A9746Ef79646D177e49b13043";
const contractAddress = "0x54dA4E13992Cf3Ab86a09C39230A27257214f99d";

// Placeholder for EIP-6963 types
interface EIP6963ProviderInfo {
    uuid: string;
    name: string;
    icon: string;
}
interface EIP6963ProviderDetail {
    info: EIP6963ProviderInfo;
    provider: any; // Simplified for this example
}

export default function WriteLog() {

    //form data
    const [selectedDateTime, setSelectedDateTime] = useState<Dayjs | null>(null);
    const [selectedServer, setSelectedServer] = useState('');
    const freeTextRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // from wallet providers 
    const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
    const [userAccount, setUserAccount] = useState<string>("")
    const providers = useSyncProviders()

    // Connect to the selected provider using eth_requestAccounts.
    const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
        const accounts: string[] | undefined =
            await (
                providerWithInfo.provider
                    .request({ method: "eth_requestAccounts" })
                    .catch(console.error)
            ) as string[] | undefined;

        if (accounts?.[0]) {
            setSelectedWallet(providerWithInfo)
            setUserAccount(accounts?.[0])

            // Create ethers provider and signer, and set them in state
            const browserProvider = new ethers.BrowserProvider(providerWithInfo.provider);
            const signerInstance = await browserProvider.getSigner();
            setProvider(browserProvider);
            setSigner(signerInstance);
        }
    }
    // end of from wallet providers
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [txStatus, setTxStatus] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect to instantiate the contract once the signer is available
    useEffect(() => {
        if (signer) {
            const contractInstance = new ethers.Contract(
                contractAddress,
                LogEmitterABI.abi,
                signer
            );
            setContract(contractInstance);
        }
    }, [signer]);

    // handle submission
    const handleSubmit = async () => {
        const formData = {
            dateTime: selectedDateTime ? selectedDateTime.toISOString() : null, // Store as ISO string
            server: selectedServer,
            freeText: freeTextRef.current ? freeTextRef.current.value : '',
        };
        console.log('Form Data:', formData);

        if (!signer || !contract) {
            alert('Wallet not connected or contract not initialized.');
            return;
        }
        if (!selectedDateTime || !selectedServer || !freeTextRef.current?.value) {
            alert('Please fill out all fields.');
            return;
        }

        setIsSubmitting(true);
        setTxStatus('Preparing transaction...');
        try {
            const latestBlock = await provider!.getBlock("latest");
            const min = 1;
            const max = 1000000;
            const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
            const logId = ethers.keccak256(
                ethers.toUtf8Bytes(`${latestBlock!.number}-${selectedDateTime}-${randomNum}`)
            );
            const timestamp = selectedDateTime.unix();
            const serverId = parseInt(selectedServer, 10);
            const message = freeTextRef.current.value;

            setTxStatus('Please confirm the transaction in MetaMask...');
            const tx = await contract.emitLog(logId, timestamp, serverId, message);
            setTxStatus(`Transaction sent! Waiting for confirmation... Hash: ${tx.hash}`);
            const receipt = await tx.wait();
            // 1. Log the entire receipt. Does it contain a `logs` array?
            console.log("Full Transaction Receipt:", receipt);

            // 2. Log the raw logs from the receipt.
            console.log("Raw logs from receipt:", receipt.logs);

            // 3. Log the contract address you are filtering against.
            console.log("Filtering for contract address:", contractAddress.toLowerCase());

            // 4. Check if your filter is working. Does contractLogs have anything in it?
            const contractLogs = receipt.logs.filter(log => log.address.toLowerCase() === contractAddress.toLowerCase());
            console.log("Filtered logs for your contract:", contractLogs);

            // 5. THIS IS THE MOST IMPORTANT STEP.
            // Check what `parseLog` returns. Are you getting back decoded event objects or `null`?
            const decodedEvents = contractLogs.map(log => {
                try {
                    return contract.interface.parseLog(log);
                } catch (e) {
                    console.error("Could not parse log:", log, e);
                    return null;
                }
            });
            console.log("Attempted to decode logs:", decodedEvents);

            // --- END DEBUGGING ---

            // Now, filter out any nulls before processing
            const successfulEvents = decodedEvents.filter(event => event !== null);

            const events: { eventName: any; eventArgs: any }[] = [];
            for (const event of successfulEvents) {
                if (event) { // Extra safety check
                    events.push({
                        eventName: event.name,
                        eventArgs: event.args,
                    });
                }
            }
            console.log('Final Decoded Events:', events);
            setTxStatus('Transaction confirmed successfully!');

            // Reset form
            setSelectedDateTime(dayjs());
            setSelectedServer('');
            if (freeTextRef.current) freeTextRef.current.value = '';

        } catch (error: any) {
            console.error("Transaction failed:", error);
            setTxStatus(`Error: ${error.reason || error.message || 'Transaction failed.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: '600px', margin: 'auto' }}>
            {/* Part 1: Wallet Connection UI */}
            {!userAccount ? (
                <>
                    <Typography variant="h5" gutterBottom>Connect Your Wallet</Typography>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        {providers.length > 0 ? providers.map((provider: EIP6963ProviderDetail) => (
                            <Button variant="outlined" key={provider.info.uuid} onClick={() => handleConnect(provider)}>
                                <img src={provider.info.icon} alt={provider.info.name} style={{ width: 24, height: 24, marginRight: 8 }} />
                                {provider.info.name}
                            </Button>
                        )) : (
                            <Typography>No wallet providers detected. Please install MetaMask.</Typography>
                        )}
                    </Stack>
                </>
            ) : (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6">Wallet Connected</Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <img src={selectedWallet!.info.icon} alt={selectedWallet!.info.name} style={{ width: 24, height: 24 }} />
                        <Typography>{selectedWallet!.info.name}</Typography>
                        <Typography variant="body2" color="text.secondary">({formatAddress(userAccount)})</Typography>
                    </Stack>
                </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Part 2: The Log Submission Form */}
            <Box sx={{ opacity: userAccount ? 1 : 0.4 }}>
                <Typography variant="h5" gutterBottom>Submit New Log</Typography>
                <Stack spacing={2}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label="Server Log Date and Time"
                            value={selectedDateTime}
                            onChange={(newValue) => setSelectedDateTime(newValue)}
                            disabled={!userAccount || isSubmitting}
                        />
                    </LocalizationProvider>
                    <FormControl fullWidth variant="outlined" disabled={!userAccount || isSubmitting}>
                        <InputLabel>Server</InputLabel>
                        <Select
                            value={selectedServer}
                            label="Server"
                            onChange={(e) => setSelectedServer(e.target.value)}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {serverOptions.map((server) => (
                                <MenuItem key={server.id} value={server.id}>{server.name}</MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Required</FormHelperText>
                    </FormControl>
                    <TextField
                        label="Log Message"
                        multiline
                        rows={4}
                        fullWidth
                        inputRef={freeTextRef}
                        variant="outlined"
                        placeholder="Enter your log message here..."
                        disabled={!userAccount || isSubmitting}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!userAccount || isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Log to Blockchain'}
                    </Button>
                    {txStatus && (
                        <Typography variant="body2" sx={{ mt: 2, wordBreak: 'break-all', color: txStatus.startsWith('Error') ? 'error.main' : 'text.secondary' }}>
                            Status: {txStatus}
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Paper>
    );
}