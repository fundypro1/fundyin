<template>
  <div class="dashboard">

    
    <div class="container">
      <!-- Header with Live Stats -->
      <div class="header-section">
        <div class="welcome-text">
          <h1>Welcome back, @{{ userUsername }}!</h1>
          <p class="subtitle">Your earnings are growing • Live market data</p>
        </div>
        <div class="live-stats">
          <div class="stat-item">
            <span class="stat-label">Active Users</span>
            <span class="stat-value">{{ activeUsers.toLocaleString() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">24h Volume</span>
            <span class="stat-value">${{ totalVolume.toLocaleString() }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading your earnings data...</p>
      </div>
      
      <div v-else>
        <!-- Main Balance Section -->
        <div class="balance-section">
          <div class="main-balance-card">
            <div class="balance-header">
              <div class="balance-info">
                <span class="balance-label">Available Balance</span>
                <div class="balance-toggle" @click="showBalance = !showBalance">
                  <i :class="showBalance ? 'eye-icon' : 'eye-slash-icon'">👁</i>
                </div>
              </div>
              <div class="balance-amount">
                <span class="currency">GHS</span>
                <span class="amount" v-if="showBalance">{{ formatAmount(currentBalance) }}</span>
                <span class="amount" v-else>****</span>
              </div>
              <div class="balance-change" :class="{ positive: dailyChange >= 0, negative: dailyChange < 0 }">
                <span class="change-arrow">{{ dailyChange >= 0 ? '↗' : '↘' }}</span>
                <span>{{ dailyChange >= 0 ? '+' : '' }}{{ dailyChange.toFixed(2) }}% (24h)</span>
              </div>
              

            </div>
          </div>
          

          <!-- Earnings Card -->
          <div class="earnings-card">
            <div class="earnings-header">
              <h3>Mining</h3>
              <div class="earning-status active">
                <div class="status-dot"></div>
                <span>Active</span>
              </div>
            </div>
            
            <div class="earnings-section">
  <div class="earnings-card">
    <div class="earnings-header">
      <div class="earnings-icon">💰</div>
      <div class="earnings-info">
        <h4 class="earnings-title">Total Earnings</h4>
        <div class="earnings-amount">
          <span class="currency">GHS</span>
          <span class="amount">{{ formatAmount(totalEarnings) }}</span>
        </div>
        <div class="earnings-max">
          Max: {{ formatAmount(maxEarnings) }} GHS
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="earnings-progress">
      <div class="progress-header">
        <span class="progress-label">Earnings Progress</span>
        <span class="progress-percentage">{{ Math.round(earningsProgress) }}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-track">
          <div 
            class="progress-bar-fill"
            :style="{ width: earningsProgress + '%' }"
            :class="{ 'progress-complete': canCreditEarnings }"
          ></div>
        </div>
      </div>
      <div class="progress-footer">
        <span v-if="!canCreditEarnings" class="remaining-text">
          {{ formatAmount(remainingEarnings) }} GHS remaining to credit
        </span>
        <span v-else class="complete-text">
          🎉 Ready to credit earnings!
        </span>
      </div>
    </div>

    <!-- Credit Button -->
    <div class="credit-section">
      <button 
        @click="creditTotalEarnings"
        :class="creditButtonClass"
        :disabled="!canCreditEarnings || isCreditingEarnings"
      >
        <div class="btn-content">
          <span class="btn-icon">
            <span v-if="isCreditingEarnings">⏳</span>
            <span v-else-if="canCreditEarnings">💎</span>
            <span v-else>🔒</span>
          </span>
          <span class="btn-text">{{ creditButtonText }}</span>
        </div>
        <div v-if="canCreditEarnings && !isCreditingEarnings" class="btn-shine"></div>
      </button>

      <!-- Requirements Info -->
      <div v-if="!canCreditEarnings" class="requirements-info">
        <div class="requirement-item">
          <span class="requirement-icon">📈</span>
          <span class="requirement-text">
            Reach {{ formatAmount(maxEarnings) }} GHS in total earnings to unlock
          </span>
        </div>
        <div class="requirement-item">
          <span class="requirement-icon">⚡</span>
          <span class="requirement-text">
            Credits directly to your account balance
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Success Message -->
  <transition name="fade">
    <div v-if="creditEarningsMessage" class="credit-success-alert">
      <div class="alert-icon">🎉</div>
      <div class="alert-content">
        <h5>Earnings Credited Successfully!</h5>
        <p>{{ creditEarningsMessage }}</p>
      </div>
      <button @click="creditEarningsMessage = ''" class="alert-close">×</button>
    </div>
  </transition>
</div>
            <div class="earnings-rate">
              <span>+{{ earningRate }}% hourly rate</span>
            </div>
          </div>
        </div>

        <!-- Action Cards -->
        <div class="action-section">
          <div class="action-card deposit-card" @click="$router.push('/deposit')">
            <div class="card-icon">💰</div>
            <div class="card-content">
              <h3>Quick Deposit</h3>
              <p>Add funds and start earning immediately</p>
              <span class="card-tag">Instant</span>
            </div>
          </div>
          
          <div class="action-card withdraw-card" @click="$router.push('/withdraw')">
            <div class="card-icon">🏦</div>
            <div class="card-content">
              <h3>Withdraw</h3>
              <p>Cash out your profits anytime</p>
              <span class="card-tag">24/7</span>
            </div>
          </div>
          
          <div class="action-card purchase-card" @click="$router.push('/investments')">
            <div class="card-icon">📈</div>
            <div class="card-content">
              <h3>Investment Plans</h3>
              <p>Buy premium plans for higher returns</p>
              <span class="card-tag">High ROI</span>
            </div>
          </div>
        </div>

        <!-- Live Trading Feed -->
        <div class="live-feed-section">
          <div class="section-header">
            <h2>🔥 Live Earnings Feed</h2>
            <div class="live-indicator">
              <div class="pulse-dot"></div>
              <span>Live</span>
            </div>
          </div>
          
          <div class="feed-container">
            <div 
              v-for="(transaction, index) in liveFeed" 
              :key="index"
              class="feed-item"
              :class="{ 'fade-in': transaction.isNew }"
            >
              <div class="user-avatar">
                <div class="avatar-circle">{{ transaction.user.charAt(0) }}</div>
              </div>
              <div class="transaction-info">
                <div class="user-action">
                  <strong>{{ transaction.user }}</strong> {{ transaction.action }}
                </div>
                <div class="transaction-details">
                  <span class="amount profit">+GHS {{ transaction.amount }}</span>
                  <span class="time">{{ transaction.time }}</span>
                </div>
              </div>
              <div class="transaction-badge">
                <span>{{ transaction.type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h4>Total Users</h4>
              <p class="stat-number">{{ totalUsers.toLocaleString() }}</p>
              <span class="stat-change positive">+12.5%</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💎</div>
            <div class="stat-content">
              <h4>Today's Profit</h4>
              <p class="stat-number">GHS {{ formatAmount(todayProfit) }}</p>
              <span class="stat-change positive">+8.3%</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🚀</div>
            <div class="stat-content">
              <h4>Success Rate</h4>
              <p class="stat-number">{{ successRate }}%</p>
              <span class="stat-change positive">+0.2%</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <h4>Active Plans</h4>
              <p class="stat-number">{{ activePlans }}</p>
              <span class="stat-change positive">+3</span>
            </div>
          </div>
        </div>

        <!-- Profit Notifications -->
        <div class="profit-notifications" v-if="showProfitAlert">
          <div class="profit-alert" :class="{ 'show': showProfitAlert }">
            <div class="alert-icon">🎉</div>
            <div class="alert-content">
              <div class="alert-title">Congratulations!</div>
              <div class="alert-message">@********! earned GHS {{ lastProfitAmount }} from your investment!</div>
            </div>
            <div class="alert-close" @click="showProfitAlert = false">×</div>
          </div>
        </div>

        <!-- Investment Opportunities -->
        <div class="investment-section">
          <div class="section-header">
            <h2>🚀 Hot Investment Plans</h2>
            <div class="trending-badge">
              <span>🔥 Trending</span>
            </div>
          </div>
          
          <div class="investment-plans">
            <div class="plan-card premium" @click="selectPlan('premium')">
              <div class="plan-badge">MOST POPULAR</div>
              <div class="plan-header">
                <h3>Premium Plan</h3>
                <div class="plan-roi">{{ premiumROI }}% ROI</div>
              </div>
              <div class="plan-details">
                <div class="plan-feature">✓ Daily earnings: {{ premiumDaily }}%</div>
                <div class="plan-feature">✓ Minimum: GHS 500</div>
                <div class="plan-feature">✓ Duration: 30 days</div>
                <div class="plan-feature">✓ Auto-compound available</div>
              </div>
              <div class="plan-stats">
                <span>{{ premiumInvestors }} investors</span>
                <span class="success-rate">{{ premiumSuccess }}% success</span>
              </div>
            </div>

            <div class="plan-card vip" @click="selectPlan('vip')">
              <div class="plan-badge vip-badge">VIP EXCLUSIVE</div>
              <div class="plan-header">
                <h3>VIP Plan</h3>
                <div class="plan-roi">{{ vipROI }}% ROI</div>
              </div>
              <div class="plan-details">
                <div class="plan-feature">✓ Daily earnings: {{ vipDaily }}%</div>
                <div class="plan-feature">✓ Minimum: GHS 2,000</div>
                <div class="plan-feature">✓ Duration: 45 days</div>
                <div class="plan-feature">✓ Priority support</div>
              </div>
              <div class="plan-stats">
                <span>{{ vipInvestors }} investors</span>
                <span class="success-rate">{{ vipSuccess }}% success</span>
              </div>
            </div>

            <div class="plan-card basic" @click="selectPlan('basic')">
              <div class="plan-badge basic-badge">STARTER</div>
              <div class="plan-header">
                <h3>Basic Plan</h3>
                <div class="plan-roi">{{ basicROI }}% ROI</div>
              </div>
              <div class="plan-details">
                <div class="plan-feature">✓ Daily earnings: {{ basicDaily }}%</div>
                <div class="plan-feature">✓ Minimum: GHS 100</div>
                <div class="plan-feature">✓ Duration: 15 days</div>
                <div class="plan-feature">✓ Perfect for beginners</div>
              </div>
              <div class="plan-stats">
                <span>{{ basicInvestors }} investors</span>
                <span class="success-rate">{{ basicSuccess }}% success</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Market Overview -->
        <div class="market-section">
          <h2>📈 Market Overview</h2>
          <div class="market-items">
            <div 
              v-for="market in markets" 
              :key="market.symbol"
              class="market-item"
              :class="{ 'price-up': market.isUp, 'price-down': !market.isUp }"
            >
              <div class="market-symbol">{{ market.symbol }}</div>
              <div class="market-price">{{ market.price }}</div>
              <div class="market-change" :class="{ positive: market.change >= 0, negative: market.change < 0 }">
                {{ market.change >= 0 ? '+' : '' }}{{ market.change }}%
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
  name: 'FundyDashboard',
  data() {
    return {
      loading: false,
      showBalance: true,
      currentBalance: 0.00,
      animatedBalance: 2547.83,
      earns: 0,
      animatedEarnings: 125.67,
      earningRate: 2.5,
      dailyChange: 12.4,
      purchase: null,
      isProcessing: false,
      errorMessage: '',
      successMessage: '',
      isMining: false,
      miningCooldownEnd: null,
      miningProgress: 0,
      miningTimeRemaining: '',
      miningInterval: null,
      lastMiningTime: null,
      totalEarnings: 0,
      maxEarnings: 0,
      canCreditEarnings: false,
      isCreditingEarnings: false,
      creditEarningsMessage: '',
      balanceRefreshInterval: null,
      serverCanMine: false,
      serverLastMiningAt: null,
      miningStoragePrefix: null,
      earningsHistory: [],
      
      // Profit notifications
      showProfitAlert: false,
      lastProfitAmount: 0,
      profitAlertInterval: null,
      
      // Investment plans
      premiumROI: 145,
      premiumDaily: 4.8,
      premiumInvestors: 2847,
      premiumSuccess: 98.2,
      vipROI: 280,
      vipDaily: 6.2,
      vipInvestors: 1256,
      vipSuccess: 99.1,
      basicROI: 75,
      basicDaily: 5.0,
      basicInvestors: 5670,
      basicSuccess: 96.8,
      
      // Success stories
      
      
      // Live stats
      activeUsers: 45670,
      totalVolume: 2847593,
      totalUsers: 156789,
      todayProfit: 8964.32,
      successRate: 97.8,
      activePlans: 24,
      
      // Live feed
      liveFeed: [
        { user: '@*****', action: 'earned from Premium Plan', amount: '45.20', time: '2s ago', type: 'PROFIT', isNew: false },
        { user: '@*****', action: 'withdrew profits', amount: '320.50', time: '5s ago', type: 'WITHDRAW', isNew: false },
        { user: '@*****', action: 'earned from Basic Plan', amount: '12.80', time: '8s ago', type: 'PROFIT', isNew: false }
      ],
      
      // Markets
      markets: [
        { symbol: 'BTC/USDT', price: '43,250.00', change: 2.34 },
        { symbol: 'ETH/USDT', price: '2,650.50', change: -1.23 },
        { symbol: 'BNB/USDT', price: '315.80', change: 0.87 },
        { symbol: 'ADA/USDT', price: '0.4520', change: 3.45 }
      ],
      
      // Animation intervals
      balanceInterval: null,
      earningsInterval: null,
      feedInterval: null,
      statsInterval: null,
      marketInterval: null,
      
      // Fake names for feed
      fakeNames: [
        '@*****', '@*****', '@*****', '@*****', '@*****', '@*****'
      ],
      
      feedActions: [
        'earned from VIP Plan',
        'earned from Premium Plan', 
        'earned from Basic Plan',
        'withdrew profits',
        'earned daily bonus'
      ]
    }
  },
  
  computed: {
    userId() {
      return localStorage.getItem('user_id')
    },
    userUsername() {
      return localStorage.getItem('username') || 'Investor'
    },
    canMine() {
      if (!this.purchase) return false;
      if (this.serverCanMine !== undefined) {
        return this.serverCanMine;
      }
      if (!this.miningCooldownEnd) return true;
      return Date.now() > this.miningCooldownEnd;
    },
    
    miningButtonText() {
      if (this.isProcessing) return 'Mining...';
      if (this.isMining) return `Mining (${this.miningTimeRemaining})`;
      if (!this.canMine) return `Cooldown (${this.miningTimeRemaining})`;
      return 'Start Mining';
    },
    
    miningButtonDisabled() {
      return this.isProcessing || !this.canMine;
    },
    
    earningsProgress() {
      if (this.maxEarnings === 0) return 0;
      return Math.min((this.totalEarnings / this.maxEarnings) * 100, 100);
    },
    
    remainingEarnings() {
      return Math.max(this.maxEarnings - this.totalEarnings, 0);
    },
    
    creditButtonText() {
      if (this.isCreditingEarnings) return 'Processing...';
      if (this.canCreditEarnings) return 'Credit Total Earnings';
      return `${this.formatAmount(this.remainingEarnings)} GHS remaining`;
    },
    
    creditButtonClass() {
      return {
        'credit-btn': true,
        'credit-available': this.canCreditEarnings,
        'credit-disabled': !this.canCreditEarnings,
        'credit-processing': this.isCreditingEarnings
      };
    }
  },

  watch: {
    userId: {
      handler(newUserId, oldUserId) {
        console.log('User ID changed:', { oldUserId, newUserId });
        if (newUserId && newUserId !== oldUserId) {
          this.handleUserChange();
        } else if (!newUserId) {
          this.clearUserData();
        }
      },
      immediate: true
    }
  },
  
  methods: {
    miningKey(name) {
      const id = this.userId || 'anon';
      return `fundy_${name}_user_${id}`;
    },

    async fetchData() {
      console.log('fetchData called for user:', this.userId);
      this.loading = true;
      
      try {
        if (!this.userId) {
          console.error('No user ID found, cannot fetch data');
          this.clearUserData();
          return;
        }

        console.log('Fetching user data...');
        
        // Fetch user data with detailed logging
        const userResponse = await AuthService.getCurrentUser();
        console.log('Full user response:', JSON.stringify(userResponse, null, 2));

        // Enhanced balance detection
        await this.processUserResponse(userResponse);
        
        // Fetch other data
        await this.fetchAdditionalData();

      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error response:', error.response?.data);
        this.errorMessage = 'Unable to fetch user data';
      } finally {
        this.loading = false;
      }
    },

    async processUserResponse(userResponse) {
      if (!userResponse) {
        console.error('No user response received');
        this.currentBalance = 0;
        return;
      }

      let balance = null;
      
      // Try multiple possible response structures
      const possiblePaths = [
        'balance',
        'data.balance', 
        'user.balance',
        'account.balance',
        'wallet.balance',
        'profile.balance'
      ];

      for (const path of possiblePaths) {
        const value = this.getNestedProperty(userResponse, path);
        if (value !== undefined && value !== null) {
          balance = value;
          console.log(`Balance found at path '${path}':`, balance);
          break;
        }
      }

      if (balance !== null) {
        // Handle string to number conversion
        const numericBalance = parseFloat(balance);
        if (!isNaN(numericBalance)) {
          this.currentBalance = numericBalance;
          console.log('Balance successfully set to:', this.currentBalance);
        } else {
          console.error('Invalid balance format:', balance);
          this.currentBalance = 0;
        }
      } else {
        console.error('Balance field not found in response structure');
        console.error('Available fields:', Object.keys(userResponse));
        this.currentBalance = 0;
      }
    },

    getNestedProperty(obj, path) {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
      }, obj);
    },

    async fetchAdditionalData() {
      try {
        // Fetch earnings
        const userEarn = await AuthService.getEarnings();
        if (userEarn?.amount !== undefined) {
          this.earns = userEarn.amount;
        }

        // Fetch purchases
        const purchaseRes = await AuthService.getMyPurchases();
        if (purchaseRes) {
          this.purchase = purchaseRes;
        }

        // Fetch total earnings
        const totalEarningsRes = await AuthService.getTotalEarnings();
        if (totalEarningsRes) {
          this.totalEarnings = parseFloat(totalEarningsRes.totalearning || 0);
          this.maxEarnings = parseFloat(totalEarningsRes.maxearning || 0);
          this.canCreditEarnings = this.totalEarnings >= this.maxEarnings && this.maxEarnings > 0;
        }

        // Fetch mining status
        await this.fetchMiningStatus();

      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    },

    async fetchMiningStatus() {
      try {
        const mineStatus = await AuthService.getMineStatus();
        this.serverCanMine = !!mineStatus.can_mine;
        this.serverLastMiningAt = mineStatus.last_mining_at;
        
        if (mineStatus.cooldown_end) {
          this.miningCooldownEnd = new Date(mineStatus.cooldown_end).getTime();
        } else {
          this.miningCooldownEnd = null;
        }
      } catch (err) {
        console.warn('Could not fetch mine status:', err);
      }
    },

    async refreshUserBalance() {
      console.log('Refreshing balance for user:', this.userId);
      
      try {
        const userResponse = await AuthService.getCurrentUser();
        console.log('Balance refresh response:', userResponse);
        
        await this.processUserResponse(userResponse);
        
      } catch (error) {
        console.error('Error refreshing balance:', error);
        this.errorMessage = 'Failed to refresh balance';
      }
    },

    async forceDataRefresh() {
      console.log('Force refreshing all data');
      this.loading = true;
      
      try {
        await this.fetchData();
        await this.fetchEarningsData();
        this.successMessage = 'Data refreshed successfully!';
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        
      } catch (error) {
        console.error('Error in force refresh:', error);
        this.errorMessage = 'Failed to refresh data';
      } finally {
        this.loading = false;
      }
    },

    handleUserChange() {
      console.log('Handling user change');
      
      // Clear old data
      this.clearUserData();
      
      // Fetch new user data
      if (this.userId) {
        this.fetchData().then(() => {
          this.fetchEarningsData();
          this.$nextTick(() => {
            this.checkExistingMiningCooldown();
          });
        });
      }
    },

    clearUserData() {
      console.log('Clearing user data');
      this.currentBalance = 0;
      this.purchase = null;
      this.totalEarnings = 0;
      this.maxEarnings = 0;
      this.canCreditEarnings = false;
      this.earns = 0;
      this.successMessage = '';
      this.errorMessage = '';
      this.clearMiningState();
    },

    clearMiningState() {
      this.isMining = false;
      this.miningProgress = 0;
      this.miningCooldownEnd = null;
      this.lastMiningTime = null;
      this.miningTimeRemaining = '';
      
      if (this.miningInterval) {
        clearInterval(this.miningInterval);
        this.miningInterval = null;
      }
      
      // Clear localStorage for current user
      if (this.userId) {
        const keys = ['lastMiningTime', 'miningCooldownEnd'];
        keys.forEach(key => {
          localStorage.removeItem(this.miningKey(key));
        });
      }
    },

    async startBalanceRefresh() {
      // Clear existing interval
      if (this.balanceRefreshInterval) {
        clearInterval(this.balanceRefreshInterval);
      }
      
      // Set up periodic balance refresh every 30 seconds
      this.balanceRefreshInterval = setInterval(async () => {
        if (this.userId) {
          await this.refreshUserBalance();
        }
      }, 30000);
    },

    async fetchEarningsData() {
      try {
        const response = await AuthService.getTotalEarnings();
        if (response) {
          this.totalEarnings = parseFloat(response.totalearning || 0);
          this.maxEarnings = parseFloat(response.maxearning || 0);
          this.canCreditEarnings = this.totalEarnings >= this.maxEarnings && this.maxEarnings > 0;
        }
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      }
    },

    async creditTotalEarnings() {
      if (!this.canCreditEarnings || this.isCreditingEarnings) return;
      
      this.isCreditingEarnings = true;
      this.creditEarningsMessage = '';
      this.errorMessage = '';
      
      try {
        const earningData = {
          total_earnings: this.totalEarnings,
          max_earnings: this.maxEarnings,
          credit_amount: this.totalEarnings,
          user_id: this.userId,
          credited_at: new Date().toISOString()
        };
        
        const response = await AuthService.creditTotalEarnings(earningData);
        
        this.creditEarningsMessage = `Successfully credited ${this.formatAmount(this.totalEarnings)} GHS to your account!`;
        this.currentBalance += this.totalEarnings;
        this.totalEarnings = 0;
        this.canCreditEarnings = false;
        
        await this.fetchData();
        await this.fetchEarningsData();
        
      } catch (error) {
        console.error('Error crediting earnings:', error);
        this.errorMessage = error.response?.data?.detail || 'Failed to credit earnings. Please try again.';
      } finally {
        this.isCreditingEarnings = false;
      }
    },

    async startMining() {
      if (!this.canMine || this.isProcessing) return;

      if (!this.purchase) {
        this.errorMessage = "You must have an active purchase/investment to start mining.";
        return;
      }

      if (this.serverCanMine === false) {
        this.errorMessage = "You cannot mine yet. Please wait for the cooldown or buy a plan.";
        return;
      }

      this.isProcessing = true;
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const response = await AuthService.createEarning({});

        await this.fetchData();
        await this.fetchEarningsData();

        const mineStatus = await AuthService.getMineStatus();
        this.serverCanMine = !!mineStatus.can_mine;
        this.serverLastMiningAt = mineStatus.last_mining_at;
        
        if (mineStatus.cooldown_end) {
          this.miningCooldownEnd = new Date(mineStatus.cooldown_end).getTime();
          localStorage.setItem(this.miningKey('miningCooldownEnd'), String(this.miningCooldownEnd));
        } else {
          this.miningCooldownEnd = null;
          localStorage.removeItem(this.miningKey('miningCooldownEnd'));
        }

        this.successMessage = `You earned ${this.formatAmount(response.amount)} GHS successfully!`;
        
      } catch (error) {
        this.errorMessage = error.response?.data?.detail || 'Mining failed. Please try again.';
      } finally {
        this.isProcessing = false;
      }
    },

    startMiningCooldown() {
      const now = Date.now();
      const cooldownDuration = 24 * 60 * 60 * 1000;
      this.lastMiningTime = now;
      this.miningCooldownEnd = now + cooldownDuration;
      this.isMining = true;

      localStorage.setItem(this.miningKey('lastMiningTime'), String(now));
      localStorage.setItem(this.miningKey('miningCooldownEnd'), String(this.miningCooldownEnd));

      this.startMiningProgressUpdate();
    },

    checkExistingMiningCooldown() {
      if (!this.userId) return;
      
      const lastMiningTime = localStorage.getItem(this.miningKey('lastMiningTime'));
      const miningCooldownEnd = localStorage.getItem(this.miningKey('miningCooldownEnd'));

      if (lastMiningTime && miningCooldownEnd) {
        const now = Date.now();
        const cooldownEnd = parseInt(miningCooldownEnd, 10);

        if (now < cooldownEnd) {
          this.lastMiningTime = parseInt(lastMiningTime, 10);
          this.miningCooldownEnd = cooldownEnd;
          this.isMining = true;
          this.startMiningProgressUpdate();
        } else {
          localStorage.removeItem(this.miningKey('lastMiningTime'));
          localStorage.removeItem(this.miningKey('miningCooldownEnd'));
        }
      }
    },

    startMiningProgressUpdate() {
      if (this.miningInterval) {
        clearInterval(this.miningInterval);
      }
      
      this.miningInterval = setInterval(() => {
        const now = Date.now();
        const totalDuration = 24 * 60 * 60 * 1000;
        const elapsed = now - this.lastMiningTime;
        const remaining = this.miningCooldownEnd - now;
        
        if (remaining <= 0) {
          this.completeMining();
          return;
        }
        
        this.miningProgress = (elapsed / totalDuration) * 100;
        this.miningTimeRemaining = this.formatTimeRemaining(remaining);
        
      }, 1000);
    },

    completeMining() {
      this.isMining = false;
      this.miningProgress = 100;
      this.miningCooldownEnd = null;
      this.lastMiningTime = null;
      this.miningTimeRemaining = '';
      
      localStorage.removeItem(this.miningKey('lastMiningTime'));
      localStorage.removeItem(this.miningKey('miningCooldownEnd'));
      
      if (this.miningInterval) {
        clearInterval(this.miningInterval);
        this.miningInterval = null;
      }
      
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

    // Animation methods
    startBalanceAnimation() {
      if (this.balanceInterval) clearInterval(this.balanceInterval);
      this.balanceInterval = setInterval(() => {
        const increment = Math.random() * 0.5 + 0.1;
        this.animatedBalance += increment;
      }, 3000);
    },

    startEarningsAnimation() {
      if (this.earningsInterval) clearInterval(this.earningsInterval);
      this.earningsInterval = setInterval(() => {
        const increment = Math.random() * 0.8 + 0.2;
        this.animatedEarnings += increment;
      }, 2000);
    },

    startLiveFeed() {
      if (this.feedInterval) clearInterval(this.feedInterval);
      this.feedInterval = setInterval(() => {
        const newTransaction = this.generateFakeTransaction();
        this.liveFeed.unshift(newTransaction);
        if (this.liveFeed.length > 8) {
          this.liveFeed.pop();
        }
      }, 4000);
    },

    generateFakeTransaction() {
      const name = this.fakeNames[Math.floor(Math.random() * this.fakeNames.length)];
      const action = this.feedActions[Math.floor(Math.random() * this.feedActions.length)];
      const amount = (Math.random() * 500 + 10).toFixed(2);
      const types = ['PROFIT', 'WITHDRAW', 'DEPOSIT', 'BONUS'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      return {
        user: name,
        action: action,
        amount: amount,
        time: 'just now',
        type: type,
        isNew: true
      };
    },

    startStatsAnimation() {
      if (this.statsInterval) clearInterval(this.statsInterval);
      this.statsInterval = setInterval(() => {
        this.activeUsers += Math.floor(Math.random() * 10) + 1;
        this.totalVolume += Math.floor(Math.random() * 1000) + 100;
        this.todayProfit += Math.random() * 5 + 1;
        this.dailyChange += (Math.random() - 0.5) * 0.1;
      }, 5000);
    },

    startProfitAlerts() {
      if (this.profitAlertInterval) clearInterval(this.profitAlertInterval);
      this.profitAlertInterval = setInterval(() => {
        this.lastProfitAmount = (Math.random() * 50 + 10).toFixed(2);
        this.showProfitAlert = true;
        
        setTimeout(() => {
          this.showProfitAlert = false;
        }, 5000);
      }, 15000);
    },

    selectPlan(planType) {
      console.log(`Selected ${planType} plan`);
      this.$router.push('/investments');
    },

    startMarketAnimation() {
      if (this.marketInterval) clearInterval(this.marketInterval);
      this.marketInterval = setInterval(() => {
        this.markets.forEach(market => {
          const changePercent = (Math.random() - 0.5) * 2;
          const currentPrice = parseFloat(market.price.replace(',', ''));
          const newPrice = currentPrice * (1 + changePercent / 100);
          
          market.price = newPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
          market.change = parseFloat((market.change + changePercent * 0.1).toFixed(2));
          market.isUp = market.change >= 0;
        });
      }, 6000);
    },

    formatAmount(amount) {
      return parseFloat(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    stopAllAnimations() {
      const intervals = [
        'balanceInterval', 'earningsInterval', 'feedInterval', 
        'statsInterval', 'marketInterval', 'profitAlertInterval',
        'balanceRefreshInterval', 'miningInterval'
      ];
      
      intervals.forEach(interval => {
        if (this[interval]) {
          clearInterval(this[interval]);
          this[interval] = null;
        }
      });
    }
  },

  async mounted() {
    console.log('Dashboard mounted, user ID:', this.userId);
    
    // Only fetch data if user is logged in
    if (this.userId) {
      await this.fetchData();
      await this.fetchEarningsData();
      this.startBalanceRefresh();
      this.checkExistingMiningCooldown();
    } else {
      console.warn('No user ID found on mount');
    }
    
    // Start animations after delay
    setTimeout(() => {
      this.startBalanceAnimation();
      this.startEarningsAnimation();
      this.startLiveFeed();
      this.startStatsAnimation();
      this.startMarketAnimation();
      this.startProfitAlerts();
    }, 1000);
  },

  beforeUnmount() {
    this.stopAllAnimations();
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard {
  background: #0b0e11;
  color: #ffffff;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #1e2329;
}

.welcome-text h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
  background: linear-gradient(135deg, #f0b90b, #f8d12f);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: #848e9c;
  font-size: 14px;
}

.live-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-label {
  font-size: 12px;
  color: #848e9c;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #f0b90b;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  color: #848e9c;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #1e2329;
  border-top: 3px solid #f0b90b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Balance Section */
.balance-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.main-balance-card {
  background: linear-gradient(135deg, #1e2329 0%, #2b3139 100%);
  border: 1px solid #f0b90b;
  border-radius: 12px;
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.main-balance-card::before {
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
  text-align: center;
}

.balance-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.balance-label {
  color: #848e9c;
  font-size: 14px;
}

.balance-toggle {
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.balance-toggle:hover {
  opacity: 1;
}

.balance-amount {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #ffffff;
}

.currency {
  font-size: 24px;
  color: #f0b90b;
  margin-right: 8px;
}

.balance-change {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
}

.balance-change.positive {
  color: #03a66d;
}

.balance-change.negative {
  color: #cf304a;
}

.change-arrow {
  font-size: 16px;
}

.earnings-card {
  background: linear-gradient(135deg, #1e2329, #2b3139);
  border: 1px solid #474d57;
  border-radius: 12px;
  padding: 24px;
}

.earnings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.earnings-header h3 {
  font-size: 16px;
  color: #ffffff;
}

.earning-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #03a66d;
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

.earnings-amount {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #03a66d;
}

.earnings-rate {
  font-size: 12px;
  color: #848e9c;
}


/* Mining Progress Container */
.mining-progress-container {
  background: linear-gradient(135deg, #1e2329 0%, #2b3139 100%);
  border: 1px solid #f0b90b;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.mining-progress-container::before {
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

/* Mining Info */
.mining-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mining-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #f0b90b;
}

.mining-icon {
  font-size: 20px;
  animation: mining-bounce 2s infinite;
}

@keyframes mining-bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-4px) rotate(-10deg); }
  75% { transform: translateY(-2px) rotate(10deg); }
}

.mining-text {
  font-size: 16px;
}

.mining-time {
  color: #848e9c;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Courier New', monospace;
}

/* Progress Bar */
.progress-bar-container {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #0f1419;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid #374151;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f0b90b, #f8d12f, #f0b90b);
  background-size: 200% 100%;
  animation: progress-shimmer 2s infinite;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: progress-shine 2s infinite;
}

@keyframes progress-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #000;
  font-size: 10px;
  font-weight: 700;
  text-shadow: 0 0 4px rgba(0,0,0,0.5);
  z-index: 2;
}

/* Mining Animation */
.mining-animation {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 40px;
}

.mining-particles {
  position: absolute;
  width: 60px;
  height: 60px;
}


/* Earnings Section */
.earnings-section {
  margin-bottom: 24px;
}

.earnings-card {
  background: linear-gradient(135deg, #1e2329 0%, #2b3139 100%);
  border: 1px solid #474d57;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.earnings-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #22c55e, #16a34a, #22c55e);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.earnings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.earnings-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.earnings-info {
  flex: 1;
}

.earnings-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.earnings-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.earnings-amount .currency {
  font-size: 16px;
  color: #22c55e;
  font-weight: 500;
}

.earnings-amount .amount {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.earnings-max {
  font-size: 12px;
  color: #848e9c;
}

/* Progress Section */
.earnings-progress {
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  color: #848e9c;
  font-weight: 500;
}

.progress-percentage {
  font-size: 14px;
  font-weight: 600;
  color: #22c55e;
}

.progress-bar-container {
  margin-bottom: 8px;
}

.progress-bar-track {
  width: 100%;
  height: 8px;
  background: #0b0e11;
  border-radius: 6px;
  border: 1px solid #474d57;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #16a34a, #22c55e);
  background-size: 200% 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
  position: relative;
  animation: progress-flow 3s infinite;
}

.progress-bar-fill.progress-complete {
  background: linear-gradient(90deg, #f0b90b, #f8d12f, #f0b90b);
  animation: progress-glow 2s infinite, progress-flow 3s infinite;
}

@keyframes progress-flow {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes progress-glow {
  0%, 100% { 
    box-shadow: 0 0 8px rgba(240, 185, 11, 0.3);
  }
  50% { 
    box-shadow: 0 0 16px rgba(240, 185, 11, 0.6);
  }
}

.progress-footer {
  text-align: center;
}

.remaining-text {
  font-size: 12px;
  color: #848e9c;
}

.complete-text {
  font-size: 12px;
  color: #f0b90b;
  font-weight: 600;
  animation: pulse-text 2s infinite;
}

@keyframes pulse-text {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Credit Button */
.credit-section {
  text-align: center;
}

.credit-btn {
  width: 100%;
  max-width: 300px;
  height: 56px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.credit-btn.credit-available {
  background: linear-gradient(135deg, #f0b90b, #f8d12f);
  color: #000000;
  border: 2px solid #f0b90b;
  box-shadow: 0 4px 20px rgba(240, 185, 11, 0.3);
  animation: credit-ready 3s infinite;
}

.credit-btn.credit-available:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(240, 185, 11, 0.5);
}

.credit-btn.credit-disabled {
  background: #374151;
  color: #848e9c;
  border: 2px solid #474d57;
  cursor: not-allowed;
}

.credit-btn.credit-processing {
  background: #6366f1;
  color: white;
  border: 2px solid #6366f1;
  cursor: not-allowed;
  animation: processing 2s infinite;
}

@keyframes credit-ready {
  0%, 100% { 
    box-shadow: 0 4px 20px rgba(240, 185, 11, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 6px 25px rgba(240, 185, 11, 0.5);
    transform: scale(1.02);
  }
}

@keyframes processing {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;
  z-index: 2;
}

.btn-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  animation: icon-bounce 2s infinite;
}

.credit-btn.credit-available .btn-icon {
  animation: icon-sparkle 2s infinite;
}

@keyframes icon-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes icon-sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}

.btn-text {
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}

/* Button Shine Effect */
.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shine 3s infinite;
  z-index: 1;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Requirements Info */
.requirements-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  padding: 16px;
  text-align: left;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.requirement-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.requirement-text {
  font-size: 13px;
  color: #d1d5db;
  line-height: 1.4;
}

/* Credit Success Alert */
.credit-success-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  position: relative;
  animation: success-slide 0.5s ease-out;
}

@keyframes success-slide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.credit-success-alert .alert-icon {
  font-size: 24px;
  flex-shrink: 0;
  margin-top: 2px;
  animation: celebration 1s ease-out;
}

@keyframes celebration {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.credit-success-alert .alert-content {
  flex: 1;
}

.credit-success-alert .alert-content h5 {
  font-size: 16px;
  font-weight: 600;
  color: #22c55e;
  margin: 0 0 4px 0;
}

.credit-success-alert .alert-content p {
  font-size: 14px;
  color: #d1d5db;
  margin: 0;
  line-height: 1.4;
}

.credit-success-alert .alert-close {
  background: none;
  border: none;
  color: #848e9c;
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  position: absolute;
  top: 12px;
  right: 12px;
}

.credit-success-alert .alert-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .earnings-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .earnings-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
  
  .earnings-amount .amount {
    font-size: 28px;
  }
  
  .credit-btn {
    height: 50px;
    max-width: none;
  }
  
  .btn-text {
    font-size: 15px;
  }
  
  .requirements-info {
    padding: 12px;
  }
  
  .requirement-text {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .earnings-card {
    padding: 16px;
  }
  
  .earnings-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }
  
  .earnings-amount .amount {
    font-size: 24px;
  }
  
  .progress-bar-track {
    height: 6px;
  }
  
  .credit-btn {
    height: 48px;
  }
  
  .btn-icon {
    font-size: 18px;
  }
  
  .btn-text {
    font-size: 14px;
  }
  
  .credit-success-alert {
    padding: 12px;
  }
  
  .credit-success-alert .alert-content h5 {
    font-size: 14px;
  }
  
  .credit-success-alert .alert-content p {
    font-size: 13px;
  }
}

/* Additional Animation for Ready State */
.credit-btn.credit-available::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    transparent,
    rgba(240, 185, 11, 0.3),
    transparent,
    rgba(240, 185, 11, 0.3)
  );
  animation: rotate-glow 4s linear infinite;
  z-index: 0;
}

@keyframes rotate-glow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #f0b90b;
  border-radius: 50%;
  animation: particle-float 3s infinite;
}

.particle:nth-child(1) { 
  animation-delay: 0s; 
  left: 10px;
  top: 20px;
}
.particle:nth-child(2) { 
  animation-delay: 0.3s; 
  left: 45px;
  top: 15px;
}
.particle:nth-child(3) { 
  animation-delay: 0.6s; 
  left: 25px;
  top: 30px;
}
.particle:nth-child(4) { 
  animation-delay: 0.9s; 
  left: 35px;
  top: 25px;
}
.particle:nth-child(5) { 
  animation-delay: 1.2s; 
  left: 15px;
  top: 35px;
}
.particle:nth-child(6) { 
  animation-delay: 1.5s; 
  left: 40px;
  top: 10px;
}
.particle:nth-child(7) { 
  animation-delay: 1.8s; 
  left: 20px;
  top: 10px;
}
.particle:nth-child(8) { 
  animation-delay: 2.1s; 
  left: 50px;
  top: 30px;
}

@keyframes particle-float {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  20% {
    opacity: 1;
    transform: translateY(-10px) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateY(-20px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0);
  }
}

.mining-pickaxe {
  font-size: 24px;
  z-index: 1;
  animation: pickaxe-swing 1.5s infinite;
}

@keyframes pickaxe-swing {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  75% { transform: rotate(15deg); }
}

/* Enhanced Mining Button */
.mining-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-width: 200px;
  height: 50px;
}

.mining-btn.mining-ready {
  background: linear-gradient(135deg, #f0b90b, #f8d12f);
  color: #000;
  border: 2px solid #f0b90b;
  box-shadow: 0 4px 15px rgba(240, 185, 11, 0.3);
  animation: ready-pulse 2s infinite;
}

@keyframes ready-pulse {
  0%, 100% { 
    box-shadow: 0 4px 15px rgba(240, 185, 11, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 6px 20px rgba(240, 185, 11, 0.5);
    transform: scale(1.02);
  }
}

.mining-btn.mining-active {
  background: #374151;
  color: #f0b90b;
  border: 2px solid #f0b90b;
  cursor: not-allowed;
}

.mining-btn.mining-disabled {
  background: #2b3139;
  color: #848e9c;
  border: 2px solid #474d57;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.btn-icon {
  font-size: 18px;
  transition: transform 0.2s;
}

.mining-btn.mining-ready:hover .btn-icon {
  transform: scale(1.2);
}

.btn-text {
  font-weight: 600;
  font-size: 14px;
}

/* Button Shine Effect */
.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shine 3s infinite;
  z-index: 1;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .mining-progress-container {
    padding: 16px;
  }
  
  .mining-info {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .mining-animation {
    height: 30px;
  }
  
  .mining-pickaxe {
    font-size: 20px;
  }
  
  .mining-btn {
    min-width: 180px;
    height: 45px;
  }
  
  .btn-text {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .mining-progress-container {
    padding: 12px;
  }
  
  .progress-bar {
    height: 10px;
  }
  
  .progress-text {
    font-size: 9px;
  }
  
  .mining-btn {
    min-width: 160px;
    height: 40px;
  }
  
  .btn-icon {
    font-size: 16px;
  }
  
  .btn-text {
    font-size: 12px;
  }
}

/* Action Section */
.action-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.action-card {
  background: #1e2329;
  border: 1px solid #474d57;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  transform: translateY(-4px);
  border-color: #f0b90b;
  box-shadow: 0 8px 25px rgba(240, 185, 11, 0.15);
}

.card-icon {
  font-size: 32px;
  margin-bottom: 16px;
}

.card-content h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: #ffffff;
}

.card-content p {
  color: #848e9c;
  font-size: 14px;
  margin-bottom: 12px;
}

.card-tag {
  background: #f0b90b;
  color: #000000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

/* Live Feed */
.live-feed-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  color: #ffffff;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #03a66d;
  font-size: 12px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #03a66d;
  animation: pulse 1s infinite;
}

.feed-container {
  background: #1e2329;
  border: 1px solid #474d57;
  border-radius: 12px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.feed-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
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


.feed-item.fade-in {
  animation: fadeIn 0.5s;
  background: rgba(240, 185, 11, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.user-avatar .avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0b90b, #f8d12f);
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.transaction-info {
  flex: 1;
}

.user-action {
  font-size: 14px;
  margin-bottom: 4px;
}

.transaction-details {
  display: flex;
  gap: 16px;
  font-size: 12px;
}

.amount.profit {
  color: #03a66d;
  font-weight: 600;
}

.time {
  color: #848e9c;
}

.transaction-badge span {
  background: #474d57;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: #1e2329;
  border: 1px solid #474d57;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  border-color: #f0b90b;
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.stat-content h4 {
  color: #848e9c;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
}

.stat-change.positive {
  color: #03a66d;
}

/* Market Section */
.market-section {
  background: #1e2329;
  border: 1px solid #474d57;
  border-radius: 12px;
  padding: 24px;
}

.market-section h2 {
  margin-bottom: 20px;
  color: #ffffff;
}

.market-items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.market-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: #0b0e11;
  border-radius: 8px;
  border: 1px solid #474d57;
}

.market-symbol {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.market-price {
  font-size: 16px;
  color: #f0b90b;
  margin-bottom: 4px;
}

.market-change {
  font-size: 12px;
}

.market-change.positive {
  color: #03a66d;
}

.market-change.negative {
  color: #cf304a;
}

/* Profit Notifications */
.profit-notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.profit-alert {
  background: linear-gradient(135deg, #03a66d, #02c76f);
  border: 1px solid #03a66d;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  box-shadow: 0 8px 25px rgba(3, 166, 109, 0.3);
}

.profit-alert.show {
  transform: translateX(0);
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.alert-icon {
  font-size: 24px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #ffffff;
}

.alert-message {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.alert-close {
  cursor: pointer;
  font-size: 20px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-close:hover {
  opacity: 1;
}

/* Investment Plans */
.investment-section {
  margin-bottom: 32px;
}

.trending-badge {
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.investment-plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.plan-card {
  background: linear-gradient(135deg, #1e2329, #2b3139);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.plan-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(240, 185, 11, 0.2);
}

.plan-card.premium {
  border-image: linear-gradient(135deg, #f0b90b, #f8d12f) 1;
}

.plan-card.vip {
  border-image: linear-gradient(135deg, #8b5cf6, #a78bfa) 1;
}

.plan-card.basic {
  border-image: linear-gradient(135deg, #10b981, #34d399) 1;
}

.plan-badge {
  position: absolute;
  top: -1px;
  right: 24px;
  background: #f0b90b;
  color: #000000;
  padding: 6px 12px;
  border-radius: 0 0 8px 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.plan-badge.vip-badge {
  background: #8b5cf6;
  color: #ffffff;
}

.plan-badge.basic-badge {
  background: #10b981;
  color: #ffffff;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 16px;
}

.plan-header h3 {
  font-size: 20px;
  color: #ffffff;
}

.plan-roi {
  font-size: 24px;
  font-weight: 700;
  color: #03a66d;
}

.plan-details {
  margin-bottom: 20px;
}

.plan-feature {
  color: #ffffff;
  margin-bottom: 8px;
  font-size: 14px;
}

.plan-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #848e9c;
}

.success-rate {
  color: #03a66d;
  font-weight: 600;
}

/* Market animations */
.market-item.price-up {
  animation: priceUp 0.5s ease;
  border-color: #03a66d;
}

.market-item.price-down {
  animation: priceDown 0.5s ease;
  border-color: #cf304a;
}

@keyframes priceUp {
  0% { background-color: rgba(3, 166, 109, 0.1); }
  100% { background-color: transparent; }
}

@keyframes priceDown {
  0% { background-color: rgba(207, 48, 74, 0.1); }
  100% { background-color: transparent; }
}

/* Success Stories */
.success-stories {
  margin-bottom: 32px;
}

.success-stories h2 {
  margin-bottom: 20px;
  color: #ffffff;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.story-card {
  background: #1e2329;
  border: 1px solid #474d57;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  transition: all 0.3s;
}

.story-card:hover {
  border-color: #f0b90b;
  transform: translateY(-2px);
}

.story-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #03a66d, #10b981);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.story-content h4 {
  color: #ffffff;
  margin-bottom: 8px;
}

.story-content p {
  color: #848e9c;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.story-profit {
  font-size: 14px;
  color: #848e9c;
}

.story-profit span {
  color: #03a66d;
  font-weight: 600;
}

/* Responsive updates */
@media (max-width: 1024px) {
  .investment-plans {
    grid-template-columns: 1fr;
  }
  
  .stories-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profit-alert {
    min-width: 280px;
  }
  
  .profit-notifications {
    right: 10px;
    left: 10px;
  }
}
</style>