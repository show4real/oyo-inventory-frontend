
  

export let Routes = {
    // pages
    Presentation: { path: "/hello" },
    SingleProduct: { path: "/products/:id" },
    EditInvoice: { path: "/invoice/:id" },
    AddInvoice: { path: "/new/invoice" },
    
    Order: { path: "/purchase_order/:id/product/:product_id" },
    Stock: { path: "/stock/:id/product/:product_id" },
    StockIndex: { path: "/stocks/:id" },
    CreditorPayment: { path: "/creditor/payments/:id" },
    Supplier: { path: "/supplier/:id" },
    DashboardOverview: { path: "/" },
    Transactions: { path: "/transactions" },
    Settings: { path: "/settings" },
    Upgrade: { path: "/upgrade" },
    BootstrapTables: { path: "/tables/bootstrap-tables" },
    Billing: { path: "/examples/billing" },
    Invoice: { path: "/examples/invoice" },
    Signin: { path: "/auth/sign-in" },
    Signup: { path: "/auth/sign-up" },
    ForgotPassword: { path: "/auth/forgot-password" },
    ResetPassword: { path: "/auth/reset-password" },
    Lock: { path: "/examples/lock" },
    NotFound: { path: "/404" },
    ServerError: { path: "/500" },

    // docs
    DocsOverview: { path: "/documentation/overview" },
    DocsDownload: { path: "/documentation/download" },
    DocsQuickStart: { path: "/documentation/quick-start" },
    DocsLicense: { path: "/documentation/license" },
    DocsFolderStructure: { path: "/documentation/folder-structure" },
    DocsBuild: { path: "/documentation/build-tools" },
    DocsChangelog: { path: "/documentation/changelog" },

    // components
    Accordions: { path: "/components/accordions" },
    Alerts: { path: "/components/alerts" },
    Badges: { path: "/components/badges" },
    Widgets: { path: "/widgets" },
    Breadcrumbs: { path: "/components/breadcrumbs" },
    Buttons: { path: "/components/buttons" },
    Forms: { path: "/components/forms" },
    Modals: { path: "/components/modals" },
    Navs: { path: "/components/navs" },
    Navbars: { path: "/components/navbars" },
    Pagination: { path: "/components/pagination" },
    Popovers: { path: "/components/popovers" },
    Progress: { path: "/components/progress" },
    Tables: { path: "/components/tables" },
    Tabs: { path: "/components/tabs" },
    Tooltips: { path: "/components/tooltips" },
    Toasts: { path: "/components/toasts" },
    WidgetsComponent: { path: "/components/widgets" }
};


