export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

import * as AdminBanners from '@/server/api-handlers/admin/banners/route';
import * as AdminOrders from '@/server/api-handlers/admin/orders/route';
import * as AdminOrderMarkPaid from '@/server/api-handlers/admin/orders/[id]/mark-paid/route';
import * as AdminOrderStatus from '@/server/api-handlers/admin/orders/[id]/status/route';
import * as AdminProducts from '@/server/api-handlers/admin/products/route';
import * as AdminProductsBulkUpload from '@/server/api-handlers/admin/products/bulk-upload/route';
import * as AdminProductsImagePipeline from '@/server/api-handlers/admin/products/image-pipeline/route';
import * as AdminProductsUploadImage from '@/server/api-handlers/admin/products/upload-image/route';
import * as AdminProductsUploadPhoto from '@/server/api-handlers/admin/products/upload-photo/route';
import * as AdminSettings from '@/server/api-handlers/admin/settings/route';
import * as AdminSlipOrders from '@/server/api-handlers/admin/slip-orders/route';
import * as AdminSlipOrderDetail from '@/server/api-handlers/admin/slip-orders/[id]/route';
import * as AdminSlipOrderAssignRider from '@/server/api-handlers/admin/slip-orders/[id]/assign-rider/route';
import * as AdminSlipOrderConfirmCall from '@/server/api-handlers/admin/slip-orders/[id]/confirm-call/route';
import * as AdminSlipOrderPack from '@/server/api-handlers/admin/slip-orders/[id]/pack/route';
import * as AdminSlips from '@/server/api-handlers/admin/slips/route';
import * as AdminSlipDetail from '@/server/api-handlers/admin/slips/[id]/route';
import * as AdminStaff from '@/server/api-handlers/admin/staff/route';
import * as AuthRoleCheck from '@/server/api-handlers/auth/role-check/route';
import * as Banners from '@/server/api-handlers/banners/route';
import * as CheckoutInitiate from '@/server/api-handlers/checkout/initiate/route';
import * as CreateOrder from '@/server/api-handlers/create-order/route';
import * as LocationDistance from '@/server/api-handlers/location/distance/route';
import * as LocationReverseGeocode from '@/server/api-handlers/location/reverse-geocode/route';
import * as LocationSearch from '@/server/api-handlers/location/search/route';
import * as NotificationsSubscribe from '@/server/api-handlers/notifications/subscribe/route';
import * as NotificationsTestAdminPush from '@/server/api-handlers/notifications/test-admin-push/route';
import * as NotificationsVapidKey from '@/server/api-handlers/notifications/vapid-key/route';
import * as Orders from '@/server/api-handlers/orders/route';
import * as OrdersDetail from '@/server/api-handlers/orders/[id]/route';
import * as OrdersPaymentStatus from '@/server/api-handlers/orders/[id]/payment-status/route';
import * as PaymentCallback from '@/server/api-handlers/payment/callback/route';
import * as PaymentTestSimulate from '@/server/api-handlers/payment/test-simulate/route';
import * as PaymentVerify from '@/server/api-handlers/payment/verify/route';
import * as PaymentWebhook from '@/server/api-handlers/payment/webhook/route';
import * as Products from '@/server/api-handlers/products/route';
import * as RiderOrdersArrived from '@/server/api-handlers/rider/orders/[id]/arrived/route';
import * as RiderOrdersVerifyOtp from '@/server/api-handlers/rider/orders/[id]/verify-otp/route';
import * as SlipOrdersAddItems from '@/server/api-handlers/slip-orders/[id]/add-items/route';
import * as SlipOrdersPay from '@/server/api-handlers/slip-orders/[id]/pay/route';
import * as SlipsImage from '@/server/api-handlers/slips/image/route';
import * as SlipsUpload from '@/server/api-handlers/slips/upload/route';
import * as StoreSettings from '@/server/api-handlers/store/settings/route';
import * as VerifyPayment from '@/server/api-handlers/verify-payment/route';

interface RouteContext {
  params: Promise<{ route?: string[] }>;
}

function createParamsContext(paramsObj: Record<string, string>) {
  const promise = Promise.resolve(paramsObj);
  return {
    params: Object.assign(promise, paramsObj),
  };
}

async function handleRequest(req: NextRequest, { params }: RouteContext) {
  const resolved = await params;
  const segments = resolved.route || [];
  const method = req.method.toUpperCase();

  // Root /api
  if (segments.length === 0) {
    if (method === 'GET') {
      return NextResponse.json({ status: 'ok', name: 'G1mart API' });
    }
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const p0 = segments[0];
  const p1 = segments[1];
  const p2 = segments[2];
  const p3 = segments[3];

  let handlerModule: any = null;
  let handlerContext: any = { params: Promise.resolve({}) };

  if (p0 === 'admin') {
    if (p1 === 'banners') handlerModule = AdminBanners;
    else if (p1 === 'orders') {
      if (segments.length === 2) handlerModule = AdminOrders;
      else if (segments.length === 4 && p3 === 'mark-paid') {
        handlerModule = AdminOrderMarkPaid;
        handlerContext = createParamsContext({ id: p2 });
      } else if (segments.length === 4 && p3 === 'status') {
        handlerModule = AdminOrderStatus;
        handlerContext = createParamsContext({ id: p2 });
      }
    } else if (p1 === 'products') {
      if (segments.length === 2) handlerModule = AdminProducts;
      else if (p2 === 'bulk-upload') handlerModule = AdminProductsBulkUpload;
      else if (p2 === 'image-pipeline') handlerModule = AdminProductsImagePipeline;
      else if (p2 === 'upload-image') handlerModule = AdminProductsUploadImage;
      else if (p2 === 'upload-photo') handlerModule = AdminProductsUploadPhoto;
    } else if (p1 === 'settings') handlerModule = AdminSettings;
    else if (p1 === 'slip-orders') {
      if (segments.length === 2) handlerModule = AdminSlipOrders;
      else if (segments.length === 3) {
        handlerModule = AdminSlipOrderDetail;
        handlerContext = createParamsContext({ id: p2 });
      } else if (segments.length === 4 && p3 === 'assign-rider') {
        handlerModule = AdminSlipOrderAssignRider;
        handlerContext = createParamsContext({ id: p2 });
      } else if (segments.length === 4 && p3 === 'confirm-call') {
        handlerModule = AdminSlipOrderConfirmCall;
        handlerContext = createParamsContext({ id: p2 });
      } else if (segments.length === 4 && p3 === 'pack') {
        handlerModule = AdminSlipOrderPack;
        handlerContext = createParamsContext({ id: p2 });
      }
    } else if (p1 === 'slips') {
      if (segments.length === 2) handlerModule = AdminSlips;
      else if (segments.length === 3) {
        handlerModule = AdminSlipDetail;
        handlerContext = createParamsContext({ id: p2 });
      }
    } else if (p1 === 'staff') handlerModule = AdminStaff;
  } else if (p0 === 'auth') {
    if (p1 === 'role-check') handlerModule = AuthRoleCheck;
  } else if (p0 === 'banners') {
    handlerModule = Banners;
  } else if (p0 === 'checkout') {
    if (p1 === 'initiate') handlerModule = CheckoutInitiate;
  } else if (p0 === 'create-order') {
    handlerModule = CreateOrder;
  } else if (p0 === 'location') {
    if (p1 === 'distance') handlerModule = LocationDistance;
    else if (p1 === 'reverse-geocode') handlerModule = LocationReverseGeocode;
    else if (p1 === 'search') handlerModule = LocationSearch;
  } else if (p0 === 'notifications') {
    if (p1 === 'subscribe') handlerModule = NotificationsSubscribe;
    else if (p1 === 'test-admin-push') handlerModule = NotificationsTestAdminPush;
    else if (p1 === 'vapid-key') handlerModule = NotificationsVapidKey;
  } else if (p0 === 'orders') {
    if (segments.length === 1) handlerModule = Orders;
    else if (segments.length === 2) {
      handlerModule = OrdersDetail;
      handlerContext = createParamsContext({ id: p1 });
    } else if (segments.length === 3 && p2 === 'payment-status') {
      handlerModule = OrdersPaymentStatus;
      handlerContext = createParamsContext({ id: p1 });
    }
  } else if (p0 === 'payment') {
    if (p1 === 'callback' || p1 === 'razorpay-callback') handlerModule = PaymentCallback;
    else if (p1 === 'test-simulate') handlerModule = PaymentTestSimulate;
    else if (p1 === 'verify') handlerModule = PaymentVerify;
    else if (p1 === 'webhook') handlerModule = PaymentWebhook;
  } else if (p0 === 'products') {
    handlerModule = Products;
  } else if (p0 === 'rider') {
    if (p1 === 'orders' && segments.length === 4) {
      if (p3 === 'arrived') {
        handlerModule = RiderOrdersArrived;
        handlerContext = createParamsContext({ id: p2 });
      } else if (p3 === 'verify-otp') {
        handlerModule = RiderOrdersVerifyOtp;
        handlerContext = createParamsContext({ id: p2 });
      }
    }
  } else if (p0 === 'slip-orders') {
    if (segments.length === 3) {
      if (p2 === 'add-items') {
        handlerModule = SlipOrdersAddItems;
        handlerContext = createParamsContext({ id: p1 });
      } else if (p2 === 'pay') {
        handlerModule = SlipOrdersPay;
        handlerContext = createParamsContext({ id: p1 });
      }
    }
  } else if (p0 === 'slips') {
    if (p1 === 'image') handlerModule = SlipsImage;
    else if (p1 === 'upload') handlerModule = SlipsUpload;
  } else if (p0 === 'store') {
    if (p1 === 'settings') handlerModule = StoreSettings;
  } else if (p0 === 'verify-payment') {
    handlerModule = VerifyPayment;
  }

  if (!handlerModule) {
    return NextResponse.json(
      { error: `API route not found: /api/${segments.join('/')}` },
      { status: 404 }
    );
  }

  const handler = handlerModule[method];
  if (typeof handler !== 'function') {
    return NextResponse.json(
      { error: `Method ${method} not allowed on /api/${segments.join('/')}` },
      { status: 405 }
    );
  }

  return handler(req, handlerContext);
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  return handleRequest(req, ctx);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return handleRequest(req, ctx);
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  return handleRequest(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return handleRequest(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return handleRequest(req, ctx);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    },
  });
}
