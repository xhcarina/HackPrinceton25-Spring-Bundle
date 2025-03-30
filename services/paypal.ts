import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { createDepositActivity } from './activity';

// PayPal Sandbox credentials
const clientId = 'AdqPLeYaL9BbKBe4dg7JdW54VyGIpAvnJ7nFIMBvjFa517ZEQ1ZykPMwOkwbvZz4rxE3iwAGkdRlCSOx';
const clientSecret = 'EFf8mcSIUYBgiYERnzmBp83JHnygAujvQxNT1rfhbbOTUaX5YtjbRAbI4YcfM5wE7FZdDMj3D_YnFLJ6';

// Add this function to test credentials
export const testPayPalCredentials = () => {
  if (!clientId || !clientSecret) {
    console.error('PayPal credentials are missing.');
    throw new Error('PayPal credentials are not configured');
  }
  return true;
};

const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  description: string;
  userId: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  approvalUrl?: string;
  error?: string;
}

export interface CaptureResponse {
  success: boolean;
  paymentId?: string;
  amount?: number;
  status?: string;
  error?: string;
}

function base64Encode(str: string): string {
  return btoa(str);
}

async function getAccessToken(): Promise<string> {
  try {
    const auth = base64Encode(`${clientId}:${clientSecret}`);
    console.log('Attempting to get PayPal access token...');
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    console.log('PayPal token response status:', response.status);
    const data = await response.json();
    console.log('PayPal token response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`Failed to get PayPal access token: ${data.error_description || data.message || 'Unknown error'}`);
    }

    return data.access_token;
  } catch (error: any) {
    console.error('Detailed PayPal token error:', error);
    throw error;
  }
}

export const createPayment = async (request: CreatePaymentRequest): Promise<PaymentResponse> => {
  try {
    console.log('Creating PayPal payment with request:', JSON.stringify(request, null, 2));
    const accessToken = await getAccessToken();
    
    // Get the base URL for deep linking
    const baseUrl = 'http://localhost:8082';
    console.log('Base URL:', baseUrl);

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: request.currency,
          value: request.amount.toFixed(2),
        },
        description: request.description,
        custom_id: request.userId,
      }],
      application_context: {
        brand_name: 'Bundle',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${baseUrl}/(payment)/payment/success`,
        cancel_url: `${baseUrl}/(app)`,
        shipping_preference: 'NO_SHIPPING'
      },
    };

    console.log('Sending PayPal order data:', JSON.stringify(orderData, null, 2));
    
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': Math.random().toString(36).substring(7),
      },
      body: JSON.stringify(orderData),
    });

    console.log('PayPal order response status:', response.status);
    const order = await response.json();
    console.log('PayPal order response:', JSON.stringify(order, null, 2));

    if (!response.ok) {
      const errorMessage = order.details?.[0]?.description || order.message || 'Failed to create payment';
      console.error('PayPal order creation failed:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // Get the approval URL from the order
    const approvalUrl = order.links.find(
      (link: any) => link.rel === 'approve'
    )?.href;

    if (!approvalUrl) {
      console.error('No approval URL found in PayPal response:', order);
      throw new Error('No approval URL found in PayPal response');
    }

    return {
      success: true,
      paymentId: order.id,
      approvalUrl,
    };
  } catch (error: any) {
    console.error('PayPal payment creation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment',
    };
  }
};

export const capturePayment = async (orderId: string): Promise<CaptureResponse> => {
  try {
    console.log('Capturing PayPal payment for order:', orderId);
    const accessToken = await getAccessToken();
    
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': Math.random().toString(36).substring(7),
      },
    });

    console.log('PayPal capture response status:', response.status);
    const capture = await response.json();
    console.log('PayPal capture response:', JSON.stringify(capture, null, 2));

    if (!response.ok) {
      const errorMessage = capture.details?.[0]?.description || capture.message || 'Failed to capture payment';
      console.error('PayPal capture failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const amount = parseFloat(capture.purchase_units[0].payments.captures[0].amount.value);
    
    return {
      success: true,
      paymentId: capture.id,
      amount,
      status: capture.status,
    };
  } catch (error: any) {
    console.error('PayPal payment capture error:', error);
    return {
      success: false,
      error: error.message || 'Failed to capture payment',
    };
  }
};

export const handlePaymentSuccess = async (orderId: string): Promise<CaptureResponse> => {
  try {
    console.log('Handling payment success for order:', orderId);
    
    // Capture the payment
    const captureResponse = await capturePayment(orderId);
    console.log('Capture response:', captureResponse);

    if (!captureResponse.success) {
      console.error('Failed to capture payment:', captureResponse.error);
      return captureResponse;
    }

    // Get the user ID from the custom_id field
    const accessToken = await getAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const orderDetails = await response.json();
    const userId = orderDetails.purchase_units[0].custom_id;

    // Create a deposit activity
    if (userId && captureResponse.amount) {
      try {
        await createDepositActivity(
          userId,
          captureResponse.amount,
          'completed',
          captureResponse.paymentId
        );
        console.log('Deposit activity created successfully');
      } catch (error) {
        console.error('Error creating deposit activity:', error);
      }
    }

    return captureResponse;
  } catch (error: any) {
    console.error('Error handling payment success:', error);
    return {
      success: false,
      error: error.message || 'Failed to handle payment success',
    };
  }
}; 