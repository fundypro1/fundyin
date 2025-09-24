// src/services/AuthService.js
import axios from "axios";

const API_URL = "http://localhost:8000"; // ⚠️ change for production

// ============ AXIOS INSTANCE ============
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor – picks correct token based on endpoint
apiClient.interceptors.request.use(
  (config) => {
    let token = null;

    // Admin routes
    if (config.url.startsWith("/admin")) {
      token = localStorage.getItem("admin_token");
    } else {
      token = localStorage.getItem("access_token");
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Check if this is an admin request
      if (originalRequest.url.includes('/admin/')) {
        // Handle admin authentication
        const adminToken = localStorage.getItem('admin_token');
        if (adminToken) {
          // Try to refresh admin token or redirect to admin login
          AuthService.logoutAdmin();
          window.location.href = '/admin';
        }
      } else {
        // Handle regular user authentication
        // ... existing refresh logic
      }
    }
    
    return Promise.reject(error);
  }
);

// Response interceptor – refreshes user token if expired
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const newAccessToken = response.data.access_token;
          localStorage.setItem("access_token", newAccessToken);

          // Retry original request with new token
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          AuthService.logout();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        AuthService.logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ============ AUTH SERVICE ============
const AuthService = {
  apiClient, // export instance for direct use

  // ----- USER AUTH -----
  register: async (userData) => {
    const response = await apiClient.post("/user/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await apiClient.post("/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const data = response.data;

    // Save user session
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
    if (data.user_id) localStorage.setItem("user_id", data.user_id);
    if (data.username) localStorage.setItem("username", data.username);
    if (data.expires_at) localStorage.setItem("expires_at", data.expires_at);

    return data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const data = response.data;
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
    if (data.expires_at) localStorage.setItem("expires_at", data.expires_at);

    return data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("expires_at");
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("expires_at");
    if (!token) return false;
    if (expiresAt) return new Date(expiresAt) > new Date();
    return true;
  },

  getCurrentUser: async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return null;
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`/user/me`, userData);
    return response.data;
  },

  // ----- ADMIN AUTH -----
  loginAdmin: async (credentials) => {
    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await apiClient.post("/admin/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const data = response.data;

    // Save admin session
    localStorage.setItem("admin_token", data.access_token);
    localStorage.setItem("admin_id", data.admin_id);
    localStorage.setItem("admin_username", data.username);
    localStorage.setItem("admin_role", data.role);
    localStorage.setItem("admin_expires_at", data.expires_at);

    return data;
  },

  isAdminAuthenticated: () => {
    return !!localStorage.getItem("admin_token");
  },

  getCurrentAdmin: async () => {
    const adminId = localStorage.getItem("admin_id");
    if (!adminId) return null;
    const response = await apiClient.get(`/admin/${adminId}`);
    return response.data;
  },

  logoutAdmin: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_username");
    localStorage.removeItem("admin_role");
    localStorage.removeItem("admin_expires_at");
  },

  // ----- FILE UPLOAD -----
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/deposits/upload/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  // ----- USER DEPOSITS -----
  createDeposit: async (depositData) => {
    const response = await apiClient.post("/deposits/deposit", depositData);
    return response.data;
  },

  getMyDeposits: async ({ page = 1, size = 10, status = null } = {}) => {
    const params = { page, size };
    if (status) params.status_filter = status;
    const response = await apiClient.get("/deposits/", { params });
    return response.data;
  },

  getDepositById: async (depositId) => {
    const response = await apiClient.get(`/deposits/${depositId}`);
    return response.data;
  },

  updateDeposit: async (depositId, updateData) => {
    const response = await apiClient.put(`/deposits/${depositId}`, updateData);
    return response.data;
  },

  cancelDeposit: async (depositId) => {
    const response = await apiClient.delete(`/deposits/${depositId}`);
    return response.data;
  },

  getUserDepositsById: async (userId, { page = 1, size = 5 } = {}) => {
    const response = await apiClient.get(`/deposits/users/${userId}/deposits`, {
      params: { page, size },
    });
    return response.data;
  },

  // ----- USER WITHDRAWALS -----
  createWithdrawal: async (withdrawalData) => {
    const response = await apiClient.post("/withdrawals/", withdrawalData);
    return response.data;
  },

  getMyWithdrawals: async () => {
    const response = await apiClient.get("/withdrawals/my");
    return response.data;
  },

  getWithdrawalAdmin: async (withdrawalId) => {
    const response = await apiClient.get(`/admin/withdrawals/${withdrawalId}`);
    return response.data;
  },

  // ----- ADMIN WITHDRAWALS -----
  approveWithdrawal: async (withdrawalId, approvalData = {}) => {
    const response = await apiClient.post(`/admin/${withdrawalId}/withdraw-approve`,approvalData);
    return response.data;
  },

  rejectWithdrawal: async (withdrawalId, rejectionData = {}) => {
    const response = await apiClient.post(
      `/admin/${withdrawalId}/withdraw-reject`,
      rejectionData
    );
    return response.data;
  },

  completeWithdrawal: async (withdrawalId) => {
    const response = await apiClient.post(`/admin/${withdrawalId}/complete`);
    return response.data;
  },

  // ----- ADMIN USERS -----
  createAdmin: async (adminData) => {
    const response = await apiClient.post("/admin/create_admin", adminData);
    return response.data;
  },

  getAllUsers: async ({ page = 1, size = 20, search = null } = {}) => {
    const params = { page, size };
    if (search) params.search = search;
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  getCounts: async () => {
    const adminToken = localStorage.getItem('admin_token');
    console.log('Admin token exists:', !!adminToken);
    console.log('Token length:', adminToken ? adminToken.length : 0);
    
    if (!adminToken) {
      throw new Error('Admin authentication required');
    }
    
    try {
      const response = await apiClient.get("/admin/stats", {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.log('Full error response:', error.response);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
      throw error;
    }
  },

  

  // ----- ADMIN DEPOSITS -----
  getAllDeposits: async ({
    page = 1,
    size = 20,
    status = null,
    userId = null,
    amountMin = null,
    amountMax = null,
    dateFrom = null,
    dateTo = null,
  } = {}) => {
    const params = { page, size };
    if (status) params.status_filter = status;
    if (userId) params.user_id = userId;
    if (amountMin) params.amount_min = amountMin;
    if (amountMax) params.amount_max = amountMax;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;

    const response = await apiClient.get("/admin/deposit", { params });
    return response.data;
  },

  getDepositAdmin: async (depositId) => {
    const response = await apiClient.get(`/admin/deposit/${depositId}`);
    return response.data;
  },

  approveDeposit: async (depositId, approvalData = {}) => {
    const response = await apiClient.post(`/admin/${depositId}/approve`, approvalData);
    return response.data;
  },

  rejectDeposit: async (depositId, rejectionData = {}) => {
    const response = await apiClient.post(`/admin/${depositId}/reject`, rejectionData);
    return response.data;
  },

  bulkApproveDeposits: async (depositIds, approvalData = {}) => {
    const bulkData = { deposit_ids: depositIds, ...approvalData };
    const response = await apiClient.post("/admin/bulk-approve", bulkData);
    return response.data;
  },

  bulkRejectDeposits: async (depositIds, rejectionData = {}) => {
    const bulkData = { deposit_ids: depositIds, ...rejectionData };
    const response = await apiClient.post("/admin/bulk-reject", bulkData);
    return response.data;
  },

  // ----- PURCHASES -----
  createPurchase: async (purchaseData) => {
    const response = await apiClient.post("/purchases/buy", purchaseData);
    return response.data;
  },

  getMyPurchases: async ({ page = 1, size = 10, status = null, active_only = false } = {}) => {
    const params = { page, size, active_only };
    if (status) params.status_filter = status;
    const response = await apiClient.get("/purchases/", { params });
    return response.data;
  },

  getPurchaseById: async (purchaseId) => {
    const response = await apiClient.get(`/purchases/${purchaseId}`);
    return response.data;
  },

  getActivePurchasesSummary: async () => {
    const response = await apiClient.get("/purchases/active/summary");
    return response.data;
  },

  // ----- EARNINGS -----
  getPurchaseEarnings: async (purchaseId) => {
    const response = await apiClient.get(`/purchases/${purchaseId}/earnings`);
    return response.data;
  },

  getAllEarnings: async ({ limit = 50, status = null, dateFrom = null, dateTo = null } = {}) => {
    const params = { limit };
    if (status) params.status_filter = status;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    const response = await apiClient.get("/purchases/earnings/all", { params });
    return response.data;
  },

  getEarningsSummary: async () => {
    const response = await apiClient.get("/purchases/earnings/summary");
    return response.data;
  },

  creditPendingEarnings: async () => {
    const response = await apiClient.post("/purchases/credit-pending-earnings");
    return response.data;
  },

  getEarningsStatus: async () => {
    const response = await apiClient.get("/purchases/earnings-status");
    return response.data;
  },

  createEarning: async (earningData) => {
    const response = await apiClient.post("/earnings/create_earning", earningData);
    return response.data;
  },

  getEarnings: async () => {
    const response = await apiClient.get("/earnings/my-earns");
    return response.data;
  },

  getTotalEarnings: async () => {
    const response = await apiClient.get("/earnings/my-total-earn");
    return response.data;
  },

  creditTotalEarnings: async (earningData) => {
    const response = await apiClient.post("/earnings/credit-total-earnings", earningData);
    return response.data;
  },

  // ----- HELPERS -----
  isAdmin: () => {
    const role = localStorage.getItem("admin_role");
    return role === "ADMIN" || role === "SUPERADMIN";
  },

  getUserRole: () => {
    return localStorage.getItem("user_role") || "user";
  },

  formatErrorMessage: (error) => {
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        return error.response.data.detail.map((err) => err.msg || err.message || err).join(", ");
      }
      return error.response.data.detail;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred";
  },

  isTokenExpired: () => {
    const expiresAt = localStorage.getItem("expires_at");
    if (!expiresAt) return false;
    return new Date(expiresAt) <= new Date();
  },

  getTokenTimeRemaining: () => {
    const expiresAt = localStorage.getItem("expires_at");
    if (!expiresAt) return null;
    return Math.max(0, new Date(expiresAt) - new Date());
  },
};

export default AuthService;
