

import {faCreativeCommonsRemix } from "@fortawesome/free-brands-svg-icons";
import SupplierIndex  from "./pages/suppliers/SupplierIndex";
import { faBuilding, faTruck, faTshirt, faWineBottle } from "@fortawesome/free-solid-svg-icons";
import CategoryIndex from "./pages/categories/CategoryIndex";
import BranchIndex from "./pages/branches/BranchIndex";

export let settingsRoute = [

    // { path: "/attributes",component: AttributeIndex, title:"Attributes",icon:faCreativeCommonsRemix },
    // { path: "/suppliers",component: SupplierIndex, title:"Suppliers",icon:faTruck},
    { path: "/branches",component: BranchIndex, title:"Branches",icon:faBuilding},
    // { path: "/brands",component: BrandIndex, title:"Brands",icon:faWineBottle},
    { path: "/categories",component: CategoryIndex, title:"Categories",icon:faCreativeCommonsRemix},

  ];
