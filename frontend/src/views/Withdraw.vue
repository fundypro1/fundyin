<template>
  <div class="withdrawal-container">
    <!-- Header -->
    <header class="withdrawal-header">
      <div class="header-content">
        <div class="title-section">
          <div class="breadcrumb">
            <span class="breadcrumb-item">Wallet</span>
            <span>/</span>
            <span class="breadcrumb-item active">Withdraw</span>
          </div>
          <h1 class="page-title">🏦 Withdraw Funds</h1>
          <p class="page-subtitle">Securely withdraw your funds anytime</p>
        </div>

        <div v-if="userId" class="user-info">
          <div class="user-avatar">{{ userUsername.charAt(0).toUpperCase() }}</div>
          <div class="user-details">
            <span class="username">@{{ userUsername }}</span>
            <span class="user-id">ID: #{{ userId }}</span>
          </div>
          <div class="security-badge">
            <div class="status-dot"></div>
            <span>Secured</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Body -->
    <main class="withdrawal-body">
      <div class="withdrawal-main">
        <!-- Balance Section -->
        <div class="balance-section">
          <div class="balance-card">
            <div class="balance-header">
              <div class="balance-left">
                <div class="balance-icon">🏦</div>
                <div class="balance-info">
                  <span class="balance-label">Available Balance</span>
                  <div class="balance-amount">
                    <span class="currency">GHS</span>
                    <span class="amount">{{ formatAmount(currentBalance) }}</span>
                  </div>
                </div>
              </div>
              <div class="balance-actions">
                <button class="action-btn" @click="refreshBalance" :disabled="refreshing">
                  🔄
                </button>
                <button class="action-btn" @click="showHistory = !showHistory">
                  📊
                </button>
                <button class="action-btn">
                  <span v-if="showBalance" @click="showBalance = false">👁</span>
                  <span v-else @click="showBalance = true">🙈</span>
                </button>
              </div>
            </div>

            <div class="balance-stats">
              <div class="stat-item">
                <span class="stat-label">Today's Withdrawals</span>
                <span class="stat-value negative">-{{ formatAmount(150) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">This Month</span>
                <span class="stat-value negative">-{{ formatAmount(500) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Withdrawal Form -->
        <div class="withdrawal-form-section">
          <div class="form-card">
            <div class="form-header">
              <h2 class="form-title">💳 Withdrawal Form</h2>
              <div class="form-badge">
                <span>⚡ Instant</span>
              </div>
            </div>

            <div class="form-content">
              <div class="form-step">
                <!-- Amount -->
                <div class="input-group">
                  <label class="input-label">
                    🏦 Withdrawal Amount
                  </label>
                  <div class="amount-input-wrapper">
                    <div class="currency-prefix">GHS</div>
                    <input 
                      type="number" 
                      class="amount-input" 
                      v-model="withdrawAmount" 
                      placeholder="0.00"
                      min="10"
                      :max="currentBalance"
                      step="0.01"
                      @input="validateAmount"
                    />
                    <div class="amount-suffix">
                      <button class="max-btn" @click="setMaxAmount">MAX</button>
                    </div>
                  </div>
                  <div v-if="amountError" class="error-message">
                    ⚠️ {{ amountError }}
                  </div>
                </div>

                <!-- Quick Amounts -->
                <div class="quick-amounts">
                  <div class="quick-label">🚀 Quick amounts</div>
                  <div class="amount-grid">
                    <button 
                      v-for="amount in quickAmounts" 
                      :key="amount"
                      class="amount-btn"
                      @click="selectQuickAmount(amount)"
                      :class="{ active: withdrawAmount == amount }"
                      :disabled="amount > currentBalance"
                    >
                      {{ formatAmount(amount) }}
                    </button>
                  </div>
                </div>

                <!-- Payment Method -->
                <div class="input-group">
                  <label class="input-label">
                    💳 Payment Method
                  </label>
                  <select class="text-input" v-model="paymentMethod">
                    <option value="crypto">₿ Crypto Wallet</option>
                  </select>
                </div>

                <!-- Account Details -->
                <div class="input-group">
                  <label class="input-label">
                    📋 Account Details
                  </label>
                  <input 
                    type="text" 
                    class="text-input" 
                    v-model="accountDetails" 
                    :placeholder="getAccountPlaceholder()"
                  />
                </div>

                <!-- Notes -->
                <div class="input-group">
                  <label class="input-label">
                    💬 Notes <span class="optional">(optional)</span>
                  </label>
                  <textarea 
                    class="textarea-input" 
                    rows="3" 
                    v-model="notes" 
                    placeholder="Add withdrawal notes..."
                    maxlength="200"
                  ></textarea>
                  <div class="char-counter">{{ notes.length }}/200</div>
                </div>

                <!-- Withdrawal Info -->
                <div class="withdrawal-info">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Min amount</span>
                      <span class="info-value">100.00 GHS</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Max amount</span>
                      <span class="info-value">{{ formatAmount(currentBalance) }} GHS</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Processing time</span>
                      <span class="info-value">⚡ 15-30 minutes</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Fee</span>
                      <span class="info-value success"> 2%</span>
                    </div>
                  </div>
                </div>

                <!-- Buttons -->
                <div class="form-navigation">
                  <button class="nav-btn secondary" @click="resetForm">
                    ❌ Cancel
                  </button>
                  <button 
                    class="nav-btn primary" 
                    :disabled="!canWithdraw || isProcessing" 
                    @click="submitWithdrawal"
                  >
                    <span v-if="isProcessing">⏳ Processing...</span>
                    <span v-else>🚀 Withdraw Funds</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Messages -->
        <transition name="fade">
          <div v-if="successMessage" class="status-alert success">
            <div class="alert-icon">🎉</div>
            <div class="alert-content">
              <h5>Withdrawal Submitted Successfully!</h5>
              <p>{{ successMessage }}</p>
            </div>
            <button @click="dismissSuccess" class="alert-close">×</button>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="errorMessage" class="status-alert error">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
              <h5>Withdrawal Failed</h5>
              <p>{{ errorMessage }}</p>
            </div>
            <button @click="dismissError" class="alert-close">×</button>
          </div>
        </transition>
      </div>

      <!-- Sidebar -->
      <aside class="withdrawal-sidebar">
        <div class="sidebar-card">
          <div class="card-header">
            <h3 class="card-title">
              📊 Recent Withdrawals
            </h3>
            <button class="header-btn" @click="showAllWithdrawals">
              <span>View All</span>
            </button>
          </div>
          <div class="card-content">
            <div v-if="recentWithdrawals.length" class="withdrawals-list">
              <div v-for="w in recentWithdrawals" :key="w.id" class="withdrawal-item">
                <div class="withdrawal-main">
                  <div class="withdrawal-amount">-{{ formatAmount(w.amount) }} GHS</div>
                  <div class="withdrawal-time">{{ formatDate(w.created_at) }}</div>
                </div>
                <div class="withdrawal-status" :class="w.status.toLowerCase()">
                  {{ formatStatus(w.status) }}
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">💳</div>
              <div class="empty-text">
                <p>No withdrawals yet</p>
                <span>Your withdrawal history will appear here</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Withdrawal Guide -->
        <div class="sidebar-card">
          <div class="card-header">
            <h4 class="card-title">
              💡 How to withdraw
            </h4>
          </div>
          
          <div class="card-content">
            <div class="guide-steps">
              <div class="guide-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h5>Enter amount</h5>
                  <p>Choose withdrawal amount (min 100 GHS)</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h5>Select method</h5>
                  <p>Choose your preferred payment method</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h5>Get paid</h5>
                  <p>Receive funds within 15-40 minutes!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Support -->
        <div class="sidebar-card">
          <div class="card-header">
            <h4 class="card-title">
              🆘 Need help?
            </h4>
          </div>
          
          <div class="card-content">
            <div class="support-options">
              <button class="support-btn">
                💬 Live chat
              </button>
              <button class="support-btn">
                📧 Email support
              </button>
              <button class="support-btn">
                📚 Help center
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script>
import AuthService from '@/services/auth'

export default {
  name: 'FundyWithdrawal',
  data() {
    return {
      withdrawAmount: '',
      paymentMethod: '',
      accountDetails: '',
      notes: '',
      showBalance: true,
      
      amountError: '',

      currentBalance: 0,
      recentWithdrawals: [],
      quickAmounts: [100, 200, 500, 1000],

      isProcessing: false,
      refreshing: false,
      errorMessage: '',
      successMessage: '',
      showHistory: false
    }
  },
  computed: {
    userId() {
      return localStorage.getItem('user_id')
    },
    userUsername() {
      return localStorage.getItem('username') || 'User'
    },
    canWithdraw() {
      const amount = parseFloat(this.withdrawAmount)
      return amount >= 10 && 
             amount <= this.currentBalance && 
             this.paymentMethod && 
             this.accountDetails && 
             !this.amountError
    }
  },
  methods: {
    async fetchData() {
      try {
        if (!this.userId) {
          this.errorMessage = 'Please log in to access this page'
          return
        }

        const [userResponse, withdrawalsResponse] = await Promise.all([
          AuthService.getCurrentUser(),
          AuthService.getMyWithdrawals ? AuthService.getMyWithdrawals({ size: 5 }) : Promise.resolve([])
        ])
        
        if (userResponse && userResponse.balance !== undefined) {
          this.currentBalance = userResponse.balance
        }
        
        this.recentWithdrawals = withdrawalsResponse.items || withdrawalsResponse || []
      } catch (error) {
        console.error('Error fetching data:', error)
        this.errorMessage = 'Unable to fetch account data'
      }
    },

    async refreshBalance() {
      this.refreshing = true
      try {
        const userResponse = await AuthService.getCurrentUser()
        if (userResponse && userResponse.balance !== undefined) {
          this.currentBalance = userResponse.balance
        }
      } catch (error) {
        console.error('Error refreshing balance:', error)
        this.errorMessage = 'Unable to refresh balance'
      } finally {
        this.refreshing = false
      }
    },

    selectQuickAmount(amount) {
      if (amount <= this.currentBalance) {
        this.withdrawAmount = amount.toString()
        this.validateAmount()
      }
    },

    setMaxAmount() {
      this.withdrawAmount = this.currentBalance.toString()
      this.validateAmount()
    },

    validateAmount() {
      this.amountError = ''
      const amount = parseFloat(this.withdrawAmount)
      if (isNaN(amount) || amount <= 0) {
        this.amountError = 'Please enter a valid amount'
      } else if (amount < 100) {
        this.amountError = 'Minimum withdrawal is 100.00 GHS'
      } else if (amount > this.currentBalance) {
        this.amountError = 'Amount exceeds available balance'
      }
    },

    getAccountPlaceholder() {
      switch (this.paymentMethod) {
        case 'bank_transfer':
          return 'Enter bank account number'
        case 'mobile_money':
          return 'Enter mobile money number'
        case 'crypto':
          return 'Enter wallet address'
        default:
          return 'Enter account details'
      }
    },

    async submitWithdrawal() {
      this.isProcessing = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const withdrawData = {
          amount: parseFloat(this.withdrawAmount),
          currency: 'GHS',
          recipient_name: this.userUsername,
          recipient_account: this.accountDetails,
          bank_name: this.paymentMethod,
          user_notes: this.notes || null
        }

        const response = await AuthService.createWithdrawal(withdrawData)
        this.successMessage = `Withdrawal of ${this.formatAmount(this.withdrawAmount)} GHS submitted successfully! Reference: ${response.reference_number || response.id}`

        this.resetForm()
        await this.fetchData()
      } catch (error) {
        console.error('Error submitting withdrawal:', error)
        this.errorMessage = error.response?.data?.detail || 'Failed to submit withdrawal. Please try again.'
      } finally {
        this.isProcessing = false
      }
    },

    resetForm() {
      this.withdrawAmount = ''
      this.paymentMethod = ''
      this.accountDetails = ''
      this.notes = ''
      this.amountError = ''
    },

    formatAmount(amount) {
      return parseFloat(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.abs(now - date) / 36e5
      
      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    },

    formatStatus(status) {
      const statusMap = {
        'PENDING': 'Pending',
        'APPROVED': 'Approved', 
        'REJECTED': 'Rejected',
        'COMPLETED': 'Completed'
      }
      return statusMap[status] || status
    },

    showAllWithdrawals() {
      this.$router.push('/withdrawals/history')
    },

    dismissSuccess() {
      this.successMessage = ''
    },

    dismissError() {
      this.errorMessage = ''
    },

    startBalanceRefresh() {
      this.balanceRefreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible' && !this.refreshing) {
          this.refreshBalance()
        }
      }, 30000)
    },

    stopBalanceRefresh() {
      if (this.balanceRefreshInterval) {
        clearInterval(this.balanceRefreshInterval)
        this.balanceRefreshInterval = null
      }
    }
  },
  
  mounted() {
    this.fetchData()
    this.startBalanceRefresh()
  },

  beforeUnmount() {
    this.stopBalanceRefresh()
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.withdrawal-container {
  background: #0b0e11;
  color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.withdrawal-header {
  background: #1e2329;
  border-bottom: 1px solid #474d57;
  padding: 20px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #848e9c;
}

.breadcrumb-item.active {
  color: #f0b90b;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #f0b90b, #f8d12f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: #848e9c;
  font-size: 14px;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #0b0e11;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #474d57;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0b90b, #f8d12f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: #000000;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  color: #ffffff;
  font-weight: 500;
  font-size: 14px;
}

.user-id {
  color: #848e9c;
  font-size: 12px;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(3, 166, 109, 0.1);
  color: #03a66d;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #03a66d;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Body */
.withdrawal-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

/* Balance Section */
.balance-section {
  margin-bottom: 24px;
}

.balance-card {
  background: linear-gradient(135deg, #1e2329 0%, #2b3139 100%);
  border: 1px solid #f0b90b;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.balance-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #f0b90b, #f8d12f, #f0b90b);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.balance-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.balance-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f0b90b, #f8d12f);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.balance-label {
  display: block;
  color: #848e9c;
  font-size: 14px;
  margin-bottom: 4px;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.currency {
  font-size: 16px;
  color: #f0b90b;
  font-weight: 500;
}

.amount {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.balance-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 8px;
  color: #848e9c;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.action-btn:hover {
  background: #2b3139;
  color: #f0b90b;
  border-color: #f0b90b;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.balance-stats {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #474d57;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #848e9c;
}

.stat-value {
  font-size: 14px;
  font-weight: 500;
}

.stat-value.positive {
  color: #03a66d;
}

.stat-value.negative {
  color: #cf304a;
}

/* Form Section */
.withdrawal-form-section {
  flex: 1;
}

.form-card {
  background: #1e2329;
  border: 1px solid #474d57;
  border-radius: 16px;
  overflow: hidden;
}

.form-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #474d57;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}

.form-badge {
  background: rgba(3, 166, 109, 0.1);
  color: #03a66d;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* Form Content */
.form-content {
  padding: 24px;
}

.form-step {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Input Groups */
.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #ffffff;
}

.optional {
  color: #848e9c;
  font-weight: 400;
  font-size: 12px;
}

.amount-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.amount-input-wrapper:focus-within {
  border-color: #f0b90b;
  box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
}

.currency-prefix {
  padding: 0 16px;
  color: #848e9c;
  font-weight: 600;
  border-right: 1px solid #474d57;
}

.amount-input {
  flex: 1;
  padding: 16px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.amount-input::placeholder {
  color: #848e9c;
}

.amount-suffix {
  padding-right: 12px;
}

.max-btn {
  background: #f0b90b;
  color: #000000;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.max-btn:hover {
  opacity: 0.8;
}

.text-input, .textarea-input {
  width: 100%;
  padding: 16px;
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  resize: none;
}

.text-input:focus, .textarea-input:focus {
  border-color: #f0b90b;
  box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
}

.text-input::placeholder, .textarea-input::placeholder {
  color: #848e9c;
}

.char-counter {
  text-align: right;
  font-size: 12px;
  color: #848e9c;
  margin-top: 4px;
}

/* Quick Amounts */
.quick-amounts {
  margin: 24px 0;
}

.quick-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #848e9c;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.amount-btn {
  padding: 12px 16px;
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 8px;
  color: #848e9c;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.amount-btn:hover:not(:disabled) {
  background: #2b3139;
  border-color: #f0b90b;
  color: #f0b90b;
  transform: translateY(-1px);
}

.amount-btn.active {
  background: rgba(240, 185, 11, 0.1);
  border-color: #f0b90b;
  color: #f0b90b;
}

.amount-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Withdrawal Info */
.withdrawal-info {
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: #848e9c;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.info-value.success {
  color: #03a66d;
}

/* Error Messages */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cf304a;
  font-size: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(207, 48, 74, 0.1);
  border-radius: 6px;
  animation: shake 0.3s ease-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Navigation */
.form-navigation {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #474d57;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  min-width: 120px;
  justify-content: center;
}

.nav-btn.secondary {
  background: #0b0e11;
  color: #848e9c;
  border: 1px solid #474d57;
}

.nav-btn.secondary:hover {
  background: #2b3139;
  color: #ffffff;
}

.nav-btn.primary {
  background: #f0b90b;
  color: #000000;
  border: 1px solid #f0b90b;
  box-shadow: 0 4px 15px rgba(240, 185, 11, 0.3);
}

.nav-btn.primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 185, 11, 0.4);
}

.nav-btn.primary:active {
  transform: translateY(0);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Status Alerts */
.status-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  position: relative;
}

.status-alert.success {
  background: rgba(3, 166, 109, 0.1);
  border: 1px solid rgba(3, 166, 109, 0.3);
}

.status-alert.error {
  background: rgba(207, 48, 74, 0.1);
  border: 1px solid rgba(207, 48, 74, 0.3);
}

.alert-icon {
  font-size: 20px;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-content h5 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.status-alert.success .alert-content h5 {
  color: #03a66d;
}

.status-alert.error .alert-content h5 {
  color: #cf304a;
}

.alert-content p {
  font-size: 12px;
  color: #848e9c;
  line-height: 1.5;
  margin: 0;
}

.alert-close {
  background: none;
  border: none;
  color: #848e9c;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.alert-close:hover {
  background: #2b3139;
  color: #ffffff;
}

/* Sidebar */
.withdrawal-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-card {
  background: #1e2329;
  border: 1px solid #474d57;
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #474d57;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #ffffff;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: #f0b90b;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.header-btn:hover {
  background: rgba(240, 185, 11, 0.1);
}

.card-content {
  padding: 20px;
}

/* Withdrawals List */
.withdrawals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.withdrawal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.withdrawal-item:hover {
  background: #2b3139;
  transform: translateY(-1px);
}

.withdrawal-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.withdrawal-amount {
  font-size: 14px;
  font-weight: 600;
  color: #cf304a;
}

.withdrawal-time {
  font-size: 12px;
  color: #848e9c;
}

.withdrawal-status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
  position: relative;
}

.withdrawal-status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
  animation: pulse 2s infinite;
}

.withdrawal-status.pending {
  background: rgba(250, 140, 22, 0.1);
  color: #fa8c16;
}

.withdrawal-status.pending::before {
  background: #fa8c16;
}

.withdrawal-status.approved,
.withdrawal-status.completed {
  background: rgba(3, 166, 109, 0.1);
  color: #03a66d;
}

.withdrawal-status.approved::before,
.withdrawal-status.completed::before {
  background: #03a66d;
  animation: none;
}

.withdrawal-status.rejected {
  background: rgba(207, 48, 74, 0.1);
  color: #cf304a;
}

.withdrawal-status.rejected::before {
  background: #cf304a;
  animation: none;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  background: #0b0e11;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #848e9c;
  font-size: 20px;
  margin: 0 auto 16px;
}

.empty-text p {
  font-size: 14px;
  color: #ffffff;
  margin-bottom: 4px;
}

.empty-text span {
  font-size: 12px;
  color: #848e9c;
}

/* Guide Steps */
.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.guide-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-number {
  width: 24px;
  height: 24px;
  background: #f0b90b;
  color: #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h5 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #ffffff;
}

.step-content p {
  font-size: 12px;
  color: #848e9c;
  line-height: 1.4;
  margin: 0;
}

/* Support Options */
.support-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.support-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 8px;
  color: #848e9c;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.support-btn:hover {
  background: #2b3139;
  border-color: #f0b90b;
  color: #f0b90b;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .withdrawal-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .withdrawal-sidebar {
    order: -1;
  }
  
  .sidebar-card {
    display: none;
  }
  
  .sidebar-card:first-child {
    display: block;
  }
}

@media (max-width: 768px) {
  .withdrawal-body {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .user-info {
    width: 100%;
    justify-content: space-between;
  }
  
  .balance-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .balance-stats {
    flex-wrap: wrap;
  }
  
  .amount-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-navigation {
    flex-direction: column;
  }
  
  .nav-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .withdrawal-header {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .form-card,
  .sidebar-card {
    border-radius: 12px;
  }
  
  .balance-card {
    border-radius: 12px;
  }
  
  .amount {
    font-size: 28px;
  }
  
  .amount-grid {
    grid-template-columns: 1fr;
  }
}

/* Enhanced Visual Effects */
.balance-card,
.form-card,
.sidebar-card {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Enhanced Typography */
.form-title,
.card-title {
  letter-spacing: -0.01em;
}

.amount {
  font-feature-settings: 'tnum' 1;
  letter-spacing: -0.02em;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #0b0e11;
}

::-webkit-scrollbar-thumb {
  background: #474d57;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #f0b90b;
}

/* Focus States */
.nav-btn:focus,
.action-btn:focus,
.amount-btn:focus,
.support-btn:focus {
  outline: 2px solid #f0b90b;
  outline-offset: 2px;
}
</style>