import axios from 'axios';

// Initialize payment with Chapa
export const initializeChapaPayment = async (paymentData) => {
    try {
        if (!process.env.CHAPA_TEST_SECRET_KEY) {
            throw new Error('CHAPA_TEST_SECRET_KEY is not configured');
        }

        console.log('Sending payment data to Chapa:', paymentData); // Debug log

        const response = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.CHAPA_TEST_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Chapa API Response:', response.data); // Debug log

        if (response.data.status === 'success') {
            return {
                success: true,
                data: response.data
            };
        } else {
            throw new Error(response.data.message || 'Payment initialization failed');
        }

    } catch (error) {
        console.error('Chapa Error Details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Payment initialization failed'
        };
    }
};

// Verify the payment with Chapa
export const verifyChapaPayment = async (tx_ref) => {
    try {
        const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
            headers: {
                Authorization: `Bearer ${process.env.CHAPA_TEST_SECRET_KEY}`,
            },
        });

        if (response.data.status === "success") {
            return { success: true, data: response.data.data };
        } else {
            throw new Error(response.data.message || "Payment verification failed");
        }
    } catch (error) {
        console.error("Error verifying Chapa payment:", error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

