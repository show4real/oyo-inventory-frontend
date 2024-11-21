import React, { useState, useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { Routes } from "../routes";

// pages
import Presentation from "./Presentation";
import Settings from "./Settings";
import BootstrapTables from "./tables/BootstrapTables";
import Signin from "./auth/Signin";
import Signup from "./auth/Signup";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";
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
import Sidebar2 from "../components/Sidebar2";
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
import { SecureRoute } from "../services/SecureRoute";
import { routes } from "../authRoute";
import { settingsRoute } from "../settingsRoute";
import { invoiceRoute } from "../invoiceRoute";
import SingleProduct from "./products/SingleProduct";
import Order from "./purchase/Order";
import Supplier from "./suppliers/Supplier";
import AddInvoice from "./invoice/AddInvoice";
import ClientPayments from "./clients/ClientPayments";
import EditInvoice from "./invoice/EditInvoice";
import StockIndex from "./stocks/StockIndex";
import Stock from "./stocks/Stock";
import { posRoutes } from "../posRoute";
import CreditorPayment from "./creditors/CreditorPayment";
import EditPosItems from "./pos/EditPosItems";
const RouteWithLoader = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          {" "}
          <Preloader show={loaded ? false : true} />{" "}
        </>
      )}
    />
  );
};

/*const getFolder=(src)=>{
  if (src.indexOf('/') === 0){
    src = src.substring(1);
   let t= src.split('/')[0];
    return t;
      
  }
}*/

const RouteWithSidebar = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  // const [authuser,setAuthUser]=useState( JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const localStorageIsSettingsVisible = () => {
    return localStorage.getItem("settingsVisible") === "false" ? false : true;
  };

  const [showSettings, setShowSettings] = useState(
    localStorageIsSettingsVisible
  );

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    localStorage.setItem("settingsVisible", !showSettings);
  };
  const authuser = JSON.parse(localStorage.getItem("user"));

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          {/* <Preloader show={loaded ? false : true} /> */}

          {authuser !== null ? (
            <main className="content">
              {authuser.admin === 1 ? <Sidebar /> : <Sidebar2 />}
              <Component {...props} />
              <Footer
                toggleSettings={toggleSettings}
                showSettings={showSettings}
              />
            </main>
          ) : (
            <Redirect
              to={{
                pathname: "/auth/sign-in",
                state: { from: props.location.pathname },
              }}
            />
          )}
        </>
      )}
    />
  );
};

const RouteNoSidebar = ({ component: Component, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const [authuser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const localStorageIsSettingsVisible = () => {
    return localStorage.getItem("settingsVisible") === "false" ? false : true;
  };

  const [showSettings, setShowSettings] = useState(
    localStorageIsSettingsVisible
  );

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    localStorage.setItem("settingsVisible", !showSettings);
  };

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <Preloader show={loaded ? false : true} />

          {authuser !== null ? (
            <main>
              <Component {...props} />

              <Footer
                toggleSettings={toggleSettings}
                showSettings={showSettings}
              />
            </main>
          ) : (
            <Redirect
              to={{
                pathname: "/auth/sign-in",
                state: { from: props.location.pathname },
              }}
            />
          )}
        </>
      )}
    />
  );
};

const getRoutes = (routes) => {
  return routes.map((prop, key) => {
    return (
      <RouteWithSidebar exact path={prop.path} component={prop.component} />
    );
  });
};

const getNoSideBarRoutes = (routes) => {
  return routes.map((prop, key) => {
    return <RouteNoSidebar exact path={prop.path} component={prop.component} />;
  });
};

export default () => (
  <Switch>
    <Route exact path={Routes.Presentation.path} component={Presentation} />
    <Route exact path={Routes.Signup.path} component={Signup} />
    <Route exact path={Routes.ForgotPassword.path} component={ForgotPassword} />
    <Route exact path={Routes.ResetPassword.path} component={ResetPassword} />
    <Route exact path={Routes.Lock.path} component={Lock} />
    <Route exact path={Routes.NotFound.path} component={NotFoundPage} />
    <Route exact path={Routes.ServerError.path} component={ServerError} />

    {/* pages */}
    <Route exact path={Routes.Signin.path} component={Signin} />
    {getRoutes(routes)}
    {getRoutes(invoiceRoute)}
    {getRoutes(settingsRoute)}
    {getNoSideBarRoutes(posRoutes)}

    <RouteWithSidebar
      exact
      path={Routes.SingleProduct.path}
      component={SingleProduct}
    />
    <RouteWithSidebar
      exact
      path={Routes.AddInvoice.path}
      component={AddInvoice}
    />
    <RouteWithSidebar
      exact
      path={Routes.ClientPayments.path}
      component={ClientPayments}
    />
    <RouteWithSidebar
      exact
      path={Routes.EditInvoice.path}
      component={EditInvoice}
    />
    <RouteWithSidebar
      exact
      path={Routes.CreditorPayment.path}
      component={CreditorPayment}
    />
    <RouteWithSidebar exact path={Routes.Supplier.path} component={Supplier} />
    <RouteWithSidebar exact path={Routes.Order.path} component={Order} />
    <RouteWithSidebar exact path={Routes.Stock.path} component={Stock} />
    <RouteWithSidebar
      exact
      path={Routes.StockIndex.path}
      component={StockIndex}
    />
    <Route exact path={Routes.EditPosItems.path} component={EditPosItems} />

    {/* components */}
    <RouteWithSidebar
      exact
      path={Routes.Accordions.path}
      component={Accordion}
    />
    <RouteWithSidebar exact path={Routes.Alerts.path} component={Alerts} />
    <RouteWithSidebar exact path={Routes.Badges.path} component={Badges} />
    <RouteWithSidebar
      exact
      path={Routes.Breadcrumbs.path}
      component={Breadcrumbs}
    />
    <RouteWithSidebar exact path={Routes.Buttons.path} component={Buttons} />
    <RouteWithSidebar exact path={Routes.Forms.path} component={Forms} />
    <RouteWithSidebar exact path={Routes.Modals.path} component={Modals} />
    <RouteWithSidebar exact path={Routes.Navs.path} component={Navs} />
    <RouteWithSidebar exact path={Routes.Navbars.path} component={Navbars} />
    <RouteWithSidebar
      exact
      path={Routes.Pagination.path}
      component={Pagination}
    />
    <RouteWithSidebar exact path={Routes.Popovers.path} component={Popovers} />
    <RouteWithSidebar exact path={Routes.Progress.path} component={Progress} />
    <RouteWithSidebar exact path={Routes.Tables.path} component={Tables} />
    <RouteWithSidebar exact path={Routes.Tabs.path} component={Tabs} />
    <RouteWithSidebar exact path={Routes.Tooltips.path} component={Tooltips} />
    <RouteWithSidebar exact path={Routes.Toasts.path} component={Toasts} />

    {/* documentation */}
    <RouteWithSidebar
      exact
      path={Routes.DocsOverview.path}
      component={DocsOverview}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsDownload.path}
      component={DocsDownload}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsQuickStart.path}
      component={DocsQuickStart}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsLicense.path}
      component={DocsLicense}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsFolderStructure.path}
      component={DocsFolderStructure}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsBuild.path}
      component={DocsBuild}
    />
    <RouteWithSidebar
      exact
      path={Routes.DocsChangelog.path}
      component={DocsChangelog}
    />

    <Redirect to={Routes.NotFound.path} />
  </Switch>
);
