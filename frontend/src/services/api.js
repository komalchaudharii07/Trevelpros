
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// LOGIN
export const loginUser = async (email, password) => {
  const response = await API.post('/auth/login', {
    email,
    password,
  });

  return response.data;
};

// REGISTER
export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

// SEND OTP
export const sendOtp = async (contact) => {
  const response = await API.post('/auth/send-otp', {
    contact,
  });

  return response.data;
};

// VERIFY OTP
export const verifyOtp = async (contact, otp) => {
  const response = await API.post('/auth/verify-otp', {
    contact,
    otp,
  });

  return response.data;
};

// COMPLETE REGISTRATION
export const completeRegistration = async (userData) => {
  const response = await API.post(
    '/auth/complete-registration',
    userData
  );

  return response.data;
};

// FETCH ALL LOCATIONS
export const fetchLocations = async () => {
  try {
    const response = await API.get('/locations');
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching locations:',
      error.response?.data || error.message
    );

    return [];
  }
};

// FETCH LOCATION BY ID
export const fetchLocationById = async (id) => {
  try {
    const response = await API.get(`/locations/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching location:',
      error.response?.data || error.message
    );

    return null;
  }
};

export default API;
