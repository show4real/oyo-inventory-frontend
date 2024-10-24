



import React,{Component} from "react";
import { Route, Switch, Redirect,useLocation  } from "react-router-dom";
import { Routes } from "../routes";
import { SecureRoute } from "../services/SecureRoute";

// pages
import Presentation from "./Presentation";
import Upgrade from "./Upgrade";
import DashboardOverview from "./dashboard/DashboardOverview";
import Transactions from "./Transactions";
import Settings from "./Settings";
import BootstrapTables from "./tables/BootstrapTables";
import Signin from "./examples/Signin";
import Signup from "./examples/Signup";
import ForgotPassword from "./examples/ForgotPassword";
import ResetPassword from "./examples/ResetPassword";
import Lock from "./examples/Lock";
import NotFoundPage from "./examples/NotFound";
import ServerError from "./examples/ServerError";

// documentation pages
import DocsOverview from "./documentation/DocsOverview";
import DocsDownload from "./documentation/DocsDownload";
import DocsQuickStart from "./documentation/DocsQuickStart";
import DocsLicense from "./documentation/DocsLicense";
import DocsFolderStructure from "./documentation/DocsFolderStructure";
import DocsBuild from "./documentation/DocsBuild";
import DocsChangelog from "./documentation/DocsChangelog";

// components
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader";

import Accordion from "./components/Accordion";
import Alerts from "./components/Alerts";
import Badges from "./components/Badges";
import Breadcrumbs from "./components/Breadcrumbs";
import Buttons from "./components/Buttons";
import Forms from "./components/Forms";
import Modals from "./components/Modals";
import Navs from "./components/Navs";
import Navbars from "./components/Navbars";
import Pagination from "./components/Pagination";
import Popovers from "./components/Popovers";
import Progress from "./components/Progress";
import Tables from "./components/Tables";
import Tabs from "./components/Tabs";
import Tooltips from "./components/Tooltips";
import Toasts from "./components/Toasts";
 let routes = [
  { path: "/hello", layout: "/admin", component: Presentation },
  { path: "/", layout: "/admin", component: DashboardOverview },
  { path: "/transactions", layout: "/admin", component: Transactions },
  { path: "/settings", layout: "/admin", component: Settings },
  { path: "/upgrade", layout: "/admin", component: Upgrade },
  {
    path: "/tables/bootstrap-tables",
    layout: "/admin",
    component: BootstrapTables,
  },
 
  { path: "/examples/sign-in", layout: "", component: Signin },
  { path: "/examples/sign-up", layout: "", component: Signup },
  {
    path: "/examples/forgot-password",
    layout: "",
    component: ForgotPassword,
  },
  {
    path: "/examples/reset-password",
    layout: "",
    component: ResetPassword,
  },
  { path: "/examples/lock", layout: "/admin", component: Lock },
  { path: "/examples/404", layout: "/admin", component: NotFoundPage },
  { path: "/examples/500", layout: "/admin", component: ServerError },
];

class HomePage extends Component {
  componentDidUpdate(e) {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    this.refs.mainContent.scrollTop = 0;
  }
  
  /*getRoutes = (routes) =>{
     routes.filter(function (e) {
      if(e.layout === "/admin"){
     
        return (
          <SecureRoute
            exact path={e.path}
            component={e.component}
          
          />
        );
     
       
      }
    });  
   
  } */

  
  getRoutes = routes => {
    return routes.map((prop, key) => {
     
      
      
        return (
         
           
          <Route
            exact path={prop.path}
            component={prop.component}
            key={key}
            
          />
        
        );
      
    });
  };
  
  getBrandText = path => {
    for (let i = 0; i < routes.length; i++) {
      if (
        this.props.location.pathname.indexOf(
          routes[i].layout + routes[i].path
        ) !== -1
      ) {
        return routes[i].name;
      }
    }
    return "Brand";
  };
  
  render() {
    
    
    return (
      <>

      
      <Sidebar/>
      
      
        <main className="content">
          <Navbar />
         
          <Switch>
          {this.getRoutes(routes)}
            


            
           
          </Switch>

          <Footer />
        </main>
        
      </>
    );
  }
}

export default HomePage;
