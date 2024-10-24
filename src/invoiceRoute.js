
import {  faUsers,  faFileInvoice, faHome } from "@fortawesome/free-solid-svg-icons";

import InvoiceIndex from "./pages/invoice/InvoiceIndex";
import ClientIndex from "./pages/clients/ClientIndex";



export let invoiceRoute = [

   
  
    { path: "/invoices", component: InvoiceIndex, title:"Invoices",icon:faFileInvoice },
    { path: "/clients", component: ClientIndex, title:"Clients",icon:faUsers },
  ];
