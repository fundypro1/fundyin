<template>
  <div class="deposit-container">
    <!-- Header Section -->
    <div class="deposit-header">
      <div class="header-content">
        <div class="title-section">
          <div class="breadcrumb">
            <span class="breadcrumb-item">Assets</span>
            <i class="fas fa-chevron-right"></i>
            <span class="breadcrumb-item active">Deposit</span>
          </div>
          <h1 class="page-title">💰 Quick Deposit</h1>
          <p class="page-subtitle">Add funds and start earning immediately</p>
        </div>
        <div v-if="userId" class="user-info">
          <div class="user-avatar">{{ userUsername.charAt(0).toUpperCase() }}</div>
          <div class="user-details">
            <span class="username">@{{ userUsername }}</span>
            <span class="user-id">UID: {{ userId }}</span>
          </div>

          <div class="security-badge">
            <div class="status-dot"></div>
            <span>Verified</span>
          </div>
        </div>
      </div>
    </div>

    <div class="deposit-body">
      <!-- Main Content -->
      <div class="deposit-main">
        <!-- Balance Card -->
        <div class="balance-section">
          <div class="balance-card">
            <div class="balance-header">
              <div class="balance-left">
                <div class="balance-icon">
                  💰
                </div>
                <div class="balance-info">
                  <span class="balance-label">Available Balance</span>
                  <div class="balance-amount">
                    <span class="currency">GHS</span>
                    <span class="amount" v-if="showBalance">{{ formatAmount(currentBalance) }}</span>
                    <span class="amount" v-else>****</span>
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
                <span class="stat-label">24h Change</span>
                <span class="stat-value positive">+12.4%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Earned</span>
                <span class="stat-value positive">+{{ formatAmount(currentBalance * 0.15) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Deposit Form -->
        <div class="deposit-form-section">
          <div class="form-card">
            <div class="form-header">
              <h3 class="form-title">💎 Make a Deposit</h3>
              <div class="currency-selector">
                <div class="selected-currency">
                  <div class="currency-icon">GHS</div>
                  <span class="currency-code">GHS</span>
                  <span class="currency-name">Ghana Cedi</span>
                </div>
              </div>
            </div>

            <!-- Progress Steps -->
            <div class="progress-section">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${(currentStep / 3) * 100}%` }"></div>
              </div>
              <div class="step-indicators">
                <div 
                  v-for="(step, index) in steps" 
                  :key="index"
                  class="step-indicator"
                  :class="{ 
                    completed: currentStep > index + 1, 
                    active: currentStep === index + 1 
                  }"
                >
                  <div class="step-circle">
                    <span v-if="currentStep > index + 1">✓</span>
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <span class="step-label">{{ step }}</span>
                </div>
              </div>
            </div>

            <!-- Step Content -->
            <div class="form-content">
              <!-- Step 1: Amount Selection -->
              <div v-if="currentStep === 1" class="form-step" key="step1">
                <div class="amount-section">
                  <div class="input-group">
                    <label class="input-label">
                      💰 Deposit Amount
                    </label>
                    <div class="amount-input-wrapper">
                      <div class="currency-prefix">GHS</div>
                      <input 
                        type="number" 
                        v-model="depositAmount" 
                        class="amount-input"
                        placeholder="0.00"
                        min="100"
                        max="10000"
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

                  <div class="quick-amounts">
                    <div class="quick-label">🚀 Quick amounts</div>
                    <div class="amount-grid">
                      <button 
                        v-for="amount in quickAmounts" 
                        :key="amount"
                        class="amount-btn"
                        @click="selectQuickAmount(amount)"
                        :class="{ active: depositAmount == amount }"
                      >
                        {{ formatAmount(amount) }}
                      </button>
                    </div>
                  </div>

                  <div class="deposit-info">
                    <div class="info-grid">
                      <div class="info-item">
                        <span class="info-label">Min amount</span>
                        <span class="info-value">100.00 GHS</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Max amount</span>
                        <span class="info-value">10,000.00 GHS</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Processing time</span>
                        <span class="info-value">⚡ Instant</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">Fee</span>
                        <span class="info-value success">🎁 Free</span>
                      </div>
                    </div>
                  </div>

                  <!-- Crypto Address Section -->
                  <div v-if="depositAmount && !amountError" class="crypto-address-section">
                    <div class="crypto-header">
                      <h4 class="crypto-title">
                        ₿ Crypto Deposit Address
                      </h4>
                      <p class="crypto-subtitle">
                        Send BTC to the address below and upload proof in the next step
                      </p>
                    </div>

                    <div class="crypto-address-card">
                      <div class="address-header">
                        <div class="crypto-icon">₿</div>
                        <div class="crypto-info">
                          <h5 class="crypto-name">BTC (Bitcoin)</h5>
                          <p class="crypto-network">Bitcoin Network</p>
                        </div>
                      </div>

                      <div class="address-field">
                        <label class="address-label">Wallet Address</label>
                        <div class="copy-field">
                          <input 
                            type="text" 
                            value="bc1qgwzatkwxq6fasmdmnk5n3pew5elayek0t87n4d" 
                            readonly 
                            class="address-input"
                          />
                          <button 
                            @click="copyToClipboard('bc1qgwzatkwxq6fasmdmnk5n3pew5elayek0t87n4d', 'Crypto address')"
                            class="copy-btn"
                            :class="{ copied: copySuccess.includes('Crypto address') }"
                          >
                            <span v-if="copySuccess.includes('Crypto address')">✓</span>
                            <span v-else>📋</span>
                          </button>
                        </div>
                      </div>

                      <div class="amount-display">
                        <div class="amount-row">
                          <span class="amount-label">Send Amount (BTC):</span>
                          <span class="amount-value">₿{{ (parseFloat(depositAmount) / 1419801.08).toFixed(8) }} BTC</span>
                        </div>
                        <div class="amount-note">
                          <!-- Rate: 1 GHS = $0.067 USDT (approximate) -->
                        </div>
                      </div>

                      <div class="crypto-warning">
                        <div class="warning-icon">⚠️</div>
                        <div class="warning-text">
                          <strong>Important:</strong> Only  Bitcoin(BTC) network. Other tokens or networks may result in permanent loss of funds.
                        </div>
                      </div>
                    </div>

                    <!-- Copy Success Message -->
                    <transition name="fade">
                      <div v-if="copySuccess" class="copy-success-alert">
                        <span class="success-icon">✅</span>
                        <span class="success-text">{{ copySuccess }}</span>
                      </div>
                    </transition>
                  </div>
                </div>
              </div>

              <!-- Step 2: Payment Proof Upload -->
              <div v-if="currentStep === 2" class="form-step" key="step2">
                <div class="upload-section">
                  <div class="upload-header">
                    <h4 class="upload-title">
                      📷 Upload Payment Proof
                    </h4>
                    <p class="upload-subtitle">
                      Upload a screenshot or photo of your payment confirmation
                    </p>
                  </div>
                  
                  <div class="upload-area" 
                       @drop="handleFileDrop" 
                       @dragover.prevent 
                       @dragenter.prevent="isDragOver = true"
                       @dragleave="isDragOver = false"
                       :class="{ 
                         'drag-over': isDragOver, 
                         'has-file': selectedFile,
                         'error': fileError 
                       }">
                    <input 
                      ref="fileInput" 
                      type="file" 
                      accept="image/*" 
                      @change="handleFileSelect"
                      style="display: none"
                    />
                    
                    <div v-if="!selectedFile" class="upload-placeholder">
                      <div class="upload-icon">
                        📤
                      </div>
                      <h5 class="upload-text">Drop files here or</h5>
                      <button type="button" @click="$refs.fileInput.click()" class="upload-btn">
                        Browse files
                      </button>
                      <div class="upload-info">
                        <div class="info-item">
                          🖼️ JPG, PNG, GIF
                        </div>
                        <div class="info-item">
                          📏 Max 5MB
                        </div>
                      </div>
                    </div>
                    
                    <div v-else class="file-preview">
                      <div class="preview-container">
                        <img v-if="filePreview" :src="filePreview" alt="Payment proof" class="preview-image" />
                        <div class="file-actions">
                          <button type="button" @click="removeFile" class="action-btn danger">
                            🗑️
                          </button>
                          <button type="button" @click="$refs.fileInput.click()" class="action-btn">
                            🔄
                          </button>
                        </div>
                      </div>
                      <div class="file-info">
                        <div class="file-name">{{ selectedFile.name }}</div>
                        <div class="file-details">
                          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                          <div class="file-status success">
                            ✅ Ready to upload
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="fileError" class="error-message">
                    ⚠️ {{ fileError }}
                  </div>

                  <div class="additional-fields">
                    <div class="input-group">
                      <label class="input-label">
                        🧾 Transaction Reference
                        <span class="optional">(Optional)</span>
                      </label>
                      <input 
                        type="text" 
                        v-model="transactionReference"
                        class="text-input"
                        placeholder="Enter transaction ID or reference"
                        maxlength="100"
                      />
                    </div>

                    <div class="input-group">
                      <label class="input-label">
                        💬 Notes
                        <span class="optional">(Optional)</span>
                      </label>
                      <textarea 
                        v-model="userNotes"
                        class="textarea-input"
                        placeholder="Add any additional information..."
                        rows="3"
                        maxlength="1000"
                      ></textarea>
                      <div class="char-counter">{{ userNotes.length }}/1000</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 3: Confirmation -->
              <div v-if="currentStep === 3" class="form-step" key="step3">
                <div class="confirmation-section">
                  <div class="confirmation-header">
                    <div class="confirmation-icon">
                      🎯
                    </div>
                    <div>
                      <h4 class="confirmation-title">Confirm Deposit</h4>
                      <p class="confirmation-subtitle">Please review your deposit details</p>
                    </div>
                  </div>
                  
                  <div class="confirmation-card">
                    <div class="confirmation-row">
                      <span class="row-label">Deposit amount</span>
                      <span class="row-value highlight">{{ formatAmount(depositAmount) }} GHS</span>
                    </div>
                    <div class="confirmation-row">
                      <span class="row-label">Processing fee</span>
                      <span class="row-value success">🎁 Free</span>
                    </div>
                    <div class="confirmation-row total">
                      <span class="row-label">You will receive</span>
                      <span class="row-value highlight">{{ formatAmount(depositAmount) }} GHS</span>
                    </div>
                    <div v-if="transactionReference" class="confirmation-row">
                      <span class="row-label">Transaction reference</span>
                      <span class="row-value">{{ transactionReference }}</span>
                    </div>
                    <div class="confirmation-row">
                      <span class="row-label">Processing time</span>
                      <span class="row-value">⚡ 15-30 minutes</span>
                    </div>
                  </div>
                  
                  <div class="security-notice">
                    <div class="notice-icon">
                      🛡️
                    </div>
                    <div class="notice-content">
                      <h5>Security Notice</h5>
                      <p>Your deposit will be reviewed by our security team and processed within 15-30 minutes. You will receive an email notification once approved.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Navigation -->
              <div class="form-navigation">
                <button 
                  v-if="currentStep > 1"
                  type="button" 
                  @click="previousStep"
                  class="nav-btn secondary"
                >
                  ← Back
                </button>
                <button 
                  v-if="currentStep < 3"
                  type="button" 
                  @click="nextStep"
                  class="nav-btn primary"
                  :disabled="!canProceed"
                >
                  Continue →
                </button>
                <button 
                  v-if="currentStep === 3"
                  type="button" 
                  @click="submitDeposit"
                  class="nav-btn primary large"
                  :disabled="isProcessing"
                >
                  <span v-if="isProcessing">⏳ Processing...</span>
                  <span v-else">🚀 Confirm Deposit</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Messages -->
        <transition name="fade">
          <div v-if="successMessage" class="status-alert success">
            <div class="alert-icon">🎉</div>
            <div class="alert-content">
              <h5>Deposit Submitted Successfully!</h5>
              <p>{{ successMessage }}</p>
            </div>
            <button @click="dismissSuccess" class="alert-close">×</button>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="errorMessage" class="status-alert error">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
              <h5>Deposit Failed</h5>
              <p>{{ errorMessage }}</p>
            </div>
            <button @click="dismissError" class="alert-close">×</button>
          </div>
        </transition>
      </div>

      <!-- Sidebar -->
      <div class="deposit-sidebar">
        <!-- Recent Deposits -->
        <div class="sidebar-card">
          <div class="card-header">
            <h4 class="card-title">
              📊 Recent deposits
            </h4>
            <button class="header-btn" @click="showAllDeposits">
              <span>View all</span>
            </button>
          </div>
          
          <div class="card-content">
            <div v-if="recentDeposits.length > 0" class="deposits-list">
              <div v-for="deposit in recentDeposits" :key="deposit.id" class="deposit-item">
                <div class="deposit-main">
                  <div class="deposit-amount">{{ formatAmount(deposit.amount) }} GHS</div>
                  <div class="deposit-time">{{ formatDate(deposit.created_at) }}</div>
                </div>
                <div class="deposit-status" :class="deposit.status.toLowerCase()">
                  {{ formatStatus(deposit.status) }}
                </div>
              </div>
            </div>
            
            <div v-else class="empty-state">
              <div class="empty-icon">📥</div>
              <div class="empty-text">
                <p>No recent deposits</p>
                <span>Your deposit history will appear here</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Deposit Guide -->
        <div class="sidebar-card">
          <div class="card-header">
            <h4 class="card-title">
              💡 How to deposit
            </h4>
          </div>
          
          <div class="card-content">
            <div class="guide-steps">
              <div class="guide-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h5>Enter amount</h5>
                  <p>Choose deposit amount (min 100 GHS)</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h5>Upload proof</h5>
                  <p>Upload payment confirmation screenshot</p>
                </div>
              </div>
              <div class="guide-step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h5>Start earning</h5>
                  <p>Approval within 15-30 minutes, then start earning!</p>
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
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/auth'

export default {
  name: 'FundyDeposit',
  data() {
    return {
      currentStep: 1,
      steps: ['Amount', 'Upload', 'Confirm'],
      
      depositAmount: '',
      transactionReference: '',
      userNotes: '',
      selectedFile: null,
      filePreview: null,
      isDragOver: false,
      showBalance: true,
      
      amountError: '',
      fileError: '',
      
      isProcessing: false,
      refreshing: false,
      successMessage: '',
      errorMessage: '',
      showHistory: false,
      copySuccess: '', // Added for crypto address copying
      
      currentBalance: 0,
      recentDeposits: [],
      
      quickAmounts: [100, 500, 1000, 2500, 5000],
      maxFileSize: 5 * 1024 * 1024, // 5MB
    }
  },
  
  computed: {
    userId() {
      return localStorage.getItem('user_id')
    },
    userUsername() {
      return localStorage.getItem('username') || 'User'
    },
    canProceed() {
      if (this.currentStep === 1) {
        return this.depositAmount && !this.amountError && parseFloat(this.depositAmount) >= 100
      }
      if (this.currentStep === 2) {
        return this.selectedFile && !this.fileError
      }
      return true
    }
  },
  
  methods: {
    async fetchData() {
      try {
        if (!this.userId) {
          this.errorMessage = 'Please log in to access this page'
          return
        }
        
        // Get user data and deposits
        const [userResponse, depositsResponse] = await Promise.all([
          AuthService.getCurrentUser(),
          AuthService.getMyDeposits({ size: 5 })
        ])
        
        // Set balance from user data
        if (userResponse && userResponse.balance !== undefined) {
          this.currentBalance = userResponse.balance
        }
        
        // Set recent deposits
        this.recentDeposits = depositsResponse.items || []
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
      this.depositAmount = amount.toString()
      this.validateAmount()
    },

    setMaxAmount() {
      this.depositAmount = '10000'
      this.validateAmount()
    },

    validateAmount() {
      this.amountError = ''
      const amount = parseFloat(this.depositAmount)
      if (isNaN(amount) || amount <= 0) {
        this.amountError = 'Please enter a valid amount'
      } else if (amount < 100) {
        this.amountError = 'Minimum deposit is 100.00 GHS'
      } else if (amount > 10000) {
        this.amountError = 'Maximum deposit is 10,000.00 GHS'
      }
    },

    nextStep() {
      if (this.canProceed && this.currentStep < 3) {
        this.currentStep++
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--
      }
    },

    handleFileSelect(event) {
      const file = event.target.files[0]
      this.processFile(file)
    },

    handleFileDrop(event) {
      event.preventDefault()
      this.isDragOver = false
      const file = event.dataTransfer.files[0]
      this.processFile(file)
    },

    processFile(file) {
      this.fileError = ''
      if (!file) return
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.fileError = 'Please select an image file'
        return
      }
      
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.fileError = 'File size must be less than 5MB'
        return
      }
      
      this.selectedFile = file
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        this.filePreview = e.target.result
      }
      reader.readAsDataURL(file)
    },

    removeFile() {
      this.selectedFile = null
      this.filePreview = null
      this.fileError = ''
    },

    async uploadFileToServer() {
      if (!this.selectedFile) return null
      
      try {
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('file', this.selectedFile)
        
        // Use the correct upload endpoint
        const response = await AuthService.apiClient.post('/deposits/upload/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        return response.data.url || response.data.file_url
      } catch (error) {
        console.error('File upload error:', error)
        throw new Error('Failed to upload file')
      }
    },

    async submitDeposit() {
      this.isProcessing = true
      this.errorMessage = ''
      this.successMessage = ''
      
      try {
        // Upload file first
        const imageUrl = await this.uploadFileToServer()
        
        // Prepare deposit data
        const depositData = {
          amount: parseFloat(this.depositAmount),
          currency: 'GHS',
          user_notes: this.userNotes || null,
          image_url: imageUrl,
          transaction_reference: this.transactionReference || null,
          
        }
        
        // Submit deposit using correct endpoint
        const response = await AuthService.createDeposit(depositData)
        
        // Show success message
        this.successMessage = `Deposit of ${this.formatAmount(this.depositAmount)} GHS submitted successfully! Reference: ${response.reference_number || response.id}`
        
        // Reset form
        this.resetForm()
        
        // Refresh data
        await this.fetchData()
        
      } catch (error) {
        console.error('Error submitting deposit:', error)
        this.errorMessage = error.response?.data?.detail || 'Failed to submit deposit. Please try again.'
      } finally {
        this.isProcessing = false
      }
    },

    resetForm() {
      this.currentStep = 1
      this.depositAmount = ''
      this.transactionReference = ''
      this.userNotes = ''
      this.selectedFile = null
      this.filePreview = null
      this.amountError = ''
      this.fileError = ''
      this.isDragOver = false
      this.copySuccess = ''
    },

    // Crypto address copy functionality
    async copyToClipboard(text, type) {
      try {
        await navigator.clipboard.writeText(text);
        this.copySuccess = `${type} copied to clipboard!`;
        
        setTimeout(() => {
          this.copySuccess = '';
        }, 3000);
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          this.copySuccess = `${type} copied to clipboard!`;
          setTimeout(() => {
            this.copySuccess = '';
          }, 3000);
        } catch (err) {
          console.error('Copy failed:', err);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    },

    formatAmount(amount) {
      return parseFloat(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

    showAllDeposits() {
      this.$router.push('/deposits/history')
    },

    dismissSuccess() {
      this.successMessage = ''
    },

    dismissError() {
      this.errorMessage = ''
    },

    // Auto-refresh balance when component is visible
    startBalanceRefresh() {
      this.balanceRefreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible' && !this.refreshing) {
          this.refreshBalance()
        }
      }, 30000) // Refresh every 30 seconds
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

.deposit-container {
  background: #0b0e11;
  color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.deposit-header {
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

/* Crypto Address Section Styles */
.crypto-address-section {
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.crypto-header {
  text-align: center;
  margin-bottom: 20px;
}

.crypto-title {
  font-size: 16px;
  font-weight: 600;
  color: #8b5cf6;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.crypto-subtitle {
  color: #848e9c;
  font-size: 13px;
  margin: 0;
}

.crypto-address-card {
  background: #1e2329;
  border: 1px solid #474d57;
  border-radius: 12px;
  padding: 20px;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #474d57;
}

.crypto-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
}

.crypto-name {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 2px 0;
}

.crypto-network {
  font-size: 12px;
  color: #8b5cf6;
  margin: 0;
}

.address-field {
  margin-bottom: 16px;
}

.address-label {
  display: block;
  font-size: 12px;
  color: #848e9c;
  font-weight: 500;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.copy-field {
  display: flex;
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.copy-field:focus-within {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.address-input {
  flex: 1;
  padding: 12px 14px;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.copy-btn {
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-left: 1px solid #474d57;
  color: #848e9c;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  font-size: 14px;
}

.copy-btn:hover {
  background: #8b5cf6;
  color: white;
}

.copy-btn.copied {
  background: #22c55e;
  color: white;
  animation: copyPulse 0.3s ease-out;
}

@keyframes copyPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.amount-display {
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.amount-label {
  font-size: 13px;
  color: #848e9c;
}

.amount-value {
  font-size: 14px;
  font-weight: 600;
  color: #8b5cf6;
  font-family: 'Courier New', monospace;
}

.amount-note {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
}

.crypto-warning {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(250, 140, 22, 0.1);
  border: 1px solid rgba(250, 140, 22, 0.3);
  border-radius: 8px;
  padding: 12px;
}

.warning-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.warning-text {
  font-size: 12px;
  color: #d1d5db;
  line-height: 1.4;
}

.warning-text strong {
  color: #fa8c16;
}

.copy-success-alert {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 10px 16px;
  margin-top: 12px;
  color: #22c55e;
  font-size: 13px;
  font-weight: 500;
  animation: fadeInSlide 0.3s ease-out;
}

@keyframes fadeInSlide {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  font-size: 14px;
}

.success-text {
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.deposit-container {
  background: #0b0e11;
  color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.deposit-header {
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
.deposit-body {
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
.deposit-form-section {
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

.currency-selector {
  display: flex;
  align-items: center;
}

.selected-currency {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 8px;
}

.currency-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f0b90b;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.currency-code {
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
}

.currency-name {
  font-size: 12px;
  color: #848e9c;
}

/* Progress Steps */
.progress-section {
  padding: 24px;
  border-bottom: 1px solid #474d57;
}

.progress-bar {
  height: 2px;
  background: #0b0e11;
  border-radius: 1px;
  margin-bottom: 20px;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f0b90b, #f8d12f);
  border-radius: 1px;
  transition: width 0.3s ease;
}

.step-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0b0e11;
  border: 2px solid #474d57;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #848e9c;
  transition: all 0.3s ease;
}

.step-indicator.active .step-circle {
  background: #f0b90b;
  border-color: #f0b90b;
  color: #000000;
}

.step-indicator.completed .step-circle {
  background: #03a66d;
  border-color: #03a66d;
  color: white;
}

.step-label {
  font-size: 12px;
  color: #848e9c;
  font-weight: 500;
}

.step-indicator.active .step-label {
  color: #f0b90b;
}

.step-indicator.completed .step-label {
  color: #03a66d;
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

.amount-btn:hover {
  background: #2b3139;
  border-color: #f0b90b;
  color: #f0b90b;
}

.amount-btn.active {
  background: rgba(240, 185, 11, 0.1);
  border-color: #f0b90b;
  color: #f0b90b;
}

/* Deposit Info */
.deposit-info {
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

/* Upload Section */
.upload-section {
  margin-bottom: 24px;
}

.upload-header {
  margin-bottom: 20px;
}

.upload-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
}

.upload-subtitle {
  color: #848e9c;
  font-size: 14px;
  margin: 0;
}

.upload-area {
  border: 2px dashed #474d57;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  background: #0b0e11;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #f0b90b;
  background: rgba(240, 185, 11, 0.05);
}

.upload-area.drag-over {
  border-color: #03a66d;
  background: rgba(3, 166, 109, 0.05);
}

.upload-area.has-file {
  padding: 20px;
}

.upload-area.error {
  border-color: #cf304a;
  background: rgba(207, 48, 74, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #f0b90b, #f8d12f);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
}

.upload-btn {
  background: #f0b90b;
  color: #000000;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  opacity: 0.9;
}

.upload-info {
  display: flex;
  gap: 24px;
  justify-content: center;
}

.upload-info .info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #848e9c;
  font-size: 12px;
}

/* File Preview */
.file-preview {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.preview-container {
  position: relative;
  flex-shrink: 0;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #474d57;
}

.file-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
}

.file-actions .action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 12px;
}

.file-actions .action-btn.danger:hover {
  background: #cf304a;
  border-color: #cf304a;
  color: white;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
  word-break: break-word;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-size {
  font-size: 12px;
  color: #848e9c;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
}

.file-status.success {
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
}

/* Additional Fields */
.additional-fields {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #474d57;
}

/* Confirmation */
.confirmation-section {
  max-width: 500px;
  margin: 0 auto;
}

.confirmation-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.confirmation-icon {
  width: 48px;
  height: 48px;
  background: #03a66d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.confirmation-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #ffffff;
}

.confirmation-subtitle {
  color: #848e9c;
  font-size: 14px;
  margin: 0;
}

.confirmation-card {
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.confirmation-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #474d57;
}

.confirmation-row:last-child {
  border-bottom: none;
}

.confirmation-row.total {
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid #474d57;
  border-bottom: none;
}

.row-label {
  font-size: 14px;
  color: #848e9c;
}

.row-value {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.row-value.highlight {
  font-size: 16px;
  font-weight: 600;
  color: #f0b90b;
}

.row-value.success {
  color: #03a66d;
}

.security-notice {
  display: flex;
  gap: 12px;
  background: rgba(240, 185, 11, 0.05);
  border: 1px solid rgba(240, 185, 11, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.notice-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notice-content h5 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #f0b90b;
}

.notice-content p {
  font-size: 12px;
  color: #848e9c;
  line-height: 1.5;
  margin: 0;
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
}

.nav-btn.primary:hover:not(:disabled) {
  opacity: 0.9;
}

.nav-btn.large {
  padding: 16px 32px;
  font-size: 16px;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
.deposit-sidebar {
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

/* Deposits List */
.deposits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deposit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 8px;
}

.deposit-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.deposit-amount {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.deposit-time {
  font-size: 12px;
  color: #848e9c;
}

.deposit-status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.deposit-status.pending {
  background: rgba(250, 140, 22, 0.1);
  color: #fa8c16;
}

.deposit-status.approved,
.deposit-status.completed {
  background: rgba(3, 166, 109, 0.1);
  color: #03a66d;
}

.deposit-status.rejected {
  background: rgba(207, 48, 74, 0.1);
  color: #cf304a;
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
  .deposit-body {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .deposit-sidebar {
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
  .deposit-body {
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
  
  .confirmation-header {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .deposit-header {
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
  
  .upload-area {
    padding: 24px 16px;
  }
  
  .file-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}

/* Enhanced Visual Effects */
.balance-card,
.form-card,
.sidebar-card {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* Hover Effects */
.deposit-item:hover {
  background: #2b3139;
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

.amount-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(240, 185, 11, 0.15);
}

/* Success Animations */
@keyframes checkmark {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.step-indicator.completed .step-circle {
  animation: checkmark 0.3s ease-out;
}

/* Error Shake Animation */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.error-message {
  animation: shake 0.3s ease-out;
}

/* Enhanced Button States */
.nav-btn.primary {
  box-shadow: 0 4px 15px rgba(240, 185, 11, 0.3);
}

.nav-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(240, 185, 11, 0.4);
}

.nav-btn.primary:active {
  transform: translateY(0);
}

/* Micro Interactions */
.upload-area.drag-over {
  transform: scale(1.02);
}

.file-preview {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Status Indicator Animations */
.deposit-status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
  animation: pulse 2s infinite;
}

.deposit-status.pending::before {
  background: #fa8c16;
}

.deposit-status.approved::before,
.deposit-status.completed::before {
  background: #03a66d;
  animation: none;
}

.deposit-status.rejected::before {
  background: #cf304a;
  animation: none;
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

/* Dark theme loading state */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.skeleton {
  background: linear-gradient(90deg, #0b0e11 25%, #2b3139 50%, #0b0e11 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>