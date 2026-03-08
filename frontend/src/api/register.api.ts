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

interface VerifyResult {
  data: {
    status: string;
    message: string;
    data: {
      paid: boolean;
      status: string;
      reference: string;
      amount: number;
      currency: string;
    };
  };
}

interface AttendanceOnlyRegisterResponse {
  data: {
    success: boolean;
    message: string;
    data: {
      registrationId: string;
      paymentReference: string;
      paymentRequired: boolean;
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

export const registerAttendanceOnly = async (userData: RegisterData) => {
  const response: AttendanceOnlyRegisterResponse = await axios.post(
    `${import.meta.env.VITE_API_URL}/registration/attendance-only`,
    userData,
  );
  return response.data;
};

export const verifyPayment = async (reference: string) => {
  const response:VerifyResult = await axios.get(
    `${import.meta.env.VITE_API_URL}/payment/verify/${reference}`,
  );
  return response.data;
};
export interface PaidRegistration {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isMember: boolean;
  branch: string | null;
  physicalCourse: string | null;
  onlineCourses: string[] | null;
  paymentStatus: string;
  paymentReference: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllPaidResponse {
  data: {
    status: boolean;
    message: string;
    data: PaidRegistration[];
  };
}

export const getAllPaidRegistrations = async () => {
  const response: GetAllPaidResponse = await axios.get(
    `${import.meta.env.VITE_API_URL}/registration`,
  );
  return response.data;
};