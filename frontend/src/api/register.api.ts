import axios from "axios";
interface RegisterData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isMember: boolean;
  branch?: string;
  physicalCourse: string;
  onlineCourses: string[];
}

interface RegisterResponse {
  data: {
    status: boolean;
    message: string;
    data: {
      registrationId: string;
      paymentReference: string;
      checkoutUrl: string;
      amount: number;
      currency: string;
    };
  };
}
export const register = async (userData: RegisterData) => {
  const response: RegisterResponse = await axios.post(
    `${import.meta.env.VITE_API_URL}/registration`,
    userData,
  );
  return response.data;
};

export const verifyPayment = async (reference: string) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/payment/verify/${encodeURIComponent(reference)}`
  );
  return response.data;
}