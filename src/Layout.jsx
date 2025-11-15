
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  LogOut,
  Settings,
  Clock,
  AlertCircle,
  Menu,
  HelpCircle,
  Link2
} from 'lucide-react';
// Assuming Home component is located at '@/pages/Home' or a similar path
// This import is necessary for the `return <Home />` statement to be valid.
import Home from '@/pages/Home';
import NotificationBanner from '@/components/notifications/NotificationBanner';

const PUBLIC_PAGES = ['Home', 'PinLogin', 'EmailLogin', 'OnlineMenu', 'CustomerDisplay', 'KitchenDisplay', 'MerchantOnboarding', 'POS', 'PrivacyPolicy', 'TermsOfService', 'About', 'Contact', 'DeviceShop', 'DealerLanding', 'DealerDashboard'];

function PublicLayout({ children }) {
  return <div className="min-h-screen">{children}</div>;
}

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [pinUser, setPinUser] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadAuth();
  }, []);

  // Apply theme on mount and listen for system theme changes
  useEffect(() => {
    const applyTheme = (theme) => {
      const root = document.documentElement;
      const savedTheme = theme || localStorage.getItem('theme') || 'system';
      
      if (savedTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } else if (savedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // Apply theme immediately
    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const savedTheme = localStorage.getItem('theme') || 'system';
      if (savedTheme === 'system') {
        applyTheme('system'); // Re-apply to respect system preference
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const loadAuth = async () => {
    setLoading(true);
    setError(null);
    let foundDealer = null;
    
    try {
      const pinUserJSON = localStorage.getItem('pinLoggedInUser');
      if (pinUserJSON) {
        try {
          const parsedUser = JSON.parse(pinUserJSON);
          setPinUser(parsedUser);
          
          // Load dealer branding if user has dealer_id
          if (parsedUser.dealer_id) {
            try {
              const dealers = await base44.entities.Dealer.filter({ id: parsedUser.dealer_id });
              if (dealers && dealers.length > 0) {
                foundDealer = dealers[0];
              }
            } catch (dealerError) {
              console.warn('Could not load dealer from user dealer_id:', dealerError);
              // Continue without dealer branding
            }
          }
        } catch (e) {
          console.error('Error parsing pinLoggedInUser:', e);
          localStorage.removeItem('pinLoggedInUser');
        }
      }
      
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Load dealer branding from authenticated user if not already loaded
        if (!foundDealer && currentUser.dealer_id) {
          try {
            const dealers = await base44.entities.Dealer.filter({ id: currentUser.dealer_id });
            if (dealers && dealers.length > 0) {
              foundDealer = dealers[0];
            }
          } catch (dealerError) {
            console.warn('Could not load dealer from authenticated user:', dealerError);
            // Continue without dealer branding
          }
        }
      } catch (e) {
        console.log('No authenticated user');
        // This is OK for public pages
      }
      
      // If no dealer from user, check subdomain
      if (!foundDealer) {
        try {
          const hostname = window.location.hostname;
          const subdomain = hostname.split('.')[0];
          
          if (subdomain && !['localhost', 'chainlinkpos', 'www', ''].includes(subdomain.toLowerCase())) {
            try {
              const dealers = await base44.entities.Dealer.filter({ slug: subdomain });
              if (dealers && dealers.length > 0) {
                foundDealer = dealers[0];
              }
            } catch (e) {
              console.log('Could not load dealer from subdomain', e);
              // Continue without dealer branding
            }
          }
        } catch (e) {
          console.warn('Error checking subdomain:', e);
          // Continue without dealer branding
        }
      }
      
      setDealer(foundDealer);
    } catch (error) {
      console.error('Auth load error:', error);
      setError('Unable to load authentication. Please check your connection and try again.');
      // Don't break the app - allow public pages to still load
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogout = () => {
    if (confirm('Are you sure you want to clock out?')) {
      localStorage.removeItem('pinLoggedInUser');
      
      // If user is authenticated via base44 auth, logout from that too
      base44.auth.logout(createPageUrl('Home'));
    }
  };

  const handleExitImpersonation = () => {
    localStorage.removeItem('pinLoggedInUser');
    window.location.href = createPageUrl('SuperAdmin');
  };

  // If user is not authenticated (via base44.auth.me) and is trying to access a non-authentication
  // or non-home page, redirect them to the Home page.
  // Allow root_admin to access dealer pages
  if (!user && !['EmailLogin', 'MerchantOnboarding', 'PinLogin', 'Home', 'PrivacyPolicy', 'TermsOfService', 'About', 'Contact', 'CustomerDisplay', 'KitchenDisplay', 'OnlineMenu', 'DeviceShop', 'DealerOnboarding', 'DealerDashboard', 'DealerLanding'].includes(currentPageName)) {
    return <Home />;
  }

  // Always allow public pages to render, including 'Home' if accessed directly
  if (PUBLIC_PAGES.includes(currentPageName)) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state but don't break the app
  if (error) {
    console.warn('Layout error (non-fatal):', error);
    // Continue rendering with default branding or a fallback UI if desired
  }

  // If no pinUser and not a public page, redirect to login
  if (!pinUser && !PUBLIC_PAGES.includes(currentPageName)) {
    window.location.href = createPageUrl('PinLogin');
    return null;
  }

  const primaryColor = dealer?.primary_color || '#7B2FD6';
  const secondaryColor = dealer?.secondary_color || '#0FD17A';
  const brandName = dealer?.name || 'ChainLINK';
  const logoUrl = dealer?.logo_url;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute top-0 left-0 right-0 h-[10px]" 
             style={{
               background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
               borderTopLeftRadius: '10px',
               borderTopRightRadius: '10px'
             }}>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-[10px]"
             style={{
               background: `linear-gradient(90deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
               borderBottomLeftRadius: '10px',
               borderBottomRightRadius: '10px'
             }}>
        </div>
        
        <div className="absolute top-[10px] bottom-[10px] left-0 w-[10px]"
             style={{background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`}}>
        </div>
        
        <div className="absolute top-[10px] bottom-[10px] right-0 w-[10px]"
             style={{background: `linear-gradient(180deg, ${secondaryColor} 0%, ${primaryColor} 100%)`}}>
        </div>

        <div className="absolute top-0 left-0 w-[10px] h-[10px]" 
             style={{background: primaryColor, borderTopLeftRadius: '10px'}}></div>
        <div className="absolute top-0 right-0 w-[10px] h-[10px]" 
             style={{background: secondaryColor, borderTopRightRadius: '10px'}}></div>
        <div className="absolute bottom-0 left-0 w-[10px] h-[10px]" 
             style={{background: secondaryColor, borderBottomLeftRadius: '10px'}}></div>
        <div className="absolute bottom-0 right-0 w-[10px] h-[10px]" 
             style={{background: primaryColor, borderBottomRightRadius: '10px'}}></div>
      </div>

      <div className="relative min-h-screen" style={{padding: '10px'}}>
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[10px] z-40 shadow-sm"
             style={{marginTop: '-10px', marginLeft: '-10px', marginRight: '-10px'}}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to={createPageUrl('SystemMenu')} className="flex items-center space-x-3">
                  {logoUrl ? (
                    <img src={logoUrl} alt={brandName} className="h-10" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                         style={{background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`}}>
                      <Link2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {brandName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block -mt-1">
                      Point of Sale
                    </span>
                  </div>
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>{currentTime.toLocaleTimeString()}</span>
                </div>

                {pinUser?.is_impersonating && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExitImpersonation}
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Exit Impersonation
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location.href = createPageUrl('Support')}
                  title="Help & Support"
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location.href = createPageUrl('SystemMenu')}
                  title="System Menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>

                {pinUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{pinUser.full_name || 'User'}</div>
                          <div className="text-xs text-gray-500">{pinUser.role || 'user'}</div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = createPageUrl('Settings')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handlePinLogout} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Clock Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="md:hidden flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location.href = createPageUrl('SystemMenu')}
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Notification Banner - Below Nav */}
        {!PUBLIC_PAGES.includes(currentPageName) && <NotificationBanner />}

        <main className="flex-1">
          {children}
        </main>
      </div>

      {!dealer?.settings?.hide_chainlink_branding && !PUBLIC_PAGES.includes(currentPageName) && (
        <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm pointer-events-none z-50">
          Powered by ChainLINK
        </div>
      )}
    </div>
  );
}
