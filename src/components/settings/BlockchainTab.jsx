import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function BlockchainTab({ blockchain, onUpdateBlockchain }) {
  const [localSettings, setLocalSettings] = useState(blockchain || {
    enabled: false,
    network: 'mainnet',
    solana_wallet_address: '',
    btc_address: '',
    eth_address: '',
    preferred_token: 'SOL',
    custom_token_mint: '',
    custom_token_decimals: 6,
    custom_token_conversion_rate: 1
  });
  
  const [connectingMetaMask, setConnectingMetaMask] = useState(false);
  const [metaMaskError, setMetaMaskError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Update local settings when blockchain prop changes
  useEffect(() => {
    if (blockchain) {
      setLocalSettings(blockchain);
    }
  }, [blockchain]);

  const handleSave = () => {
    onUpdateBlockchain(localSettings);
    setSuccessMessage('Blockchain settings saved successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const connectMetaMask = async () => {
    setConnectingMetaMask(true);
    setMetaMaskError('');
    
    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install the MetaMask browser extension first.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        setLocalSettings(prev => ({
          ...prev,
          eth_address: accounts[0]
        }));
        setSuccessMessage('MetaMask connected successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('No accounts found in MetaMask. Please create or unlock an account.');
      }
    } catch (error) {
      console.error('MetaMask connection error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to connect to MetaMask.';
      
      if (error.code === 4001) {
        errorMessage = 'Connection request rejected. Please approve the connection in MetaMask.';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending. Please check MetaMask.';
      } else if (error.message && error.message.includes('not installed')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMetaMaskError(errorMessage);
    } finally {
      setConnectingMetaMask(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Blockchain & Crypto Payments</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure cryptocurrency payment options</p>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-300">{successMessage}</AlertDescription>
        </Alert>
      )}

      {metaMaskError && (
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-300">{metaMaskError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Enable Crypto Payments</CardTitle>
          <CardDescription>Accept cryptocurrency payments at your POS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="blockchain-enabled">Enable Blockchain Payments</Label>
            <Switch
              id="blockchain-enabled"
              checked={localSettings.enabled}
              onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {localSettings.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Select
                  value={localSettings.network}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, network: value }))}
                >
                  <SelectTrigger id="network">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mainnet">Mainnet (Production)</SelectItem>
                    <SelectItem value="devnet">Devnet (Testing)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred-token">Preferred Token</Label>
                <Select
                  value={localSettings.preferred_token}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, preferred_token: value }))}
                >
                  <SelectTrigger id="preferred-token">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOL">SOL (Solana)</SelectItem>
                    <SelectItem value="USDC">USDC (Stablecoin)</SelectItem>
                    <SelectItem value="USDT">USDT (Stablecoin)</SelectItem>
                    <SelectItem value="PYUSD">PYUSD (PayPal USD)</SelectItem>
                    <SelectItem value="CUSTOM">Custom Token</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {localSettings.preferred_token === 'CUSTOM' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="custom-token-mint">Custom Token Mint Address</Label>
                    <Input
                      id="custom-token-mint"
                      value={localSettings.custom_token_mint || ''}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, custom_token_mint: e.target.value }))}
                      placeholder="Enter SPL token mint address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-token-decimals">Token Decimals</Label>
                    <Input
                      id="custom-token-decimals"
                      type="number"
                      value={localSettings.custom_token_decimals || 6}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, custom_token_decimals: parseInt(e.target.value) || 6 }))}
                      placeholder="6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-token-rate">Conversion Rate (USD per Token)</Label>
                    <Input
                      id="custom-token-rate"
                      type="number"
                      step="0.01"
                      value={localSettings.custom_token_conversion_rate || 1}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, custom_token_conversion_rate: parseFloat(e.target.value) || 1 }))}
                      placeholder="1.00"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {localSettings.enabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Solana Wallet
              </CardTitle>
              <CardDescription>Configure your Solana wallet for receiving payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="solana-wallet">Solana Wallet Address</Label>
                <Input
                  id="solana-wallet"
                  value={localSettings.solana_wallet_address || ''}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, solana_wallet_address: e.target.value }))}
                  placeholder="Enter your Solana wallet address"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This is where you'll receive Solana Pay payments
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Ethereum Wallet (Optional)
              </CardTitle>
              <CardDescription>Connect MetaMask or enter address manually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eth-address">Ethereum Wallet Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="eth-address"
                    value={localSettings.eth_address || ''}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, eth_address: e.target.value }))}
                    placeholder="0x..."
                  />
                  <Button
                    type="button"
                    onClick={connectMetaMask}
                    disabled={connectingMetaMask}
                    variant="outline"
                  >
                    {connectingMetaMask ? 'Connecting...' : 'Connect MetaMask'}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You can manually enter an address or connect MetaMask
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Bitcoin Wallet (Optional)
              </CardTitle>
              <CardDescription>For Bitcoin payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="btc-address">Bitcoin Wallet Address</Label>
                <Input
                  id="btc-address"
                  value={localSettings.btc_address || ''}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, btc_address: e.target.value }))}
                  placeholder="Enter your Bitcoin address"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Button onClick={handleSave} className="w-full">
        Save Blockchain Settings
      </Button>
    </div>
  );
}