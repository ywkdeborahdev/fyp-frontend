/// <reference types="vite/client" />

import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { Stack, Button, Paper, Typography, CircularProgress, Divider, TextField } from '@mui/material';
import { useSyncProviders } from "../hooks/useSyncProviders"
import { formatAddress } from "../utils"
import { ethers } from 'ethers';
import LogEmitterABI from '../contracts/abi.json';

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

interface LogEntry {
    dateTime: string;
    server: number;
    message: string;
}

export default function BatchWriteLog() {

    // from wallet providers
    const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>()
    const [userAccount, setUserAccount] = useState<string>("")
    const providers = useSyncProviders()
    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
    const [fileName, setFileName] = useState<string>('');


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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const parsedLogs: LogEntry[] = JSON.parse(content);
                    // Basic validation
                    if (Array.isArray(parsedLogs) && parsedLogs.every(log => 'dateTime' in log && 'server' in log && 'message' in log)) {
                        setLogEntries(parsedLogs);
                        setTxStatus(`${parsedLogs.length} log entries loaded from ${file.name}.`);
                    } else {
                        throw new Error('Invalid JSON format.');
                    }
                } catch (error) {
                    setTxStatus(`Error parsing JSON file: ${error.message}`);
                    setLogEntries([]);
                }
            };
            reader.readAsText(file);
        }
    };


    // handle submission
    const handleSubmit = async () => {

        if (!signer || !contract) {
            alert('Wallet not connected or contract not initialized.');
            return;
        }
        if (logEntries.length === 0) {
            alert('Please upload a valid log file.');
            return;
        }

        // Add this line for debugging
        console.log('Contract Functions:', contract.interface);

        setIsSubmitting(true);
        setTxStatus('Preparing batch transaction...');
        try {
            const latestBlock = await provider!.getBlock("latest");
            const min = 1;
            const max = 1000000;

            const logIds = logEntries.map(log => {
                const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
                return ethers.keccak256(ethers.toUtf8Bytes(`${latestBlock!.number}-${log.dateTime}-${randomNum}`));
            });
            const timestamps = logEntries.map(log => Math.floor(new Date(log.dateTime).getTime() / 1000));
            const serverIds = logEntries.map(log => log.server);
            const messages = logEntries.map(log => log.message);


            setTxStatus(`Submitting a batch of ${logEntries.length} logs. Please confirm the transaction in MetaMask...`);
            const tx = await contract.emitLogsBatch(logIds, timestamps, serverIds, messages);
            const receipt = await tx.wait();

            console.log("Batch transaction successful!", receipt);

            setTxStatus('Batch transaction confirmed successfully!');

        } catch (error: any) {
            console.error("Batch transaction failed:", error);
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
                <Typography variant="h5" gutterBottom>Submit Logs in Batch</Typography>
                <Stack spacing={2}>
                    <Button
                        variant="contained"
                        component="label"
                        disabled={!userAccount || isSubmitting}
                    >
                        Upload JSON File
                        <input
                            type="file"
                            hidden
                            accept=".json"
                            onChange={handleFileChange}
                        />
                    </Button>
                    {fileName && <Typography variant="body2" sx={{ mt: 1 }}>File: {fileName}</Typography>}

                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!userAccount || isSubmitting || logEntries.length === 0}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSubmitting ? `Submitting...` : 'Submit Logs to Blockchain'}
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