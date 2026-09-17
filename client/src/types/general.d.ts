type User = {
  id: string;
  user_name?: string;
  email: string;
  role: string;
  gender: "male" | "female" | "other";
};

type ErrResponse = {
  response: {
    data: {
      error: {
        message: string;
        otpType?: string;
        code?: string;
      };
    };
  };
};

// ~ products data type comes over there
type HomePageProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount: string;
  stock: number;
  thumbnail: string | null;
};

type ActiveCollection = {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
};

type CategoriesData = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string;
  createdAt: Date;
};

type CartProduct = {
  cartItemId: number;
  quantity: number;
  addedAt: Date;
  productId: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  discount: string;
  stock: number;
  baseDeliveryCharges: string;
};

type WishlistProduct = {
  wishlistItemId: number;
  addedAt: Date;

  productId: string;
  name: string;
  slug: string;
  thumbnail: string;
  price: number;
  discount: number | null;
  stock: number;
  baseDeliveryCharges: number;
};

type ProductDetails = {
  id: string;
  name: string;
  slug: string;
  productDetails: string | null;

  price: number;
  discount: string;

  isReturnable: boolean;
  returnWindowDays: number;
  warrantyDays: number;
  deliveryGuaranteeDays: number;

  baseDeliveryCharges: string;
  stock: number;

  thumbnail: string | null;
  images: string[] | null;
  attributes: Record<string, unknown> | null;

  isFeatured: boolean;
  createdAt: Date;

  categoryName: string;
  categorySlug: string;
  categoryId: number;
};

type MyDeliveryAddresses = {
  id: string;
  region: string;
  city: string;
  district: string | null;
  street: string | null;
  buildingName: string | null;
  apartmentOrUnit: string | null;
  floor: string | null;
  postalCode: string | null;
  landmark: string | null;
  fullAddress: string;
  recipientName: string;
  recipientPhone: string;
  isDefault: boolean;
  createdAt: string;
};

type AllProductsFilter =
  | "price-ascending"
  | "price-descending"
  | "name-ascending"
  | "name-descending"
  | "date-ascending"
  | "date-descending";

type EstimatedDeliveryChargesResponse = {
  carrier: string;
  amount: number;
  currency: string;
  estimatedDays: number;
};

type VerifiedOrderDetails = {
  orderId: string | number; // Match this to your DB ID type
  status: OrderStatus; // Using a union type for better safety
  currency: string;
  subtotal: number;
  shipping: number;
  tax: number;
  vatRate: number;
  total: number;
  paidAt: Date | string | null;
  trackingNumber: string | null;
  courier: string | null;
  createdAt: Date | string;
};

enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

type MyOrder = {
  id: string; // UUID
  status: OrderStatus;

  // Note: Numeric fields from Postgres usually return as strings
  // in JS to preserve decimal precision (e.g., "129.99")
  totalAmount: string;
  currency: string;

  // Optional/Nullable fields based on your schema
  paymentGateway: string | null;
  trackingNumber: string | null;

  // Timestamps come back as ISO strings from the API
  createdAt: string;
};

enum ReturnStatus {
  NOT_RETURNED = "NOT_RETURNED",
  RETURNED = "RETURNED",
  PARTIALLY_RETURNED = "PARTIALLY_RETURNED",
}

type OrderItem = {
  id: number;
  productId: string;
  productName: string;
  unitPrice: string; // Numeric from DB
  quantity: number;
  vatAmount: string;
  discountPercentage: string | null;
  returnStatus: ReturnStatus;
};

type OrderDetailsResponse = {
  order: {
    id: string;
    status: OrderStatus;
    currency: string;
    subtotalAmount: string;
    shippingAmount: string;
    taxAmount: string;
    totalAmount: string;
    paymentGateway: string | null;
    paymentReference: string | null;
    courierName: string | null;
    trackingNumber: string | null;
    createdAt: string; // ISO Date String
    paidAt: string | null;
    fulfilledAt?: string | null;
  };
  items: OrderItem[];
};

type DeliveryAddressDetails = {
  id: string;
  region: gccRegionEnumZod;
  city: string;
  district: string | null;
  street: string | null;
  buildingName: string | null;
  apartmentOrUnit: string | null;
  floor: string | null;
  postalCode: string | null;
  landmark: string | null;
  fullAddress: string;
  recipientName: string;
  recipientPhone: string;
  isDefault: boolean;
};
