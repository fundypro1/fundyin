<template>
  <div class="admin-manager">
    <div class="header">
      <h1 class="title">Admin Transaction Manager</h1>
      <p class="subtitle">Manage deposits and withdrawals</p>
    </div>

    <!-- User Statistics Section -->
    <div class="stats-section">
      <h2 class="stats-title">User Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.total_users || 0 }}</div>
            <div class="stat-label">Total Users</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.active_users || 0 }}</div>
            <div class="stat-label">Active Users</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.inactive_users || 0 }}</div>
            <div class="stat-label">Inactive Users</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.users_registered_today || 0 }}</div>
            <div class="stat-label">Registered Today</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.users_registered_this_month || 0 }}</div>
            <div class="stat-label">Registered This Month</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <div class="stat-value">{{ userStats.users_with_balance || 0 }}</div>
            <div class="stat-label">Users with Balance</div>
          </div>
        </div>
      </div>
      <div class="stats-refresh">
        <button @click="loadUserStats" :disabled="loadingStats" class="refresh-btn">
          <i v-if="loadingStats" class="spinner"></i>
          <span v-else>🔄</span>
          Refresh Stats
        </button>
        <div v-if="statsLastUpdated" class="stats-updated">
          Last updated: {{ formatDate(statsLastUpdated) }}
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        :class="['tab-btn', { active: activeTab === 'deposits' }]"
        @click="setActiveTab('deposits')"
      >
        <i class="icon-deposit"></i>
        Deposits
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'withdrawals' }]"
        @click="setActiveTab('withdrawals')"
      >
        <i class="icon-withdrawal"></i>
        Withdrawals
      </button>
    </div>

    <!-- Deposits Tab -->
    <div v-if="activeTab === 'deposits'" class="tab-content">
      <div class="search-section">
        <div class="search-form">
          <label for="depositId">Deposit ID</label>
          <div class="input-group">
            <input
              id="depositId"
              v-model="depositId"
              type="text"
              placeholder="Enter deposit ID"
              class="form-input"
              @keyup.enter="fetchDeposit"
            />
            <button 
              @click="fetchDeposit" 
              :disabled="!depositId || loadingDeposit"
              class="search-btn"
            >
              <i v-if="loadingDeposit" class="spinner"></i>
              <i v-else class="icon-search"></i>
              Search
            </button>
          </div>
        </div>
      </div>

      <!-- Deposit Details -->
      <div v-if="depositData" class="transaction-card">
        <div class="card-header">
          <h3>Deposit Details</h3>
          <span :class="['status-badge', depositData.status.toLowerCase()]">
            {{ depositData.status }}
          </span>
        </div>
        
        <div class="card-content">
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID</label>
              <span>{{ depositData.id }}</span>
            </div>
            <div class="detail-item">
              <label>User ID</label>
              <span>{{ depositData.user_id }}</span>
            </div>
            <div class="detail-item">
              <label>Amount</label>
              <span class="amount">${{ parseFloat(depositData.amount).toFixed(2) }}</span>
            </div>
            <div class="detail-item">
              <label>Date</label>
              <span>{{ formatDate(depositData.created_at) }}</span>
            </div>
            <div class="detail-item" v-if="depositData.payment_method">
              <label>Payment Method</label>
              <span>{{ depositData.payment_method }}</span>
            </div>
            <div class="detail-item" v-if="depositData.reference">
              <label>Reference</label>
              <span>{{ depositData.reference }}</span>
            </div>
            <div class="detail-item" v-if="depositData.image_url">
              <label>Proof Image</label>
              <a :href="depositData.image_url" target="_blank" class="image-link">View Image</a>
            </div>
            <div class="detail-item" v-if="depositData.admin_notes">
              <label>Admin Notes</label>
              <span>{{ depositData.admin_notes }}</span>
            </div>
            <div class="detail-item" v-if="depositData.processed_at">
              <label>Processed At</label>
              <span>{{ formatDate(depositData.processed_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="depositData.status === 'PENDING'" class="action-section">
          <div class="reason-input">
            <label for="depositReason">Admin Notes (optional)</label>
            <textarea
              id="depositReason"
              v-model="depositReason"
              placeholder="Enter notes for approval/rejection"
              class="form-textarea"
            ></textarea>
          </div>
          
          <div class="action-buttons">
            <button 
              @click="approveDeposit" 
              :disabled="processingDeposit"
              class="btn-approve"
            >
              <i v-if="processingDeposit && actionType === 'approve'" class="spinner"></i>
              <i v-else class="icon-check"></i>
              Approve
            </button>
            <button 
              @click="rejectDeposit" 
              :disabled="processingDeposit"
              class="btn-reject"
            >
              <i v-if="processingDeposit && actionType === 'reject'" class="spinner"></i>
              <i v-else class="icon-x"></i>
              Reject
            </button>
          </div>
        </div>
        
        <div v-else class="status-message">
          <p>This deposit has already been {{ depositData.status.toLowerCase() }}.</p>
        </div>
      </div>
    </div>

    <!-- Withdrawals Tab -->
    <div v-if="activeTab === 'withdrawals'" class="tab-content">
      <div class="search-section">
        <div class="search-form">
          <label for="withdrawalId">Withdrawal ID</label>
          <div class="input-group">
            <input
              id="withdrawalId"
              v-model="withdrawalId"
              type="text"
              placeholder="Enter withdrawal ID"
              class="form-input"
              @keyup.enter="fetchWithdrawal"
            />
            <button 
              @click="fetchWithdrawal" 
              :disabled="!withdrawalId || loadingWithdrawal"
              class="search-btn"
            >
              <i v-if="loadingWithdrawal" class="spinner"></i>
              <i v-else class="icon-search"></i>
              Search
            </button>
          </div>
        </div>
      </div>

      <!-- Withdrawal Details -->
      <div v-if="withdrawalData" class="transaction-card">
        <div class="card-header">
          <h3>Withdrawal Details</h3>
          <span :class="['status-badge', withdrawalData.status.toLowerCase()]">
            {{ withdrawalData.status }}
          </span>
        </div>
        
        <div class="card-content">
          <div class="detail-grid">
            <div class="detail-item">
              <label>ID</label>
              <span>{{ withdrawalData.id }}</span>
            </div>
            <div class="detail-item">
              <label>User ID</label>
              <span>{{ withdrawalData.user_id }}</span>
            </div>
            <div class="detail-item">
              <label>Amount</label>
              <span class="amount">${{ parseFloat(withdrawalData.amount).toFixed(2) }}</span>
            </div>
            <div class="detail-item">
              <label>Date</label>
              <span>{{ formatDate(withdrawalData.created_at) }}</span>
            </div>
            <div class="detail-item" v-if="withdrawalData.bank_details">
              <label>Bank Details</label>
              <span>{{ withdrawalData.bank_details }}</span>
            </div>
            <div class="detail-item" v-if="withdrawalData.reference">
              <label>Reference</label>
              <span>{{ withdrawalData.reference }}</span>
            </div>
            <div class="detail-item" v-if="withdrawalData.admin_notes">
              <label>Admin Notes</label>
              <span>{{ withdrawalData.admin_notes }}</span>
            </div>
            <div class="detail-item" v-if="withdrawalData.processed_at">
              <label>Processed At</label>
              <span>{{ formatDate(withdrawalData.processed_at) }}</span>
            </div>
            <div class="detail-item" v-if="withdrawalData.rejection_reason">
              <label>Rejection Reason</label>
              <span class="rejection-reason">{{ withdrawalData.rejection_reason }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="withdrawalData.status === 'PENDING'" class="action-section">
          <div class="reason-input">
            <label for="withdrawalReason">Admin Notes / Rejection Reason</label>
            <textarea
              id="withdrawalReason"
              v-model="withdrawalReason"
              placeholder="Enter notes for approval or reason for rejection"
              class="form-textarea"
            ></textarea>
          </div>
          
          <div class="action-buttons">
            <button 
              @click="approveWithdrawal" 
              :disabled="processingWithdrawal"
              class="btn-approve"
            >
              <i v-if="processingWithdrawal && actionType === 'approve'" class="spinner"></i>
              <i v-else class="icon-check"></i>
              Approve
            </button>
            <button 
              @click="rejectWithdrawal" 
              :disabled="processingWithdrawal"
              class="btn-reject"
            >
              <i v-if="processingWithdrawal && actionType === 'reject'" class="spinner"></i>
              <i v-else class="icon-x"></i>
              Reject
            </button>
          </div>
        </div>
        
        <!-- Complete Button for Approved Withdrawals -->
        <div v-else-if="withdrawalData.status === 'APPROVED'" class="action-section">
          <div class="complete-section">
            <p class="complete-info">This withdrawal has been approved. Mark as completed when payment is sent.</p>
            <button 
              @click="completeWithdrawal" 
              :disabled="processingWithdrawal"
              class="btn-complete"
            >
              <i v-if="processingWithdrawal" class="spinner"></i>
              <i v-else class="icon-complete"></i>
              Mark as Completed
            </button>
          </div>
        </div>
        
        <div v-else class="status-message">
          <p>This withdrawal is {{ withdrawalData.status.toLowerCase() }}.</p>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" :class="['message', messageType]">
      <i :class="messageType === 'success' ? 'icon-check' : 'icon-alert'"></i>
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import AuthService from '@/services/auth.js'; // Import your actual AuthService

export default {
  name: 'AdminPanel',
  setup() {
    // Reactive data
    const activeTab = ref('deposits');
    const depositId = ref('');
    const withdrawalId = ref('');
    const depositData = ref(null);
    const withdrawalData = ref(null);
    const depositReason = ref('');
    const withdrawalReason = ref('');
    const loadingDeposit = ref(false);
    const loadingWithdrawal = ref(false);
    const processingDeposit = ref(false);
    const processingWithdrawal = ref(false);
    const message = ref('');
    const messageType = ref('success');
    const actionType = ref('');

    // User statistics data
    const userStats = ref({
      total_users: 0,
      active_users: 0,
      inactive_users: 0,
      users_registered_today: 0,
      users_registered_this_month: 0,
      users_with_balance: 0
    });
    const loadingStats = ref(false);
    const statsLastUpdated = ref(null);

    // Methods
    const setActiveTab = (tab) => {
      activeTab.value = tab;
      clearMessages();
      // Clear data when switching tabs
      depositData.value = null;
      withdrawalData.value = null;
      depositId.value = '';
      withdrawalId.value = '';
      depositReason.value = '';
      withdrawalReason.value = '';
    };

    const clearMessages = () => {
      message.value = '';
    };

    const showMessage = (msg, type = 'success') => {
      message.value = msg;
      messageType.value = type;
      setTimeout(() => {
        message.value = '';
      }, 5000);
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    };

    // Load user statistics
    const loadUserStats = async () => {
      loadingStats.value = true;
      
      try {
        // Debug token
        const adminToken = localStorage.getItem('admin_token');
        console.log('Admin token exists:', !!adminToken);
        console.log('Token length:', adminToken ? adminToken.length : 0);
        
        const stats = await AuthService.getCounts();
        userStats.value = stats;
        statsLastUpdated.value = new Date().toISOString();
        console.log('User stats loaded:', stats);
      } catch (error) {
        console.error('Error loading user stats:', error);
        console.error('Error details:', error.response?.data);
        showMessage('Failed to load user statistics', 'error');
      } finally {
        loadingStats.value = false;
      }
    };

    const fetchDeposit = async () => {
      console.log('Admin token:', localStorage.getItem('admin_token'));
      console.log('Current URL:', window.location.href);
      console.log('Deposit ID:', depositId.value);
      
      if (!depositId.value.trim()) {
        showMessage('Please enter a deposit ID', 'error');
        return;
      }
      
      loadingDeposit.value = true;
      clearMessages();
      
      try {
        const response = await AuthService.getDepositAdmin(depositId.value);
        console.log('Success response:', response);
        depositData.value = response;
        showMessage('Deposit retrieved successfully');
      } catch (error) {
        console.error('Error details:', error.response?.status, error.response?.data);
        // Don't let the error redirect - handle it here
        showMessage(AuthService.formatErrorMessage(error), 'error');
        depositData.value = null;
      } finally {
        loadingDeposit.value = false;
      }
    };

    const fetchWithdrawal = async () => {
      if (!withdrawalId.value.trim()) {
        showMessage('Please enter a withdrawal ID', 'error');
        return;
      }
      
      loadingWithdrawal.value = true;
      clearMessages();
      
      try {
        // Use the admin endpoint for withdrawals
        const response = await AuthService.apiClient.get(`/admin/withdrawals/${withdrawalId.value}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('admin_token')}`
          }
        });
        withdrawalData.value = response.data;
        showMessage('Withdrawal retrieved successfully');
      } catch (error) {
        console.error('Error fetching withdrawal:', error);
        showMessage(AuthService.formatErrorMessage(error), 'error');
        withdrawalData.value = null;
      } finally {
        loadingWithdrawal.value = false;
      }
    };

    const approveDeposit = async () => {
      processingDeposit.value = true;
      actionType.value = 'approve';
      
      try {
        const approvalData = {
          admin_notes: depositReason.value || null
        };
        
        const response = await AuthService.approveDeposit(depositId.value, approvalData);
        depositData.value = response;
        showMessage('Deposit approved successfully');
        depositReason.value = '';
        // Refresh stats after successful transaction
        loadUserStats();
      } catch (error) {
        console.error('Error approving deposit:', error);
        showMessage(AuthService.formatErrorMessage(error), 'error');
      } finally {
        processingDeposit.value = false;
        actionType.value = '';
      }
    };

    const rejectDeposit = async () => {
      if (!depositReason.value.trim()) {
        showMessage('Please provide a reason for rejection', 'error');
        return;
      }
      
      processingDeposit.value = true;
      actionType.value = 'reject';
      
      try {
        const rejectionData = {
          rejection_reason: depositReason.value
        };
        
        const response = await AuthService.rejectDeposit(depositId.value, rejectionData);
        depositData.value = response;
        showMessage('Deposit rejected successfully');
        depositReason.value = '';
        // Refresh stats after successful transaction
        loadUserStats();
      } catch (error) {
        console.error('Error rejecting deposit:', error);
        showMessage(AuthService.formatErrorMessage(error), 'error');
      } finally {
        processingDeposit.value = false;
        actionType.value = '';
      }
    };

    const approveWithdrawal = async () => {
      processingWithdrawal.value = true;
      actionType.value = 'approve';
      
      try {
        const approvalData = {
          admin_notes: withdrawalReason.value || null
        };
        
        const response = await AuthService.approveWithdrawal(withdrawalId.value, approvalData);
        withdrawalData.value = response;
        showMessage('Withdrawal approved successfully');
        withdrawalReason.value = '';
        // Refresh stats after successful transaction
        loadUserStats();
      } catch (error) {
        console.error('Error approving withdrawal:', error);
        showMessage(AuthService.formatErrorMessage(error), 'error');
      } finally {
        processingWithdrawal.value = false;
        actionType.value = '';
      }
    };

    const rejectWithdrawal = async () => {
      if (!withdrawalReason.value.trim()) {
        showMessage('Please provide a reason for rejection', 'error');
        return;
      }
      
      processingWithdrawal.value = true;
      actionType.value = 'reject';
      
      try {
        const rejectionData = {
          rejection_reason: withdrawalReason.value
        };
        
        const response = await AuthService.rejectWithdrawal(withdrawalId.value, rejectionData);
        withdrawalData.value = response;
        showMessage('Withdrawal rejected successfully');
        withdrawalReason.value = '';
        // Refresh stats after successful transaction
        loadUserStats();
      } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        showMessage(AuthService.formatErrorMessage(error), 'error');
      } finally {
        processingWithdrawal.value = false;
        actionType.value = '';
      }
    };

    const completeWithdrawal = async () => {
      processingWithdrawal.value = true;
      
      try {
        const response = await AuthService.completeWithdrawal(withdrawalId.value);
        withdrawalData.value = response;
        showMessage('Withdrawal marked as completed');
        // Refresh stats after successful transaction
        loadUserStats();
      } catch (error) {
        console.error('Error completing withdrawal:', error);
        showMessage(AuthService.formatErrorMessage(error), 'error');
      } finally {
        processingWithdrawal.value = false;
      }
    };

    // Load user stats when component is mounted
    onMounted(() => {
      loadUserStats();
    });

    return {
      activeTab,
      depositId,
      withdrawalId,
      depositData,
      withdrawalData,
      depositReason,
      withdrawalReason,
      loadingDeposit,
      loadingWithdrawal,
      processingDeposit,
      processingWithdrawal,
      message,
      messageType,
      actionType,
      userStats,
      loadingStats,
      statsLastUpdated,
      setActiveTab,
      fetchDeposit,
      fetchWithdrawal,
      approveDeposit,
      rejectDeposit,
      approveWithdrawal,
      rejectWithdrawal,
      completeWithdrawal,
      loadUserStats,
      formatDate
    };
  }
};
</script>

<style scoped>
.admin-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* User Statistics Section */
.stats-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.stats-title {
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 25px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #e1e5e9;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-refresh {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.refresh-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.stats-updated {
  font-size: 0.8rem;
  color: #666;
  font-style: italic;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.tab-btn {
  flex: 1;
  padding: 15px 20px;
  border: none;
  background: transparent;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

/* Search Section */
.search-section {
  margin-bottom: 30px;
}

.search-form label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 1rem;
}

.input-group {
  display: flex;
  gap: 12px;
}

.form-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-btn {
  padding: 15px 25px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Transaction Card */
.transaction-card {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #e1e5e9;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e1e5e9;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.completed {
  background: #d1ecf1;
  color: #0c5460;
}

/* Detail Grid */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item label {
  font-weight: 600;
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  font-size: 1rem;
  color: #333;
  font-weight: 500;
}

.detail-item .amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #28a745;
}

.image-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.image-link:hover {
  text-decoration: underline;
}

.rejection-reason {
  color: #dc3545;
  font-style: italic;
}

/* Action Section */
.action-section {
  border-top: 2px solid #e1e5e9;
  padding-top: 25px;
}

.reason-input {
  margin-bottom: 25px;
}

.reason-input label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn-approve {
  padding: 15px 30px;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.btn-approve:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
}

.btn-reject {
  padding: 15px 30px;
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.btn-reject:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.3);
}

.btn-complete {
  padding: 15px 30px;
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
  justify-content: center;
}

.btn-complete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(23, 162, 184, 0.3);
}

.btn-approve:disabled,
.btn-reject:disabled,
.btn-complete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.complete-section {
  text-align: center;
}

.complete-info {
  margin-bottom: 20px;
  color: #666;
  font-style: italic;
}

.status-message {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  color: #666;
}

/* Message */
.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
  max-width: 400px;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Icons */
.icon-deposit::before { content: '💰'; }
.icon-withdrawal::before { content: '🏦'; }
.icon-search::before { content: '🔍'; }
.icon-check::before { content: '✓'; }
.icon-x::before { content: '✕'; }
.icon-alert::before { content: '⚠️'; }
.icon-complete::before { content: '✅'; }

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-manager {
    padding: 15px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .stats-section {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stats-refresh {
    flex-direction: column;
    gap: 10px;
  }
  
  .tab-content {
    padding: 20px;
  }
  
  .input-group {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .message {
    left: 15px;
    right: 15px;
    max-width: none;
  }
}
</style>