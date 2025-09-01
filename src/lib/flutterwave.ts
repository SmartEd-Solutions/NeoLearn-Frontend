// Flutterwave integration for African payment processing
export interface FlutterwavePaymentData {
  amount: number;
  currency: string;
  email: string;
  phone_number?: string;
  name: string;
  tx_ref: string;
  redirect_url: string;
  payment_options?: string;
  customer?: {
    email: string;
    phone_number?: string;
    name: string;
  };
  customizations?: {
    title: string;
    description: string;
    logo?: string;
  };
}

export interface FlutterwaveResponse {
  status: string;
  message: string;
  data?: {
    link: string;
  };
}

export class FlutterwaveService {
  private publicKey: string;

  constructor() {
    this.publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
    if (!this.publicKey) {
      throw new Error('Flutterwave public key is not configured');
    }
  }

  // Generate unique transaction reference
  generateTxRef(): string {
    return `edumanager_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize payment
  async initializePayment(paymentData: FlutterwavePaymentData): Promise<FlutterwaveResponse> {
    try {
      const response = await fetch('/api/flutterwave/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Flutterwave payment initialization error:', error);
      throw error;
    }
  }

  // Verify payment
  async verifyPayment(transactionId: string): Promise<any> {
    try {
      const response = await fetch(`/api/flutterwave/verify/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      return await response.json();
    } catch (error) {
      console.error('Flutterwave payment verification error:', error);
      throw error;
    }
  }

  // Create payment for school fees
  createSchoolFeePayment(
    studentId: string,
    studentName: string,
    studentEmail: string,
    amount: number,
    currency: string = 'NGN',
    description: string = 'School Fees Payment'
  ): FlutterwavePaymentData {
    return {
      amount,
      currency,
      email: studentEmail,
      name: studentName,
      tx_ref: this.generateTxRef(),
      redirect_url: `${window.location.origin}/payment/success`,
      payment_options: 'card,banktransfer,ussd,mobilemoney',
      customer: {
        email: studentEmail,
        name: studentName,
      },
      customizations: {
        title: 'EduManager School Fees',
        description,
        logo: `${window.location.origin}/favicon.ico`,
      },
    };
  }
}

export const flutterwaveService = new FlutterwaveService();