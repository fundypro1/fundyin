<template>
  <div class="investment-container">
    <!-- Header Section -->
    <div class="investment-header">
      <div class="header-content">
        <div class="title-section">
          <div class="breadcrumb">
            <span class="breadcrumb-item">Investments</span>
            <i class="fas fa-chevron-right"></i>
            <span class="breadcrumb-item active">Products</span>
          </div>
          <h1 class="page-title">💎 Investment Products</h1>
          <p class="page-subtitle">Choose your investment plan and start earning daily returns</p>
        </div>
        <div v-if="userId" class="user-info">
          <div class="user-avatar">{{ userUsername.charAt(0).toUpperCase() }}</div>
          <div class="user-details">
            <span class="username">@{{ userUsername }}</span>
            <span class="user-id">UID: {{ userId }}</span>
          </div>
          <!-- Mining Progress Display and Button -->
          <div class="mining-section">
            <!-- Mining Progress Display (shows when mining is active) -->
            <div v-if="isMining" class="mining-progress-container">
              <div class="mining-info">
                <div class="mining-status">
                  <span class="mining-icon">⛏️</span>
                  <span class="mining-text">Mining Active</span>
                </div>
                <div class="mining-time">{{ miningTimeRemaining }} remaining</div>
              </div>
              
              <!-- Progress Bar -->
              <div class="progress-bar-container">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: miningProgress + '%' }"
                  ></div>
                  <div class="progress-text">{{ Math.round(miningProgress) }}%</div>
                </div>
              </div>
              
              <!-- Mining Animation -->
              <div class="mining-animation">
                <div class="mining-particles">
                  <div class="particle" v-for="n in 8" :key="n"></div>
                </div>
                <div class="mining-pickaxe">⛏️</div>
              </div>
            </div>

            <!-- Mining Button -->
            <button 
              class="action-btn mining-btn" 
              :class="{ 
                'mining-active': isMining,
                'mining-disabled': miningButtonDisabled,
                'mining-ready': canMine && !isProcessing
              }"
              @click="startMining" 
              :disabled="miningButtonDisabled"
            >
              <span class="btn-content">
                <span class="btn-icon" v-if="!isProcessing && canMine">⛏️</span>
                <span class="btn-icon" v-else-if="isProcessing">⚡</span>
                <span class="btn-icon" v-else>🔒</span>
                <span class="btn-text">{{ miningButtonText }}</span>
              </span>
              
              <!-- Button shine effect for ready state -->
              <div v-if="canMine && !isProcessing" class="btn-shine"></div>
            </button>
          </div>

          <div class="balance-info">
            <div class="balance-label">Available Balance</div>
            <div class="balance-amount">
              <span class="currency">GHS</span>
              <span class="amount" v-if="showBalance">{{ formatAmount(currentBalance) }}</span>
              <span class="amount" v-else">****</span>
              <button class="visibility-btn" @click="showBalance = !showBalance">
                <span v-if="showBalance">👁</span>
                <span v-else">🙈</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="investment-body">
      <!-- Main Content -->
      <div class="investment-main">
        <!-- Balance Overview Card -->
        <div class="balance-overview">
          <div class="balance-card">
            <div class="balance-left">
              <div class="balance-icon">
                💰
              </div>
              <div class="balance-details">
                <span class="balance-title">Investment Capacity</span>
                <div class="balance-value">
                  <span class="currency">GHS</span>
                  <span class="amount">{{ formatAmount(currentBalance) }}</span>
                </div>
                <div class="balance-subtitle">Available for investment</div>
              </div>
            </div>
            <div class="balance-actions">
              <button class="action-btn" @click="refreshBalance" :disabled="refreshing">
                <span v-if="refreshing">⏳</span>
                <span v-else">🔄</span>
              </button>
              <button class="action-btn deposit-btn" @click="goToDeposit">
                ➕ Add Funds
              </button>
            </div>
          </div>
        </div>

        <!-- Investment Products Grid -->
        <div class="products-section">
          <div class="section-header">
            <h2 class="section-title">💎 Investment Plans</h2>
            <div class="section-filters">
              <button 
                class="filter-btn" 
                :class="{ active: selectedFilter === 'all' }"
                @click="selectedFilter = 'all'"
              >
                All Plans
              </button>
              <button 
                class="filter-btn" 
                :class="{ active: selectedFilter === 'available' }"
                @click="selectedFilter = 'available'"
              >
                Available
              </button>
              <button 
                class="filter-btn" 
                :class="{ active: selectedFilter === 'locked' }"
                @click="selectedFilter = 'locked'"
              >
                Locked
              </button>
            </div>
          </div>

          <div class="products-grid">
            <div 
              v-for="product in filteredProducts" 
              :key="product.name"
              class="product-card"
              :class="{ 
                locked: !canAffordProduct(product), 
                recommended: product.name === 'Gold',
                premium: ['Diamond', 'Platinum', 'Emerald', 'Ruby', 'Crown', 'Infinity'].includes(product.name)
              }"
            >
              <!-- Product Header -->
              <div class="product-header">
                <div class="product-icon">{{ product.icon }}</div>
                <div class="product-info">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <div class="product-tier">{{ product.tier }}</div>
                </div>
                <div class="product-badge" v-if="product.name === 'Gold'">
                  🔥 POPULAR
                </div>
                <div class="product-badge premium-badge" v-else-if="product.premium">
                  ✨ PREMIUM
                </div>
              </div>

              <!-- Product Stats -->
              <div class="product-stats">
                <div class="stat-row main-stat">
                  <div class="stat-label">Daily Return Rate</div>
                  <div class="stat-value highlight">{{ (product.rate * 100).toFixed(2) }}%</div>
                </div>
                <div class="stat-row">
                  <div class="stat-label">Min Investment</div>
                  <div class="stat-value">{{ formatAmount(product.minAmount) }} GHS</div>
                </div>
                <div class="stat-row">
                  <div class="stat-label">Duration</div>
                  <div class="stat-value">30 Days</div>
                </div>
                <div class="stat-row">
                  <div class="stat-label">Total Return</div>
                  <div class="stat-value success">{{ (product.rate * 30 * 100).toFixed(1) }}%</div>
                </div>
              </div>

              <!-- Investment Input -->
              <div class="investment-section">
                <div class="input-group">
                  <label class="input-label">Investment Amount (GHS)</label>
                  <div class="amount-input-wrapper">
                    <input 
                      type="number" 
                      v-model="product.investmentAmount"
                      :min="product.minAmount"
                      :max="currentBalance"
                      :step="100"
                      :disabled="!canAffordProduct(product)"
                      class="amount-input"
                      :placeholder="`Min ${formatAmount(product.minAmount)}`"
                      @input="validateInvestmentAmount(product)"
                    />
                    <button 
                      class="max-btn" 
                      @click="setMaxInvestment(product)"
                      :disabled="!canAffordProduct(product)"
                    >
                      MAX
                    </button>
                  </div>
                  <div v-if="product.error" class="error-message">
                    ⚠️ {{ product.error }}
                  </div>
                </div>

                <!-- Projected Earnings -->
                <div v-if="product.investmentAmount && !product.error" class="earnings-preview">
                  <div class="preview-row">
                    <span class="preview-label">Daily Earning</span>
                    <span class="preview-value">{{ formatAmount(calculateDailyEarning(product)) }} GHS</span>
                  </div>
                  <div class="preview-row total">
                    <span class="preview-label">Total After 30 Days</span>
                    <span class="preview-value highlight">{{ formatAmount(calculateTotalReturn(product)) }} GHS</span>
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <div class="product-actions">
                <button 
                  v-if="canAffordProduct(product)"
                  class="invest-btn"
                  :class="{ premium: product.premium }"
                  :disabled="!product.investmentAmount || product.error || isInvesting"
                  @click="investInProduct(product)"
                >
                  <span v-if="isInvesting && selectedProduct === product.name">⏳ Investing...</span>
                  <span v-else>🚀 Invest Now</span>
                </button>
                <button v-else class="locked-btn" disabled>
                  🔒 Insufficient Balance
                </button>
                <div class="requirement-note" v-if="!canAffordProduct(product)">
                  Need {{ formatAmount(product.minAmount - currentBalance) }} more GHS
                </div>
              </div>

              <!-- Lock Overlay for unavailable products -->
              <div v-if="!canAffordProduct(product)" class="lock-overlay">
                <div class="lock-content">
                  <div class="lock-icon">🔒</div>
                  <div class="lock-text">
                    <div class="lock-title">Insufficient Balance</div>
                    <div class="lock-subtitle">
                      Need {{ formatAmount(product.minAmount) }} GHS minimum
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Investments Summary -->
        <div v-if="activeInvestments.length > 0" class="active-investments">
          <div class="section-header">
            <h2 class="section-title">📊 Your Active Investments</h2>
            <button class="view-all-btn" @click="viewAllInvestments">
              View All →
            </button>
          </div>
          
          <div class="investments-grid">
            <div 
              v-for="investment in activeInvestments.slice(0, 3)" 
              :key="investment.id"
              class="investment-card"
            >
              <div class="investment-header">
                <div class="investment-name">{{ investment.product_name }}</div>
                <div class="investment-status active">Active</div>
              </div>
              <div class="investment-stats">
                <div class="stat-item">
                  <span class="stat-label">Amount</span>
                  <span class="stat-value">{{ formatAmount(investment.purchase_price) }} GHS</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Daily Rate</span>
                  <span class="stat-value">{{ (investment.daily_earning_rate * 100).toFixed(2) }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Days Left</span>
                  <span class="stat-value">{{ investment.days_remaining }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Earned</span>
                  <span class="stat-value success">{{ formatAmount(investment.total_earnings_credited) }} GHS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Success/Error Messages -->
        <transition name="fade">
          <div v-if="successMessage" class="status-alert success">
            <div class="alert-icon">🎉</div>
            <div class="alert-content">
              <h5>Investment Successful!</h5>
              <p>{{ successMessage }}</p>
            </div>
            <button @click="successMessage = ''" class="alert-close">×</button>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="errorMessage" class="status-alert error">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
              <h5>Investment Failed</h5>
              <p>{{ errorMessage }}</p>
            </div>
            <button @click="errorMessage = ''" class="alert-close">×</button>
          </div>
        </transition>
      </div>

      <!-- Sidebar -->
      <div class="investment-sidebar">
        <!-- Quick Stats -->
        <div class="sidebar-card">
          <div class="card-header">
            <h4 class="card-title">📈 Quick Stats</h4>
          </div>
          <div class="card-content">
            <div class="quick-stats">
              <div class="quick-stat">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                  <div class="stat-number">{{ formatAmount(currentBalance) }}</div>
                  <div class="stat-label">Available Balance</div>
                </div>
              </div>
              <div class="quick-stat">
                <div class="stat-icon">🚀</div>
                <div class="stat-info">
                  <div class="stat-number">{{ activeInvestments.length }}</div>
                  <div class="stat-label">Active Investments</div>
                </div>
              </div>
              <div class="quick-stat">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                  <div class="stat-number">{{ formatAmount(totalEarnings) }}</div>
                  <div class="stat-label">Total Earnings</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Investment Guide -->
        <div class="sidebar-card">
          <div class="card-header">
            <h4 class="card-title">💡 Investment Guide</h4>
          </div>
          <div class="card-content">
            <div class="guide-content">
              <div class="guide-item">
                <div class="guide-icon">🎯</div>
                <div class="guide-text">
                  <h5>Choose Your Plan</h5>
                  <p>Select based on your balance and risk appetite</p>
                </div>
              </div>
              <div class="guide-item">
                <div class="guide-icon">💎</div>
                <div class="guide-text">
                  <h5>Start Earning</h5>
                  <p>Receive daily returns for 30 days automatically</p>
                </div>
              </div>
              <div class="guide-item">
                <div class="guide-icon">🔄</div>
                <div class="guide-text">
                  <h5>Reinvest</h5>
                  <p>Compound your earnings for maximum growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Comparison -->
        <div class="sidebar-card">
          <div class="card-header">
            <h4 class="card-title">⚖️ Plan Comparison</h4>
          </div>
          <div class="card-content">
            <div class="comparison-table">
              <div class="comparison-header">
                <div class="col">Plan</div>
                <div class="col">Rate</div>
                <div class="col">Min</div>
              </div>
              <div 
                v-for="product in products.slice(0, 4)" 
                :key="product.name"
                class="comparison-row"
                :class="{ unavailable: !canAffordProduct(product) }"
              >
                <div class="col">
                  <span class="product-icon-small">{{ product.icon }}</span>
                  {{ product.name }}
                </div>
                <div class="col rate">{{ (product.rate * 100).toFixed(1) }}%</div>
                <div class="col min">{{ formatAmount(product.minAmount) }}</div>
              </div>
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
  name: 'InvestmentPage',
  data() {
    return {
      currentBalance: 0,
      showBalance: true,
      refreshing: false,
      isInvesting: false,
      isProcessing: false,
      selectedProduct: null,
      selectedFilter: 'all',
      successMessage: '',
      errorMessage: '',
      activeInvestments: [],
      totalEarnings: 0,
      isMining: false,
      miningCooldownEnd: null,
      miningProgress: 0,
      miningTimeRemaining: '',
      miningInterval: null,
      lastMiningTime: null,
      userEarnings: 0,
      
      products: [
        {
          name: 'Silver',
          icon: '🥈',
          tier: 'Basic Plan',
          rate: 0.09,
          minAmount: 100,
          investmentAmount: '',
          error: '',
          premium: false
        },
        {
          name: 'Gold',
          icon: '🥇',
          tier: 'Popular Plan',
          rate: 0.19,
          minAmount: 300,
          investmentAmount: '',
          error: '',
          premium: false
        },
        {
          name: 'Diamond',
          icon: '💎',
          tier: 'Premium Plan',
          rate: 0.23,
          minAmount: 1000,
          investmentAmount: '',
          error: '',
          premium: true
        },
        {
          name: 'Platinum',
          icon: '⭐',
          tier: 'Elite Plan',
          rate: 0.37,
          minAmount: 2500,
          investmentAmount: '',
          error: '',
          premium: true
        },
        {
          name: 'Emerald',
          icon: '💚',
          tier: 'VIP Plan',
          rate: 0.41,
          minAmount: 5000,
          investmentAmount: '',
          error: '',
          premium: true
        },
        {
          name: 'Ruby',
          icon: '❤️',
          tier: 'Exclusive Plan',
          rate: 0.45,
          minAmount: 10000,
          investmentAmount: '',
          error: '',
          premium: true
        },
        {
          name: 'Crown',
          icon: '👑',
          tier: 'Royal Plan',
          rate: 0.49,
          minAmount: 25000,
          investmentAmount: '',
          error: '',
          premium: true
        },
        {
          name: 'Infinity',
          icon: '♾️',
          tier: 'Ultimate Plan',
          rate: 0.34,
          minAmount: 50000,
          investmentAmount: '',
          error: '',
          premium: true
        }
      ]
    }
  },
  
  computed: {
    userId() {
      return localStorage.getItem('user_id')
    },
    userUsername() {
      return localStorage.getItem('username') || 'User'
    },
    canMine() {
      // User must have active investments to be eligible for mining
      if (!this.activeInvestments || this.activeInvestments.length === 0) {
        return false;
      }
      
      // Check if user is in cooldown period
      if (!this.miningCooldownEnd) return true;
      return Date.now() > this.miningCooldownEnd;
    }, 
    miningButtonText() {
      if (!this.activeInvestments || this.activeInvestments.length === 0) {
        return 'Invest First to Mine';
      }
      if (this.isProcessing) return 'Mining...';
      if (this.isMining) return `Mining (${this.miningTimeRemaining})`;
      if (!this.canMine) return `Cooldown (${this.miningTimeRemaining})`;
      return 'Start Mining';
    },
    miningButtonDisabled() {
      // Disable if no investments, processing, or in cooldown
      return this.activeInvestments.length === 0 || this.isProcessing || !this.canMine;
    },
    filteredProducts() {
      if (this.selectedFilter === 'available') {
        return this.products.filter(product => this.canAffordProduct(product))
      } else if (this.selectedFilter === 'locked') {
        return this.products.filter(product => !this.canAffordProduct(product))
      }
      return this.products
    }
  },
  
  watch: {
    // Watch for userId changes (login/logout/user switch)
    userId(newUserId, oldUserId) {
      if (newUserId !== oldUserId) {
        console.log('User ID changed from', oldUserId, 'to', newUserId);
        this.handleUserChange();
      }
    }
  },
  
  methods: {
    async fetchData() {
      try {
        if (!this.userId) {
          this.errorMessage = 'Please log in to access investments'
          return
        }
        
        console.log('Fetching data for user:', this.userId);
        
        // Get user data and active purchases
        const [userResponse, purchasesResponse] = await Promise.all([
          AuthService.getCurrentUser(),
          AuthService.getMyPurchases({ active_only: true })
        ])
        
        console.log('User response:', userResponse);
        console.log('Purchases response:', purchasesResponse);
        
        if (userResponse && userResponse.balance !== undefined) {
          this.currentBalance = userResponse.balance
        }
        
        if (purchasesResponse && purchasesResponse.items) {
          this.activeInvestments = purchasesResponse.items
          this.totalEarnings = this.activeInvestments.reduce((sum, inv) => sum + (inv.total_earnings_credited || 0), 0)
        } else {
          // No investments found - clear mining state
          this.activeInvestments = []
          this.totalEarnings = 0
          this.clearMiningState()
        }
        
        console.log('Active investments:', this.activeInvestments);
        console.log('Can mine:', this.canMine);
        
      } catch (error) {
        console.error('Error fetching data:', error)
        this.errorMessage = 'Unable to fetch investment data'
        // Clear investments on error
        this.activeInvestments = []
        this.clearMiningState()
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

    canAffordProduct(product) {
      return this.currentBalance >= product.minAmount
    },

    validateInvestmentAmount(product) {
      product.error = ''
      const amount = parseFloat(product.investmentAmount)
      
      if (isNaN(amount) || amount <= 0) {
        product.error = 'Please enter a valid amount'
        return
      }
      
      if (amount < product.minAmount) {
        product.error = `Minimum investment is ${this.formatAmount(product.minAmount)} GHS`
        return
      }
      
      if (amount > this.currentBalance) {
        product.error = 'Insufficient balance'
        return
      }
    },

    setMaxInvestment(product) {
      if (this.canAffordProduct(product)) {
        product.investmentAmount = this.currentBalance.toString()
        this.validateInvestmentAmount(product)
      }
    },

    calculateDailyEarning(product) {
      if (!product.investmentAmount || product.error) return 0
      return parseFloat(product.investmentAmount) * product.rate
    },

    calculateTotalReturn(product) {
      if (!product.investmentAmount || product.error) return 0
      const principal = parseFloat(product.investmentAmount)
      const totalEarnings = principal * product.rate * 30
      return principal + totalEarnings
    },

    async investInProduct(product) {
      if (!product.investmentAmount || product.error) return
      
      this.isInvesting = true
      this.selectedProduct = product.name
      this.errorMessage = ''
      this.successMessage = ''
      
      try {
        const investmentData = {
          product_name: product.name,
          purchase_price: parseFloat(product.investmentAmount),
          daily_earning_rate: product.rate,
          earning_duration_days: 30,
          product_description: `${product.name} investment plan with ${(product.rate * 100).toFixed(2)}% daily returns`
        }
        
        const response = await AuthService.createPurchase(investmentData)
        
        this.successMessage = `Successfully invested ${this.formatAmount(product.investmentAmount)} GHS in ${product.name}! Reference: ${response.reference_number}`
        
        // Reset form and refresh data
        product.investmentAmount = ''
        product.error = ''
        await this.fetchData()
        
      } catch (error) {
        console.error('Investment error:', error)
        this.errorMessage = error.response?.data?.detail || 'Failed to create investment. Please try again.'
      } finally {
        this.isInvesting = false
        this.selectedProduct = null
      }
    },

    formatAmount(amount) {
      return parseFloat(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },

    goToDeposit() {
      this.$router.push('/deposit')
    },

    viewAllInvestments() {
      this.$router.push('/investments/history')
    },

    async startMining() {
      // Double check: Prevent mining if user has no active investments
      if (!this.activeInvestments || this.activeInvestments.length === 0) {
        this.errorMessage = 'You must have active investments before you can start mining.';
        this.clearMiningState(); // Clear any stale mining state
        return;
      }

      if (!this.canMine) return;
      
      this.isProcessing = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        // Calculate total daily earnings from all active investments
        const totalDailyEarnings = this.calculateTotalUserEarnings();
        
        if (totalDailyEarnings <= 0) {
          this.errorMessage = 'No earnings available for mining. Please check your active investments.';
          this.clearMiningState();
          return;
        }

        const earningData = {
          amount: parseFloat(totalDailyEarnings),
          status: "ACTIVE",
          created_at: new Date().toISOString()
        }

        const response = await AuthService.createEarning(earningData);

        this.successMessage = `Successfully mined ${this.formatAmount(response.amount)} GHS! Reference: ${response.id}`;
        
        // Start 24-hour cooldown (user-specific)
        this.startMiningCooldown();
        
        await this.fetchData(); // refresh balance + earnings
      } catch (error) {
        console.error('Error starting mining:', error);
        this.errorMessage = error.response?.data?.detail || 'Mining failed. Please try again.';
      } finally {
        this.isProcessing = false;
      }
    },

    calculateTotalUserEarnings() {
      if (!this.activeInvestments || this.activeInvestments.length === 0) {
        return 0;
      }
      
      return this.activeInvestments.reduce((total, investment) => {
        return total + (investment.purchase_price * investment.daily_earning_rate);
      }, 0);
    },

    startMiningCooldown() {
      const now = Date.now();
      const cooldownDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      this.lastMiningTime = now;
      this.miningCooldownEnd = now + cooldownDuration;
      this.isMining = true;
      
      // Store in localStorage with user ID to make it user-specific
      const userSpecificKey = `lastMiningTime_${this.userId}`;
      const userCooldownKey = `miningCooldownEnd_${this.userId}`;
      
      localStorage.setItem(userSpecificKey, now.toString());
      localStorage.setItem(userCooldownKey, this.miningCooldownEnd.toString());
      
      this.startMiningProgressUpdate();
    },

    startMiningProgressUpdate() {
      this.miningInterval = setInterval(() => {
        const now = Date.now();
        const totalDuration = 24 * 60 * 60 * 1000; // 24 hours
        const elapsed = now - this.lastMiningTime;
        const remaining = this.miningCooldownEnd - now;
        
        if (remaining <= 0) {
          // Mining complete
          this.completeMining();
          return;
        }
        
        // Update progress (0 to 100)
        this.miningProgress = (elapsed / totalDuration) * 100;
        
        // Update time remaining display
        this.miningTimeRemaining = this.formatTimeRemaining(remaining);
        
      }, 1000); // Update every second
    },

    completeMining() {
      this.isMining = false;
      this.miningProgress = 100;
      this.miningCooldownEnd = null;
      this.lastMiningTime = null;
      this.miningTimeRemaining = '';
      
      // Clear user-specific localStorage
      const userSpecificKey = `lastMiningTime_${this.userId}`;
      const userCooldownKey = `miningCooldownEnd_${this.userId}`;
      
      localStorage.removeItem(userSpecificKey);
      localStorage.removeItem(userCooldownKey);
      
      // Clear interval
      if (this.miningInterval) {
        clearInterval(this.miningInterval);
        this.miningInterval = null;
      }
      
      // Show completion notification
      this.successMessage = 'Mining cycle completed! You can start mining again.';
    },

    formatTimeRemaining(milliseconds) {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    },

    checkExistingMiningCooldown() {
      console.log('Checking existing mining cooldown for user:', this.userId);
      
      // Only check mining cooldown if user is logged in
      if (!this.userId) {
        this.clearMiningState();
        return;
      }
      
      const userSpecificKey = `lastMiningTime_${this.userId}`;
      const userCooldownKey = `miningCooldownEnd_${this.userId}`;
      
      const lastMiningTime = localStorage.getItem(userSpecificKey);
      const miningCooldownEnd = localStorage.getItem(userCooldownKey);
      
      console.log('Found mining data:', { lastMiningTime, miningCooldownEnd });
      
      if (lastMiningTime && miningCooldownEnd) {
        const now = Date.now();
        const cooldownEnd = parseInt(miningCooldownEnd);
        const storedLastTime = parseInt(lastMiningTime);
        
        // Validate that the stored times are reasonable (not corrupted)
        if (isNaN(storedLastTime) || isNaN(cooldownEnd) || storedLastTime > now || cooldownEnd < storedLastTime) {
          console.log('Invalid mining data found, clearing state');
          this.clearMiningState();
          return;
        }
        
        console.log('Active investments count:', this.activeInvestments?.length || 0);
        
        // IMPORTANT: Only restore mining state if user has active investments
        if (this.activeInvestments && this.activeInvestments.length > 0) {
          if (now < cooldownEnd) {
            // Still in cooldown and has investments - restore mining state
            this.lastMiningTime = storedLastTime;
            this.miningCooldownEnd = cooldownEnd;
            this.isMining = true;
            this.startMiningProgressUpdate();
            console.log('Restored mining cooldown for user with investments');
            console.log('Time remaining:', this.formatTimeRemaining(cooldownEnd - now));
          } else {
            // Cooldown expired, clean up
            console.log('Mining cooldown expired, clearing state');
            this.clearMiningState();
          }
        } else {
          // No investments, clear mining state regardless of cooldown
          console.log('User has no investments, clearing mining state');
          this.clearMiningState();
        }
      } else {
        console.log('No existing mining cooldown found');
      }
    },

    clearMiningState() {
      console.log('Clearing mining state for user:', this.userId);
      
      // Clear mining state variables
      this.isMining = false;
      this.miningProgress = 0;
      this.miningCooldownEnd = null;
      this.lastMiningTime = null;
      this.miningTimeRemaining = '';
      
      // Clear mining interval if running
      if (this.miningInterval) {
        clearInterval(this.miningInterval);
        this.miningInterval = null;
      }
      
      // Clear localStorage for current user if exists
      if (this.userId) {
        const userSpecificKey = `lastMiningTime_${this.userId}`;
        const userCooldownKey = `miningCooldownEnd_${this.userId}`;
        localStorage.removeItem(userSpecificKey);
        localStorage.removeItem(userCooldownKey);
        console.log('Cleared localStorage for user:', this.userId);
      }
      
      // Only clear orphaned data if we don't have a valid user or if explicitly clearing all
      if (!this.userId) {
        console.log('No user ID, clearing all orphaned mining data');
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('lastMiningTime_') || key.startsWith('miningCooldownEnd_')) {
            console.log('Removing orphaned localStorage key:', key);
            localStorage.removeItem(key);
          }
        });
      }
    },

    handleUserChange() {
      console.log('Handling user change');
      
      // Clear mining state when user changes
      this.clearMiningState();
      
      // Reset all user-specific data
      this.currentBalance = 0;
      this.activeInvestments = [];
      this.totalEarnings = 0;
      this.successMessage = '';
      this.errorMessage = '';
      
      // Fetch new user data
      if (this.userId) {
        this.fetchData().then(() => {
          // Only check cooldown after data is loaded
          this.$nextTick(() => {
            this.checkExistingMiningCooldown();
          });
        });
      }
    },

    // Debug method to check current mining state
    debugMiningState() {
      console.log('=== MINING DEBUG INFO ===');
      console.log('User ID:', this.userId);
      console.log('Is Mining:', this.isMining);
      console.log('Active Investments:', this.activeInvestments?.length || 0);
      console.log('Can Mine:', this.canMine);
      console.log('Mining Cooldown End:', this.miningCooldownEnd);
      console.log('Last Mining Time:', this.lastMiningTime);
      console.log('Mining Progress:', this.miningProgress);
      console.log('Time Remaining:', this.miningTimeRemaining);
      
      if (this.userId) {
        const userSpecificKey = `lastMiningTime_${this.userId}`;
        const userCooldownKey = `miningCooldownEnd_${this.userId}`;
        console.log('LocalStorage Mining Time:', localStorage.getItem(userSpecificKey));
        console.log('LocalStorage Cooldown End:', localStorage.getItem(userCooldownKey));
      }
      
      console.log('All Mining Keys in LocalStorage:');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('lastMiningTime_') || key.startsWith('miningCooldownEnd_')) {
          console.log(`  ${key}: ${localStorage.getItem(key)}`);
        }
      });
      console.log('========================');
    }
  },

  mounted() {
    console.log('Component mounted, user ID:', this.userId);
    
    // Don't clear mining state immediately - let checkExistingMiningCooldown handle it
    // Only clear if no user is logged in
    if (!this.userId) {
      this.clearMiningState();
      return;
    }
    
    // Fetch fresh data first
    this.fetchData().then(() => {
      // Check for existing cooldown after data is loaded
      this.$nextTick(() => {
        this.checkExistingMiningCooldown();
      });
    });
  },

  // Add this to handle cleanup when component is destroyed
  beforeUnmount() {
    if (this.miningInterval) {
      clearInterval(this.miningInterval);
    }
  }
}
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.investment-container {
  background: #0b0e11;
  color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.investment-header {
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
  gap: 16px;
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

.balance-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.balance-label {
  font-size: 12px;
  color: #848e9c;
  margin-bottom: 4px;
}

.balance-amount {
  display: flex;
  align-items: center;
  gap: 8px;
}

.currency {
  font-size: 12px;
  color: #f0b90b;
  font-weight: 500;
}

.amount {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.visibility-btn {
  background: none;
  border: none;
  color: #848e9c;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;
}

.visibility-btn:hover {
  color: #f0b90b;
}

/* Body */
.investment-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

/* Balance Overview */
.balance-overview {
  margin-bottom: 32px;
}

.balance-card {
  background: linear-gradient(135deg, #1e2329 0%, #2b3139 100%);
  border: 1px solid #f0b90b;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.balance-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.balance-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #f0b90b, #f8d12f);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.balance-title {
  display: block;
  color: #848e9c;
  font-size: 14px;
  margin-bottom: 8px;
}

.balance-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.balance-value .currency {
  font-size: 16px;
}

.balance-value .amount {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.balance-subtitle {
  color: #848e9c;
  font-size: 12px;
}

.balance-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 12px 16px;
  background: #0b0e11;
  border: 1px solid #474d57;
  border-radius: 8px;
  color: #848e9c;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
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

.deposit-btn {
  background: #f0b90b;
  color: #000000;
  border-color: #f0b90b;
}

.deposit-btn:hover {
  opacity: 0.9;
  color: #000000;
}

/* Products Section */
.products-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.section-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 16px;
  background: #2b3139;
  border: 1px solid #474d57;
  border-radius: 8px;
  color: #848e9c;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
}

.filter-btn:hover {
  background: #374151;
  color: #f0b90b;
}

.filter-btn.active {
  background: #f0b90b;
  color: #000000;
  border-color: #f0b90b;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.product-card {
  background: #1e2329;
  border: 1px solid #474d57;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.product-card:hover {
  border-color: #f0b90b;
  box-shadow: 0 8px 32px rgba(240, 185, 11, 0.1);
  transform: translateY(-2px);
}

.product-card.recommended {
  border-color: #f0b90b;
  background: linear-gradient(135deg, #1e2329 0%, #2a1e00 100%);
}

.product-card.premium {
  border: 2px solid transparent;
  background: linear-gradient(135deg, #1e2329, #2b3139) padding-box,
              linear-gradient(45deg, #f0b90b, #f8d12f, #8b5cf6, #06b6d4) border-box;
}

.product-card.locked {
  opacity: 0.6;
  pointer-events: none;
}

/* Product Header */
.product-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
}

.product-icon {
  width: 48px;
  height: 48px;
  background: #2b3139;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.product-tier {
  color: #848e9c;
  font-size: 14px;
  margin: 0;
}

.product-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f0b90b;
  color: #000000;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.premium-badge {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: #ffffff;
}

/* Product Stats */
.product-stats {
  margin-bottom: 24px;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 16px;
  background: #0f1419;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.stat-row:not(:last-child) {
  border-bottom: 1px solid #374151;
}

.stat-row.main-stat {
  padding: 12px 0;
  background: rgba(240, 185, 11, 0.05);
  margin: -16px -16px 8px -16px;
  padding: 16px;
  border-radius: 12px 12px 0 0;
}

.stat-label {
  color: #848e9c;
  font-size: 14px;
  font-weight: 500;
}

.stat-value {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
}

.stat-value.highlight {
  color: #f0b90b;
  font-size: 18px;
  font-weight: 700;
}

.stat-value.success {
  color: #22c55e;
}

/* Investment Section */
.investment-section {
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  color: #848e9c;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.amount-input-wrapper {
  display: flex;
  gap: 8px;
}

.amount-input {
  flex: 1;
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
}

.amount-input:focus {
  outline: none;
  border-color: #f0b90b;
  box-shadow: 0 0 0 3px rgba(240, 185, 11, 0.1);
}

.amount-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.max-btn {
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 8px;
  padding: 12px 16px;
  color: #d1d5db;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  transition: all 0.2s;
}

.max-btn:hover:not(:disabled) {
  background: #f0b90b;
  color: #000000;
  border-color: #f0b90b;
}

.max-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Earnings Preview */
.earnings-preview {
  background: #0f1419;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.preview-row:not(:last-child) {
  border-bottom: 1px solid #374151;
}

.preview-row.total {
  background: rgba(240, 185, 11, 0.05);
  margin: 8px -16px -16px -16px;
  padding: 16px;
  border-radius: 0 0 12px 12px;
  border-bottom: none;
}

.preview-label {
  color: #848e9c;
  font-size: 14px;
}

.preview-value {
  color: #22c55e;
  font-weight: 600;
  font-size: 14px;
}

.preview-value.highlight {
  color: #f0b90b;
  font-size: 16px;
  font-weight: 700;
}

/* Product Actions */
.product-actions {
  text-align: center;
}

.invest-btn, .locked-btn {
  width: 100%;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.invest-btn {
  background: linear-gradient(135deg, #f0b90b, #f8d12f);
  color: #000000;
}

.invest-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(240, 185, 11, 0.3);
}

.invest-btn.premium {
  background: linear-gradient(135deg, #8b5cf6, #06b6d4);
  color: #ffffff;
}

.invest-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.locked-btn {
  background: #374151;
  color: #848e9c;
  cursor: not-allowed;
}

.requirement-note {
  color: #ef4444;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
}

/* Lock Overlay */
.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(11, 14, 17, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.lock-content {
  text-align: center;
  color: #848e9c;
}

.lock-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.lock-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.lock-subtitle {
  font-size: 14px;
}

/* Active Investments */
.active-investments {
  margin-bottom: 40px;
}

.view-all-btn {
  background: none;
  border: 1px solid #474d57;
  border-radius: 8px;
  padding: 8px 16px;
  color: #f0b90b;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.view-all-btn:hover {
  background: #f0b90b;
  color: #000000;
}

.investments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.investment-card {
  background: #1e2329;
  border: 1px solid #474d57;
  border-radius: 12px;
  padding: 20px;
}

.investment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.investment-name {
  font-weight: 600;
  font-size: 16px;
  color: #ffffff;
}

.investment-status.active {
  background: #22c55e;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.investment-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .stat-label {
  color: #848e9c;
  font-size: 12px;
}

.stat-item .stat-value {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
}

.stat-item .stat-value.success {
  color: #22c55e;
}

/* Status Alerts */
.status-alert {
  position: fixed;
  top: 100px;
  right: 24px;
  z-index: 1000;
  max-width: 400px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.status-alert.success {
  background: #0f1f13;
  border-color: #22c55e;
  color: #ffffff;
}

.status-alert.error {
  background: #1f0f0f;
  border-color: #ef4444;
  color: #ffffff;
}

.alert-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.alert-content h5 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.alert-content p {
  margin: 0;
  font-size: 13px;
  color: #d1d5db;
}

.alert-close {
  background: none;
  border: none;
  color: #848e9c;
  cursor: pointer;
  font-size: 18px;
  margin-left: auto;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.alert-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Sidebar */
.investment-sidebar {
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
  padding: 20px 24px 16px;
  border-bottom: 1px solid #374151;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.card-content {
  padding: 20px 24px 24px;
}

/* Quick Stats */
.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  background: #2b3139;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-info .stat-label {
  color: #848e9c;
  font-size: 12px;
  font-weight: 500;
}

/* Investment Guide */
.guide-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.guide-item {
  display: flex;
  gap: 16px;
}

.guide-icon {
  width: 40px;
  height: 40px;
  background: #2b3139;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.guide-text h5 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
}

.guide-text p {
  margin: 0;
  font-size: 12px;
  color: #848e9c;
  line-height: 1.4;
}

/* Comparison Table */
.comparison-table {
  display: flex;
  flex-direction: column;
}

.comparison-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #374151;
  font-size: 12px;
  font-weight: 600;
  color: #848e9c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #2b3139;
  transition: all 0.2s;
}

.comparison-row:last-child {
  border-bottom: none;
}

.comparison-row:hover:not(.unavailable) {
  background: rgba(240, 185, 11, 0.05);
}

.comparison-row.unavailable {
  opacity: 0.5;
}

.comparison-row .col {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #ffffff;
}

.comparison-row .col.rate {
  color: #22c55e;
  font-weight: 600;
}

.comparison-row .col.min {
  color: #848e9c;
  font-size: 12px;
}

.product-icon-small {
  margin-right: 8px;
  font-size: 16px;
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .investment-body {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .investment-sidebar {
    order: -1;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .user-info {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  
  .balance-card {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    text-align: center;
  }
  
  .balance-actions {
    justify-content: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .status-alert {
    right: 16px;
    left: 16px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .investment-body {
    padding: 16px;
  }
  
  .investment-header {
    padding: 16px;
  }
  
  .product-card {
    padding: 16px;
  }
  
  .balance-card {
    padding: 16px;
  }
  
  .quick-stat {
    gap: 12px;
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .stat-number {
    font-size: 16px;
  }
}
</style>