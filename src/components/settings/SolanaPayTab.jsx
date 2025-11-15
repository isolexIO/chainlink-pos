
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const SUPPORTED_TOKENS = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    description: 'Most popular stablecoin on Solana (Recommended)'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    description: 'Widely used stablecoin'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: null,
    decimals: 9,
    description: 'Native Solana token (volatile pricing)'
  },
  {
    symbol: 'CUSTOM',
    name: 'Custom Token',
    mint: '', // Placeholder, will be user-defined
    decimals: 6, // Default, will be user-defined
    description: 'Use your own SPL token'
  }
];

export default function SolanaPayTab({ settings, onUpdate }) {
  const [solanaSettings, setSolanaSettings] = useState({
    enabled: false,
    network: 'mainnet',
    wallet_address: '',
    accepted_token: 'USDC',
    custom_token_mint: '',
    custom_token_symbol: '',
    custom_token_decimals: 6,
    display_in_customer_terminal: true,
    ...settings?.solana_pay
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (settings?.solana_pay) {
      setSolanaSettings({
        enabled: false,
        network: 'mainnet',
        wallet_address: '',
        accepted_token: 'USDC',
        custom_token_mint: '',
        custom_token_symbol: '',
        custom_token_decimals: 6,
        display_in_customer_terminal: true,
        ...settings.solana_pay
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Validate wallet address if enabled
      if (solanaSettings.enabled && !solanaSettings.wallet_address) {
        setMessage({ type: 'error', text: 'Wallet address is required when Solana Pay is enabled' });
        setSaving(false);
        return;
      }

      // Validate custom token settings if custom token is selected
      if (solanaSettings.enabled && solanaSettings.accepted_token === 'CUSTOM') {
        if (!solanaSettings.custom_token_mint) {
          setMessage({ type: 'error', text: 'Custom token mint address is required' });
          setSaving(false);
          return;
        }
        if (!solanaSettings.custom_token_symbol) {
          setMessage({ type: 'error', text: 'Custom token symbol is required' });
          setSaving(false);
          return;
        }
      }

      const updatedSettings = {
        ...settings,
        solana_pay: solanaSettings
      };

      await onUpdate(updatedSettings);
      setMessage({ type: 'success', text: 'Solana Pay settings saved successfully!' });
    } catch (error) {
      console.error('Error saving Solana Pay settings:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const selectedToken = SUPPORTED_TOKENS.find(t => t.symbol === solanaSettings.accepted_token) || SUPPORTED_TOKENS[0];
  const isCustomToken = solanaSettings.accepted_token === 'CUSTOM';

  return (
    <div className="space-y-6">
      {/* Header with Solana Pay Logo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="https://solana.com/src/img/branding/solanaLogoMark.svg" 
                alt="Solana Pay" 
                className="h-12 w-12"
              />
              <div>
                <CardTitle className="text-2xl">Solana Pay</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Accept crypto payments instantly with near-zero fees
                </p>
              </div>
            </div>
            <a
              href="https://solanapay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              Learn More
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-green-50 dark:from-purple-900/20 dark:to-green-900/20 rounded-lg">
            <div>
              <Label htmlFor="enabled" className="text-base font-medium">
                Enable Solana Pay
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Accept crypto payments at checkout
              </p>
            </div>
            <Switch
              id="enabled"
              checked={solanaSettings.enabled}
              onCheckedChange={(checked) => 
                setSolanaSettings({ ...solanaSettings, enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="network">Network</Label>
            <select
              id="network"
              value={solanaSettings.network}
              onChange={(e) => setSolanaSettings({ ...solanaSettings, network: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!solanaSettings.enabled}
            >
              <option value="mainnet">Mainnet (Production)</option>
              <option value="devnet">Devnet (Testing)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Use devnet for testing, mainnet for real transactions
            </p>
          </div>

          <div>
            <Label htmlFor="wallet_address">Your Solana Wallet Address *</Label>
            <Input
              id="wallet_address"
              value={solanaSettings.wallet_address}
              onChange={(e) => setSolanaSettings({ ...solanaSettings, wallet_address: e.target.value })}
              placeholder="e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
              disabled={!solanaSettings.enabled}
              className="mt-1 font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              Payments will be sent to this address
            </p>
          </div>

          <div>
            <Label htmlFor="accepted_token">Accepted Token</Label>
            <select
              id="accepted_token"
              value={solanaSettings.accepted_token}
              onChange={(e) => setSolanaSettings({ ...solanaSettings, accepted_token: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={!solanaSettings.enabled}
            >
              {SUPPORTED_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {selectedToken.description}
              {selectedToken.symbol === 'SOL' && (
                <span className="text-xs text-orange-600 dark:text-orange-400 ml-2">
                  ⚠️ Warning: SOL price fluctuates.
                </span>
              )}
            </p>
          </div>

          {/* Custom Token Settings */}
          {isCustomToken && (
            <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Custom Token Settings</h3>
              
              <div>
                <Label htmlFor="custom_token_mint">Token Mint Address *</Label>
                <Input
                  id="custom_token_mint"
                  value={solanaSettings.custom_token_mint}
                  onChange={(e) => setSolanaSettings({ ...solanaSettings, custom_token_mint: e.target.value })}
                  placeholder="e.g., EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
                  disabled={!solanaSettings.enabled}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  The SPL token mint address (e.g., from Solscan or explorer)
                </p>
              </div>

              <div>
                <Label htmlFor="custom_token_symbol">Token Symbol *</Label>
                <Input
                  id="custom_token_symbol"
                  value={solanaSettings.custom_token_symbol}
                  onChange={(e) => setSolanaSettings({ ...solanaSettings, custom_token_symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., BONK"
                  maxLength={10}
                  disabled={!solanaSettings.enabled}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Display symbol for your token (max 10 characters)
                </p>
              </div>

              <div>
                <Label htmlFor="custom_token_decimals">Token Decimals</Label>
                <Input
                  id="custom_token_decimals"
                  type="number"
                  min="0"
                  max="18"
                  value={solanaSettings.custom_token_decimals}
                  onChange={(e) => setSolanaSettings({ ...solanaSettings, custom_token_decimals: parseInt(e.target.value) || 0 })}
                  disabled={!solanaSettings.enabled}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Number of decimal places for your SPL token (commonly 6 or 9)
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div>
              <Label htmlFor="display_terminal" className="text-base font-medium">
                Show in Customer Terminal
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Display Solana Pay as a payment option
              </p>
            </div>
            <Switch
              id="display_terminal"
              checked={solanaSettings.display_in_customer_terminal}
              onCheckedChange={(checked) =>
                setSolanaSettings({ ...solanaSettings, display_in_customer_terminal: checked })
              }
              disabled={!solanaSettings.enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Why Solana Pay?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-medium mb-1">Instant Settlement</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Transactions confirm in seconds, not days
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-medium mb-1">Near-Zero Fees</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pay fractions of a penny per transaction
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl mb-2">🌐</div>
              <h4 className="font-medium mb-1">Global Reach</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Accept payments from anywhere in the world
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <h4 className="font-medium">Create a Solana Wallet</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download Phantom, Solflare, or any Solana wallet from{' '}
                <a href="https://solana.com/ecosystem/explore?categories=wallet" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                  solana.com/wallets
                </a>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <h4 className="font-medium">Copy Your Wallet Address</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find your wallet address in your Solana wallet app (usually starts with a long string of letters and numbers)
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <h4 className="font-medium">Choose Your Token</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select which token you want to accept (USDC recommended for stable value, or add your custom token)
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
              4
            </div>
            <div>
              <h4 className="font-medium">Enable and Save</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toggle "Enable Solana Pay", paste your wallet address, configure token settings, and save.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button and Messages */}
      {message && (
        <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || (solanaSettings.enabled && !solanaSettings.wallet_address) || (solanaSettings.enabled && isCustomToken && (!solanaSettings.custom_token_mint || !solanaSettings.custom_token_symbol))}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
