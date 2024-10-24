// =========================================================
// * Volt React Dashboard
// =========================================================

// * Product Page: https://themesberg.com/product/dashboard/volt-react
// * Copyright 2021 Themesberg (https://www.themesberg.com)
// * Official Repository: https://github.com/themesberg/volt-react-dashboard
// * License: MIT License (https://themesberg.com/licensing)

// * Designed and coded by https://themesberg.com

// =========================================================

// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. Please contact us to request a removal.

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

// core styles
import "./scss/volt.scss";

// vendor styles
import "@fortawesome/fontawesome-free/css/all.css";
import "react-datetime/css/react-datetime.css";
import "./assets/vendor/@fortawesome/fontawesome-free/css/all.min.css";

import HomePage from "./pages/HomePage";
import ScrollToTop from "./components/ScrollToTop";
import 'react-toastify/dist/ReactToastify.css';



ReactDOM.render(
  <BrowserRouter>
    <ScrollToTop />
  
    <HomePage />  


  </BrowserRouter>
  ,
  document.getElementById("root")
);
