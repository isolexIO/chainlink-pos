import POS from './pages/POS';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Marketplace from './pages/Marketplace';
import OnlineMenu from './pages/OnlineMenu';
import OnlineOrders from './pages/OnlineOrders';
import Users from './pages/Users';
import PinLogin from './pages/PinLogin';
import SuperAdmin from './pages/SuperAdmin';
import Inventory from './pages/Inventory';
import CustomerDisplay from './pages/CustomerDisplay';
import KitchenDisplay from './pages/KitchenDisplay';
import DeviceShop from './pages/DeviceShop';
import SystemMenu from './pages/SystemMenu';
import Support from './pages/Support';
import Devices from './pages/Devices';
import Subscriptions from './pages/Subscriptions';
import EmailLogin from './pages/EmailLogin';
import MerchantOnboarding from './pages/MerchantOnboarding';
import Departments from './pages/Departments';
import DeviceMonitor from './pages/DeviceMonitor';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import About from './pages/About';
import Contact from './pages/Contact';
import DealerOnboarding from './pages/DealerOnboarding';
import DealerDashboard from './pages/DealerDashboard';
import RootAdmin from './pages/RootAdmin';
import DealerLanding from './pages/DealerLanding';
import LoyaltyProgram from './pages/LoyaltyProgram';
import __Layout from './Layout.jsx';


export const PAGES = {
    "POS": POS,
    "Orders": Orders,
    "Settings": Settings,
    "Products": Products,
    "Customers": Customers,
    "Reports": Reports,
    "Marketplace": Marketplace,
    "OnlineMenu": OnlineMenu,
    "OnlineOrders": OnlineOrders,
    "Users": Users,
    "PinLogin": PinLogin,
    "SuperAdmin": SuperAdmin,
    "Inventory": Inventory,
    "CustomerDisplay": CustomerDisplay,
    "KitchenDisplay": KitchenDisplay,
    "DeviceShop": DeviceShop,
    "SystemMenu": SystemMenu,
    "Support": Support,
    "Devices": Devices,
    "Subscriptions": Subscriptions,
    "EmailLogin": EmailLogin,
    "MerchantOnboarding": MerchantOnboarding,
    "Departments": Departments,
    "DeviceMonitor": DeviceMonitor,
    "Home": Home,
    "PrivacyPolicy": PrivacyPolicy,
    "TermsOfService": TermsOfService,
    "About": About,
    "Contact": Contact,
    "DealerOnboarding": DealerOnboarding,
    "DealerDashboard": DealerDashboard,
    "RootAdmin": RootAdmin,
    "DealerLanding": DealerLanding,
    "LoyaltyProgram": LoyaltyProgram,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};