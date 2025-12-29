import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, Loader2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function WalletLogin({ onSuccess, merchantId }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [walletType, setWalletType] = useState('');

  const connectPhantom = async () => {
    setConnecting(true);
    setError('');
    setWalletType('Phantom');

    try {
      // Check if Phantom is installed
      const isPhantomInstalled = window?.solana?.isPhantom;
      
      if (!isPhantomInstalled) {
        window.open('https://phantom.app/', '_blank');
        throw new Error('Phantom wallet is not installed. Please install it and refresh the page.');
      }

      // Connect to Phantom
      const resp = await window.solana.connect();
      const publicKey = resp.publicKey.toString();

      console.log('Phantom connected:', publicKey);

      // Sign a message to verify ownership
      const message = `Sign this message to login to ChainLINK POS\n\nWallet: ${publicKey}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');

      // Authenticate with backend
      await authenticateWallet(publicKey, 'phantom', {
        signature: Array.from(signedMessage.signature),
        message: message
      });

    } catch (err) {
      console.error('Phantom connection error:', err);
      if (!err.message?.includes('User rejected')) {
        setError(err.message || 'Failed to connect to Phantom wallet');
      }
    } finally {
      setConnecting(false);
      setWalletType('');
    }
  };

  const connectSolflare = async () => {
    setConnecting(true);
    setError('');
    setWalletType('Solflare');

    try {
      const provider = window?.solflare;
      
      if (!provider) {
        window.open('https://solflare.com/', '_blank');
        throw new Error('Solflare wallet is not installed. Please install it and refresh the page.');
      }

      await provider.connect();
      const publicKey = provider.publicKey.toString();

      console.log('Solflare connected:', publicKey);

      const message = `Sign this message to login to ChainLINK POS\n\nWallet: ${publicKey}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await provider.signMessage(encodedMessage, 'utf8');

      await authenticateWallet(publicKey, 'solflare', {
        signature: Array.from(signedMessage.signature),
        message: message
      });

    } catch (err) {
      console.error('Solflare connection error:', err);
      if (!err.message?.includes('User rejected')) {
        setError(err.message || 'Failed to connect to Solflare wallet');
      }
    } finally {
      setConnecting(false);
      setWalletType('');
    }
  };

  const connectBackpack = async () => {
    setConnecting(true);
    setError('');
    setWalletType('Backpack');

    try {
      const provider = window?.backpack;
      
      if (!provider) {
        window.open('https://backpack.app/', '_blank');
        throw new Error('Backpack wallet is not installed. Please install it and refresh the page.');
      }

      const resp = await provider.connect();
      const publicKey = resp.publicKey.toString();

      console.log('Backpack connected:', publicKey);

      const message = `Sign this message to login to ChainLINK POS\n\nWallet: ${publicKey}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await provider.signMessage(encodedMessage, 'utf8');

      await authenticateWallet(publicKey, 'backpack', {
        signature: Array.from(signedMessage.signature),
        message: message
      });

    } catch (err) {
      console.error('Backpack connection error:', err);
      if (!err.message?.includes('User rejected')) {
        setError(err.message || 'Failed to connect to Backpack wallet');
      }
    } finally {
      setConnecting(false);
      setWalletType('');
    }
  };

  const connectJupiter = async () => {
    setConnecting(true);
    setError('');
    setWalletType('Jupiter');

    try {
      const provider = window?.jupiter?.solana;
      
      if (!provider) {
        window.open('https://jup.ag/', '_blank');
        throw new Error('Jupiter wallet is not installed. Please install it and refresh the page.');
      }

      const resp = await provider.connect();
      const publicKey = resp.publicKey.toString();

      console.log('Jupiter connected:', publicKey);

      const message = `Sign this message to login to ChainLINK POS\n\nWallet: ${publicKey}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await provider.signMessage(encodedMessage, 'utf8');

      await authenticateWallet(publicKey, 'jupiter', {
        signature: Array.from(signedMessage.signature),
        message: message
      });

    } catch (err) {
      console.error('Jupiter connection error:', err);
      if (!err.message?.includes('User rejected')) {
        setError(err.message || 'Failed to connect to Jupiter wallet');
      }
    } finally {
      setConnecting(false);
      setWalletType('');
    }
  };

  const connectWalletConnect = async () => {
    setConnecting(true);
    setError('');
    setWalletType('WalletConnect');

    try {
      // Check if Ethereum provider is available
      if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
        window.open('https://metamask.io/download/', '_blank');
        throw new Error('MetaMask is not installed. Please install MetaMask browser extension and refresh the page.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in wallet');
      }

      const address = accounts[0];
      console.log('MetaMask connected:', address);

      // Sign a message to verify ownership
      const message = `Sign this message to login to ChainLINK POS\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });

      // Authenticate with backend
      await authenticateWallet(address, 'ethereum', {
        signature: signature,
        message: message
      });

    } catch (err) {
      console.error('MetaMask connection error:', err);
      
      // Don't show error if user rejected the request
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        console.log('User rejected connection request');
      } else if (err.code === -32002) {
        setError('Connection request already pending. Please check MetaMask.');
      } else if (err.message?.includes('not installed')) {
        setError(err.message);
      } else {
        setError('Failed to connect to MetaMask. Please try again.');
      }
    } finally {
      setConnecting(false);
      setWalletType('');
    }
  };

  const authenticateWallet = async (walletAddress, walletType, signatureData) => {
    try {
      // Call backend function to authenticate wallet
      const { data } = await base44.functions.invoke('authenticateWallet', {
        wallet_address: walletAddress,
        wallet_type: walletType,
        signature_data: signatureData,
        merchant_id: merchantId || null
      });

      if (!data.success) {
        throw new Error(data.error || 'Wallet authentication failed');
      }

      // Store user session
      if (data.user) {
        localStorage.setItem('pinLoggedInUser', JSON.stringify(data.user));
        
        // Log the action - wrap in try/catch to prevent blocking login
        try {
          await base44.entities.SystemLog.create({
            merchant_id: data.user.merchant_id || null,
            log_type: 'merchant_action',
            action: 'Wallet Login',
            description: `User logged in with ${walletType} wallet: ${walletAddress}`,
            user_email: data.user.email || walletAddress,
            severity: 'info'
          });
        } catch (logError) {
          console.log('Could not log wallet login:', logError);
        }

        // Success callback or redirect
        if (onSuccess) {
          onSuccess(data.user);
        } else {
          // Default redirect to System Menu
          window.location.href = createPageUrl('SystemMenu');
        }
      }

    } catch (err) {
      console.error('Wallet authentication error:', err);
      throw err;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Login with Crypto Wallet
        </CardTitle>
        <CardDescription>
          Connect your Solana or Ethereum wallet to login securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          {/* Phantom Wallet */}
          <Button
            onClick={connectPhantom}
            disabled={connecting}
            variant="outline"
            className="w-full justify-start h-12"
          >
            {connecting && walletType === 'Phantom' ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <img 
                src="https://phantom.app/img/logo.png" 
                alt="Phantom" 
                className="w-5 h-5 mr-2"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <span>Phantom Wallet</span>
          </Button>

          {/* Solflare Wallet */}
          <Button
            onClick={connectSolflare}
            disabled={connecting}
            variant="outline"
            className="w-full justify-start h-12"
          >
            {connecting && walletType === 'Solflare' ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <img 
                src="https://solflare.com/assets/logo.svg" 
                alt="Solflare" 
                className="w-5 h-5 mr-2"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <span>Solflare Wallet</span>
          </Button>

          {/* Backpack Wallet */}
          <Button
            onClick={connectBackpack}
            disabled={connecting}
            variant="outline"
            className="w-full justify-start h-12"
          >
            {connecting && walletType === 'Backpack' ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Wallet className="w-5 h-5 mr-2 text-orange-600" />
            )}
            <span>Backpack Wallet</span>
          </Button>

          {/* Jupiter Wallet */}
          <Button
            onClick={connectJupiter}
            disabled={connecting}
            variant="outline"
            className="w-full justify-start h-12"
          >
            {connecting && walletType === 'Jupiter' ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Wallet className="w-5 h-5 mr-2 text-blue-600" />
            )}
            <span>Jupiter Wallet</span>
          </Button>

          {/* MetaMask / WalletConnect */}
          <Button
            onClick={connectWalletConnect}
            disabled={connecting}
            variant="outline"
            className="w-full justify-start h-12"
          >
            {connecting && walletType === 'WalletConnect' ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Wallet className="w-5 h-5 mr-2" />
            )}
            <span>MetaMask / WalletConnect</span>
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Don't have a wallet? Click any option above to get started.
        </p>
      </CardContent>
    </Card>
  );
}