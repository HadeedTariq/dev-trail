import z from "zod";

type ProductCreationFormType = z.infer<typeof createProductSchema>;

type AdminSideProducts = {
  id: string;
  nameEn: string;
  slug: string;
  price: number;
  discount: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  categoryId: number | null;
  categoryNameEn: string | null;
};
type AdminUserListItem = {
  id: string;
  userName: string | null;
  email: string | null;
  role: "customer" | "admin";
  source: "general" | string;
  isVerified: boolean | null;
  isActive: boolean | null;
  gender: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AdminSideProductDetails = {
  id: string | number;
  nameEn: string;
  nameAr: string;
  thumbnail: string;
  images: string[];
  slug: string;
  productDetailsEn: string;
  productDetailsAr: string;
  price: number;
  discount: number;
  isReturnable: boolean;
  returnWindowDays: number;
  warrantyDays: number;
  deliveryGuaranteeDays: number;
  baseDeliveryCharges: number;
  stock: number;
  categoryId: string | number;
  attributesEn: Record<string, any>; // Or use a specific type if you have one
  attributesAr: Record<string, any>;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  isFragile: boolean;
};

type AdminCategories = {
  id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
};

type AdminCollection = {
  id: number;
  titleEn: string;
  titleAr: string;
  slug: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  type: "manual" | "automatic";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type AdminEditedCategory = {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  createdAt: string;
};

type ForPublishImageItem = {
  id: string;
  file: File;
  preview: string;
  isUploading: boolean;
  isUploaded: boolean;
  error?: string;
};

type AdminSideCollectionProducts = {
  id: string;
  name: string;
  thumbnail: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
};

type AdminSideProductsForCollection = {
  id: string;
  name: string;
  thumbnail: string | null;
  price: number;
  discount: number | null;
  stock: number;
  categoryId: number;
  categoryName: string;
  isActive: boolean;
  createdAt: Date;
};

type CustomRequestStatus =
  | "pending"
  | "reviewing"
  | "approved"
  | "rejected"
  | "completed";

type CustomProductRequestAdminSide = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productId: string;
  contactNumber: string;
  size: string | null;
  quantity: number;
  customDescription: string;
  estimatedPrice: string | null;
  status: CustomRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  productName: string;
};

type AdminPendingFulfillmentOrder = {
  id: string; // or number, depending on your DB
  userId: string;
  totalAmount: number;
  currency: string;
  region: string;
  status: OrderStatus;

  courierName?: string | null;
  trackingNumber?: string | null;

  createdAt: Date | string;
  paidAt: Date | string | null;
};

type OrderDetails = {
  id: string;
  status: OrderStatus;

  currency: string;

  subtotalAmount: string;
  shippingAmount: string;
  taxAmount: string;
  vatRate: string | null;
  totalAmount: string;

  region: string;

  paymentGateway: string | null;
  paymentReference: string | null;

  courierName: string | null;
  trackingNumber: string | null;

  createdAt: Date;
  paidAt: Date | null;
  fulfilledAt: Date | null;
};

type OrderCustomer = {
  id: string;
  userName: string;
  email: string;
  role: string;
  source: string | null;
  gender: string | null;
};

type ShippingAddress = {
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
};

type OrderItem = {
  id: number;
  productId: string;
  productName: string;
  unitPrice: string;
  vatRate: string | null;
  vatAmount: string | null;
  discountPercentage: string | null;
  quantity: number;
  returnStatus: ReturnStatus;
  returnedQuantity: number;
  currency: string | null;
};

type AdminPendingOrderDetailsResponse = {
  order: OrderDetails;
  customer: OrderCustomer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
};
