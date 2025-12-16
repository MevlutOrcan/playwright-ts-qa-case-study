export class OrderService {
  /* ===============================
     CREATE ORDER
  =============================== */
  static createOrderPayload(): Record<string, any> {
    return {
      userId: 1001,
      addressId: 3001,
      productDetails: {
        productId: 555,
        quantity: 2,
      },
    };
  }

  static createOrderPayloadWithoutUserId(): Record<string, any> {
    return {
      addressId: 3001,
      productDetails: {
        productId: 555,
        quantity: 2,
      },
    };
  }

  static createOrderPayloadWithInvalidQuantity(quantity: number): Record<string, any> {
    return {
      userId: 1001,
      addressId: 3001,
      productDetails: {
        productId: 555,
        quantity,
      },
    };
  }

  static createOrderPayloadWithNonExistentProduct(): Record<string, any> {
    return {
      userId: 1001,
      addressId: 3001,
      productDetails: {
        productId: 999,
        quantity: 2,
      },
    };
  }

  static parseCreateOrderResponse(response: any): { orderId: string; status: string } {
    return {
      orderId: response.orderId,
      status: response.status,
    };
  }

  /* ===============================
     UPDATE ORDER (PUT)
  =============================== */
  static updateOrderPayload(quantity = 3): Record<string, any> {
    return {
      item: {
        productId: 555,
        quantity,
      },
      shipping: {
        addressId: 3001,
      },
    };
  }

  /* ===============================
     UPDATE STATUS (PATCH)
  =============================== */
  static updateStatusPayload(orderId: string, status: string): Record<string, any> {
    return {
      orderId,
      status,
    };
  }

  /* ===============================
     HELPERS
  =============================== */
  static orderByIdUrl(baseUrl: string, orderId: string): string {
    return `${baseUrl}/${orderId}`;
  }
}
