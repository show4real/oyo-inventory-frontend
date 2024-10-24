import Presentation from "./pages/Presentation";
import Upgrade from "./pages/Upgrade";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import BootstrapTables from "./pages/tables/BootstrapTables";
import Index from "./pages/users/Index";
import Product from "./pages/products/Product";
import StockIndex from "./pages/stock/StockIndex";
import SingleProduct from "./pages/products/SingleProduct";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Lock from "./pages/examples/Lock";
import NotFoundPage from "./pages/examples/NotFound";
import ServerError from "./pages/examples/ServerError";
import { faBook, faBoxOpen, faChartPie, faShoppingBag,faCog, faFileAlt, faHandHoldingUsd, faIcons, faSignOutAlt, faTable, faTimes, faUsers, faTruck, faTruckLoading, faTruckMoving, faThermometer, faRuler, faCalculator, faFileInvoice, faHome } from "@fortawesome/free-solid-svg-icons";
import { faProductHunt, faSalesforce } from "@fortawesome/free-brands-svg-icons";
import SupplierIndex from "./pages/suppliers/SupplierIndex";
import StockIndex2 from "./pages/stock/StockIndex2";
import SalesOrderIndex from "./pages/stock/SalesOrderIndex";
import PosOrderIndex from "./pages/pos/PosOrderIndex";
import InvoiceIndex from "./pages/invoice/InvoiceIndex";
import PosTransaction from "./pages/pos/PosTransaction";



export let routes = [

    { path: "/",component:DashboardOverview, title:"Dashboard",icon:faHome },  
    { path: "/pos",component: PosOrderIndex, title:"POS",icon:faCalculator },
  
    { path: "/invoices", component: InvoiceIndex, title:"Invoices",icon:faFileInvoice },
    { path: "/pos_transactions",component: PosTransaction, title:"Transactions",icon:faCalculator },
  ];
