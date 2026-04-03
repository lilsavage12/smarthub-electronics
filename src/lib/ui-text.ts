/**
 * UI Text Configuration
 * Centralized location for all user-facing text across the website
 * Keep language simple, clear, and friendly
 */

export const UI_TEXT = {
  // Common Actions
  actions: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    submit: "Submit",
    confirm: "Confirm",
    continue: "Continue",
    back: "Back",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    viewDetails: "View Details",
    close: "Close",
    next: "Next",
    previous: "Previous",
    apply: "Apply",
    reset: "Reset",
    update: "Update",
    create: "Create",
    download: "Download",
    upload: "Upload",
    logout: "Sign Out",
    login: "Sign In",
    register: "Sign Up",
  },

  // Navigation
  nav: {
    home: "Home",
    products: "Products",
    about: "About",
    contact: "Contact",
    cart: "Cart",
    account: "Account",
    orders: "My Orders",
    wishlist: "Wishlist",
    settings: "Settings",
    help: "Help",
  },

  // Customer Dashboard
  dashboard: {
    welcome: "Welcome back",
    myAccount: "My Account",
    myOrders: "My Orders",
    orderHistory: "Order History",
    wishlist: "Wishlist",
    addresses: "Addresses",
    accountSettings: "Account Settings",
    viewAll: "View All",
    recentOrders: "Recent Orders",
    noOrders: "No orders yet",
    startShopping: "Start Shopping",
    totalOrders: "Total Orders",
    pendingOrders: "Pending Orders",
    completedOrders: "Completed Orders",
    wishlistItems: "Wishlist Items",
    orderStatus: "Order Status",
    orderDate: "Order Date",
    orderTotal: "Order Total",
    trackOrder: "Track Order",
  },

  // Checkout
  checkout: {
    title: "Checkout",
    secureCheckout: "Secure Checkout",
    shippingAddress: "Shipping Address",
    paymentMethod: "Payment Method",
    reviewOrder: "Review Your Order",
    placeOrder: "Place Order",
    continueShopping: "Continue Shopping",
    backToCart: "Back to Cart",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    shipping: "Shipping",
    tax: "Tax",
    discount: "Discount",
    total: "Total",
    freeShipping: "Free Shipping",
    applyPromo: "Apply Promo Code",
    promoCode: "Promo Code",
    savedAddresses: "Saved Addresses",
    addNewAddress: "Add New Address",
    useThisAddress: "Use This Address",
    saveAddress: "Save this address to my account",
    step: "Step",
    shippingInfo: "Shipping Information",
    paymentInfo: "Payment Information",
    orderSuccess: "Order Placed Successfully",
    orderConfirmation: "Your order has been received and is being processed",
    orderNumber: "Order Number",
    viewMyOrders: "View My Orders",
  },

  // Forms
  forms: {
    fullName: "Full Name",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Street Address",
    city: "City",
    state: "State",
    zipCode: "Zip Code",
    country: "Country",
    password: "Password",
    confirmPassword: "Confirm Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    displayName: "Display Name",
    message: "Message",
    subject: "Subject",
    companyName: "Company Name",
    
    // Placeholders
    placeholders: {
      fullName: "Enter your full name",
      firstName: "Enter your first name",
      lastName: "Enter your last name",
      email: "your@email.com",
      phone: "Enter your phone number",
      address: "Enter your street address",
      city: "Enter your city",
      zipCode: "Enter zip code",
      password: "Enter your password",
      confirmPassword: "Re-enter your password",
      currentPassword: "Enter current password",
      newPassword: "Enter new password",
      search: "Search...",
      searchProducts: "Search for products...",
      searchOrders: "Search by order number...",
      message: "Enter your message...",
      promoCode: "Enter promo code",
      deliveryInstructions: "Any special delivery instructions?",
    },
  },

  // Messages
  messages: {
    success: {
      saved: "Saved successfully",
      updated: "Updated successfully",
      deleted: "Deleted successfully",
      added: "Added successfully",
      orderPlaced: "Your order has been placed",
      addressSaved: "Address saved",
      profileUpdated: "Profile updated",
      passwordChanged: "Password changed",
      itemAdded: "Item added to cart",
      itemRemoved: "Item removed",
    },
    
    error: {
      general: "Something went wrong. Please try again.",
      required: "Please fill in all required fields",
      invalidEmail: "Please enter a valid email address",
      invalidPhone: "Please enter a valid phone number",
      passwordMismatch: "Passwords do not match",
      passwordShort: "Password must be at least 6 characters",
      loginFailed: "Incorrect email or password",
      connectionError: "Connection error. Please check your internet.",
      outOfStock: "This item is out of stock",
      insufficientStock: "Not enough stock available",
      orderFailed: "Order failed. Please try again.",
    },
    
    confirmation: {
      delete: "Are you sure you want to delete this?",
      logout: "Are you sure you want to sign out?",
      cancel: "Are you sure you want to cancel?",
      removeItem: "Remove this item from your cart?",
    },
    
    info: {
      loading: "Loading...",
      processing: "Processing...",
      saving: "Saving...",
      updating: "Updating...",
      deleting: "Deleting...",
      noResults: "No results found",
      emptyCart: "Your cart is empty",
      emptyWishlist: "Your wishlist is empty",
      noOrders: "You haven't placed any orders yet",
    },
  },

  // Product
  product: {
    price: "Price",
    availability: "Availability",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    lowStock: "Only few left",
    addToCart: "Add to Cart",
    addToWishlist: "Add to Wishlist",
    removeFromWishlist: "Remove from Wishlist",
    quantity: "Quantity",
    description: "Description",
    specifications: "Specifications",
    features: "Features",
    details: "Product Details",
    category: "Category",
    brand: "Brand",
    model: "Model",
    sku: "SKU",
    colors: "Colors",
    storage: "Storage",
    buyNow: "Buy Now",
    viewProduct: "View Product",
  },

  // Cart
  cart: {
    title: "Shopping Cart",
    yourCart: "Your Cart",
    items: "Items",
    item: "Item",
    emptyCart: "Your cart is empty",
    continueShopping: "Continue Shopping",
    proceedToCheckout: "Proceed to Checkout",
    removeItem: "Remove Item",
    updateCart: "Update Cart",
    cartTotal: "Cart Total",
    itemsInCart: "items in cart",
    clearCart: "Clear Cart",
  },

  // Orders
  orders: {
    orderNumber: "Order Number",
    orderDate: "Order Date",
    orderStatus: "Order Status",
    orderTotal: "Order Total",
    orderDetails: "Order Details",
    trackingNumber: "Tracking Number",
    estimatedDelivery: "Estimated Delivery",
    shippingAddress: "Shipping Address",
    paymentMethod: "Payment Method",
    orderItems: "Order Items",
    
    // Order Statuses
    status: {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
      refunded: "Refunded",
      returned: "Returned",
    },
  },

  // Admin Dashboard
  admin: {
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    customers: "Customers",
    inventory: "Inventory",
    reports: "Reports",
    settings: "Settings",
    analytics: "Analytics",
    categories: "Categories",
    discounts: "Discounts",
    
    // Admin Actions
    manageProducts: "Manage Products",
    manageOrders: "Manage Orders",
    manageCustomers: "Manage Customers",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    deleteProduct: "Delete Product",
    updateStatus: "Update Status",
    viewOrder: "View Order",
    stockLevel: "Stock Level",
    lowStock: "Low Stock",
    totalSales: "Total Sales",
    totalRevenue: "Total Revenue",
    recentOrders: "Recent Orders",
  },

  // Account Settings
  settings: {
    accountInfo: "Account Information",
    personalInfo: "Personal Information",
    changePassword: "Change Password",
    notifications: "Notifications",
    privacy: "Privacy",
    security: "Security",
    savedAddresses: "Saved Addresses",
    paymentMethods: "Payment Methods",
    orderHistory: "Order History",
    preferences: "Preferences",
    defaultAddress: "Default Address",
    setAsDefault: "Set as Default",
  },

  // Payment
  payment: {
    selectPayment: "Select Payment Method",
    creditCard: "Credit/Debit Card",
    paypal: "PayPal",
    bankTransfer: "Bank Transfer",
    cashOnDelivery: "Cash on Delivery",
    mobileMoney: "Mobile Money",
    mpesa: "M-PESA",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    cvv: "CVV",
    cardholderName: "Cardholder Name",
    paymentSuccess: "Payment Successful",
    paymentFailed: "Payment Failed",
    processing: "Processing Payment",
    securePayment: "Secure Payment",
  },

  // Footer
  footer: {
    aboutUs: "About Us",
    contactUs: "Contact Us",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    refundPolicy: "Refund Policy",
    shipping: "Shipping Information",
    faq: "FAQ",
    support: "Customer Support",
    followUs: "Follow Us",
    newsletter: "Newsletter",
    subscribeNewsletter: "Subscribe to our newsletter",
    enterEmail: "Enter your email",
    subscribe: "Subscribe",
    allRightsReserved: "All rights reserved",
  },

  // Time
  time: {
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "days ago",
    weeksAgo: "weeks ago",
    monthsAgo: "months ago",
    justNow: "Just now",
  },

  // Status
  status: {
    active: "Active",
    inactive: "Inactive",
    enabled: "Enabled",
    disabled: "Disabled",
    available: "Available",
    unavailable: "Unavailable",
    yes: "Yes",
    no: "No",
  },
} as const

// Helper function to get nested text values
export function getText(path: string): string {
  const keys = path.split('.')
  let value: any = UI_TEXT
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return path // Return the path if not found
    }
  }
  
  return typeof value === 'string' ? value : path
}

// Export for easy access
export default UI_TEXT
