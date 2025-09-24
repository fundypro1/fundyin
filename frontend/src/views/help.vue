<template>
    <div class="dashboard">
      <div class="container">
        <h1>Transaction Monitoring</h1>
        
        <div v-if="loading" class="loading">
          Loading account data...
        </div>
        
        <div v-else>
          <div class="admin-info" v-if="isAdmin">
            <div class="user-selector">
              <label for="userSelect">Select User:</label>
              <select id="userSelect" v-model="selectedUserId" @change="handleUserChange">
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }} (ID: {{ user.id }})
                </option>
              </select>
            </div>
          </div>
          
          <div class="account-overview">
            <div class="balance-card">
              <h3>Current Balance</h3>
              <div class="balance-amount">${{ formatAmount(summary.current_balance) }}</div>
              <div class="user-details" v-if="currentUser">
                <p>User: {{ currentUser.name }}</p>
                <p>ID: {{ currentUser.id }}</p>
              </div>
            </div>
          </div>
          
          <div class="risk-graph-section">
            <h2>{{ chartTitle }}</h2>
            <div class="graph-controls" v-if="isAdmin">
              <div class="chart-type-toggle">
                <label>
                  <input type="radio" v-model="chartMode" value="fraud" @change="renderRiskChart">
                  Fraud Probability
                </label>
                <label>
                  <input type="radio" v-model="chartMode" value="risk" @change="renderRiskChart">
                  Risk Score
                </label>
                <label>
                  <input type="radio" v-model="chartMode" value="amounts" @change="renderRiskChart">
                  Transaction Amounts
                </label>
              </div>
            </div>
            <div class="graph-container">
              <canvas ref="riskCanvas" id="riskChart" width="800" height="300"></canvas>
            </div>
          </div>
          
          <div class="summary-section">
            <h2>Account Summary</h2>
            <div class="summary-cards">
              <div class="summary-card">
                <h3>Total Deposits</h3>
                <p>${{ formatAmount(summary.total_deposits) }}</p>
              </div>
              <div class="summary-card">
                <h3>Total Withdrawals</h3>
                <p>${{ formatAmount(summary.total_withdrawals) }}</p>
              </div>
              <div class="summary-card">
                <h3>Transfers Out</h3>
                <p>${{ formatAmount(summary.total_transfers_out) }}</p>
              </div>
              <div class="summary-card">
                <h3>Transfers In</h3>
                <p>${{ formatAmount(summary.total_transfers_in) }}</p>
              </div>
            </div>
          </div>
          
          <div class="fraud-summary" v-if="isAdmin">
            <h2>Fraud Statistics</h2>
            <div class="summary-cards">
              <div class="summary-card">
                <h3>Flagged Transactions</h3>
                <p>{{ fraudStats.flaggedCount || 0 }}</p>
              </div>
              <div class="summary-card">
                <h3>Average Fraud Probability</h3>
                <p>{{ formatAmount(fraudStats.avgFraudProbability || 0) }}%</p>
              </div>
              <div class="summary-card">
                <h3>High Risk Transactions</h3>
                <p>{{ fraudStats.highRiskCount || 0 }}</p>
              </div>
              <div class="summary-card">
                <h3>Latest Detection</h3>
                <p>{{ fraudStats.latestDetection || 'None' }}</p>
              </div>
            </div>
          </div>
          
          <div class="recent-transactions">
            <div class="header-with-link">
              <h2>Recent Transactions</h2>
              <router-link to="/viewall">View All</router-link>
            </div>
            
            <div class="transaction-filters" v-if="isAdmin">
              <div class="filter-group">
                <label>Status:</label>
                <select v-model="filters.status">
                  <option value="">All</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Flagged">Flagged</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Type:</label>
                <select v-model="filters.type">
                  <option value="">All</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                  <option value="TRANSFER_IN">Transfer In</option>
                  <option value="TRANSFER_OUT">Transfer Out</option>
                </select>
              </div>
              <div class="filter-group">
                <label>Risk Level:</label>
                <select v-model="filters.riskLevel">
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div v-if="filteredTransactions.length === 0" class="no-transactions">
              No transactions found
            </div>
            
            <div v-else>
              <div v-for="(transaction, index) in displayedTransactions" :key="index" class="transaction-item">
                <div class="transaction-type" :class="getTransactionTypeClass(transaction.type)">
                  {{ formatTransactionType(transaction.type) }}
                </div>
                <div class="transaction-info">
                  <div class="recipient" v-if="transaction.type === 'TRANSFER_IN' || transaction.type === 'TRANSFER_OUT'">
                    {{ transaction.dest_username }} (ID: {{ transaction.dest_user_id }})
                  </div>
                  <div class="recipient" v-else>
                    {{ transaction.source_username }} (ID: {{ transaction.source_user_id }})
                  </div>
                  <div class="transaction-details-row">
                    <div class="risk-score" :class="getRiskClass(transaction.risk_score)">
                      Risk: {{ transaction.risk_score ? transaction.risk_score + '/100' : 'N/A' }}
                    </div>
                    <div v-if="transaction.fraud_probability !== undefined" 
                         class="fraud-probability" 
                         :class="getFraudClass(transaction.fraud_probability)">
                      Fraud Probability: {{ formatAmount(transaction.fraud_probability) }}%
                    </div>
                  </div>
                  <div v-if="isAdmin && transaction.user_info" class="user-transaction-info">
                    <span class="user-name">{{ transaction.user_info.name }}</span>
                    <span class="user-id">(ID: {{ transaction.user_info.id }})</span>
                  </div>
                </div>
                <div class="transaction-details">
                  <div class="transaction-amount">
                    <span :class="getAmountClass(transaction.type)">
                      {{ getAmountPrefix(transaction.type) }}${{ formatAmount(transaction.amount) }}
                    </span>
                  </div>
                  <div class="transaction-status" :class="getStatusClass(transaction.status)">
                    {{ transaction.status || 'Completed' }}
                  </div>
                  <div class="transaction-date">
                    {{ formatDate(transaction.timestamp) }}
                  </div>
                  <div v-if="isAdmin" class="admin-actions">
                    <button v-if="transaction.status === 'Flagged'" @click="reviewTransaction(transaction.id, 'approve')" class="btn-approve">
                      Approve
                    </button>
                    <button v-if="!['Flagged', 'Failed'].includes(transaction.status)" @click="reviewTransaction(transaction.id, 'flag')" class="btn-flag">
                      Flag
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="pagination-controls" v-if="filteredTransactions.length > pageSize">
                <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
                <span>Page {{ currentPage }} of {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import api from '../services/api'
  
  export default {
    name: 'Monitoring',
    data() {
      return {
        loading: true,
        chartTitle: 'Risk Analysis',
        chartMode: 'fraud',
        isAdmin: false,
        users: [],
        currentUser: null,
        selectedUserId: null,
        summary: {
          current_balance: 0,
          total_deposits: 0,
          total_withdrawals: 0,
          total_transfers_out: 0,
          total_transfers_in: 0,
          transaction_count: 0
        },
        transactions: [],
        fraudStats: {
          flaggedCount: 0,
          avgFraudProbability: 0,
          highRiskCount: 0,
          latestDetection: null
        },
        filters: {
          status: '',
          type: '',
          riskLevel: ''
        },
        currentPage: 1,
        pageSize: 10,
        chartInstance: null
      }
    },
    computed: {
      userId() {
        return this.isAdmin && this.selectedUserId ? this.selectedUserId : localStorage.getItem('user_id');
      },
      userRole() {
        return localStorage.getItem('user_role') || 'user';
      },
      filteredTransactions() {
        return this.transactions.filter(transaction => {
          if (this.filters.status && transaction.status !== this.filters.status) return false;
          if (this.filters.type && transaction.type !== this.filters.type) return false;
          if (this.filters.riskLevel) {
            const score = transaction.risk_score || 0;
            if (this.filters.riskLevel === 'low' && score >= 30) return false;
            if (this.filters.riskLevel === 'medium' && (score < 30 || score >= 70)) return false;
            if (this.filters.riskLevel === 'high' && score < 70) return false;
          }
          return true;
        });
      },
      displayedTransactions() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.filteredTransactions.slice(start, end);
      },
      totalPages() {
        return Math.ceil(this.filteredTransactions.length / this.pageSize);
      }
    },
    methods: {
      async checkUserRole() {
        const role = this.userRole;
        this.isAdmin = role === 'admin';
        
        if (this.isAdmin) {
          try {
            const response = await api.getAllUsers();
            this.users = response.data;
            console.log('Users fetched:', this.users);
          } catch (error) {
            console.error('Error fetching users:', error);
          }
        }
      },
      
      handleUserChange() {
        this.currentPage = 1;
        this.fetchDashboardData();
      },
      
      async fetchDashboardData() {
        this.loading = true;
        try {
          console.log('Fetching all transactions from database...');
          
          const response = await api.getAllTransactions();
          this.transactions = response.data;
          
          // If user is admin and a specific user is selected, filter transactions
          if (this.isAdmin && this.selectedUserId) {
            this.transactions = this.transactions.filter(tx => 
              tx.source_user_id === this.selectedUserId || tx.dest_user_id === this.selectedUserId
            );
            
            // Get user details
            const userResponse = await api.getUserDetails(this.selectedUserId);
            this.currentUser = userResponse.data;
          } else {
            // Regular user - get their own profile
            const userResponse = await api.getCurrentUserDetails();
            this.currentUser = userResponse.data;
          }
          
          // Get account summary
          const summaryResponse = await api.getAccountSummary(this.userId);
          this.summary = summaryResponse.data;
          
          console.log('Transactions fetched:', this.transactions);
          
          this.calculateFraudStats();
          
          this.$nextTick(() => {
            this.renderRiskChart();
          });
        } catch (error) {
          console.error('Error fetching transactions:', error);
          this.addDummyData(); // Fallback to dummy data if API fails
        } finally {
          this.loading = false;
        }
      },
      
      calculateFraudStats() {
        if (!this.transactions || this.transactions.length === 0) {
          return;
        }
        
        this.fraudStats.flaggedCount = this.transactions.filter(tx => tx.status === 'Flagged').length;
        
        const fraudProbs = this.transactions
          .filter(tx => tx.fraud_probability !== undefined)
          .map(tx => tx.fraud_probability);
          
        this.fraudStats.avgFraudProbability = fraudProbs.length > 0
          ? fraudProbs.reduce((sum, prob) => sum + prob, 0) / fraudProbs.length
          : 0;
        
        this.fraudStats.highRiskCount = this.transactions.filter(tx => 
          tx.fraud_probability !== undefined && tx.fraud_probability > 70).length;
        
        const flaggedTxs = this.transactions.filter(tx => tx.status === 'Flagged');
        if (flaggedTxs.length > 0) {
          flaggedTxs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          this.fraudStats.latestDetection = this.formatDate(flaggedTxs[0].timestamp);
        } else {
          this.fraudStats.latestDetection = 'None';
        }
      },
      
      addDummyData() {
        console.log('Adding dummy data for testing');
        
        this.summary = {
          current_balance: 5432.10,
          total_deposits: 8500.00,
          total_withdrawals: 3200.00,
          total_transfers_out: 1200.00,
          total_transfers_in: 1332.10,
          transaction_count: 15
        };
        
        const now = new Date();
        
        this.transactions = [
          {
            id: 't123',
            type: 'DEPOSIT',
            source_username: 'Bank Deposit',
            source_user_id: 'BANK001',
            risk_score: 10,
            fraud_probability: 8.5,
            amount: 2000.00,
            status: 'Completed',
            timestamp: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
            user_info: {
              id: '1001',
              name: 'John Smith'
            }
          },
          {
            id: 't124',
            type: 'WITHDRAWAL',
            source_username: 'ATM Withdrawal',
            source_user_id: 'ATM002',
            risk_score: 15,
            fraud_probability: 12.7,
            amount: 500.00,
            status: 'Completed',
            timestamp: new Date(now - 1000 * 60 * 60 * 24 * 1).toISOString(),
            user_info: {
              id: '1001',
              name: 'John Smith'
            }
          },
          {
            id: 't125',
            type: 'TRANSFER_OUT',
            dest_username: 'Unknown Entity',
            dest_user_id: 'USER445',
            risk_score: 75,
            fraud_probability: 82.3,
            amount: 800.00,
            status: 'Flagged',
            timestamp: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
            user_info: {
              id: '1001',
              name: 'John Smith'
            }
          },
          {
            id: 't126',
            type: 'TRANSFER_IN',
            dest_username: 'Sarah Johnson',
            dest_user_id: '1001',
            source_user_id: '1002',
            source_username: 'Sarah Johnson',
            risk_score: 25,
            fraud_probability: 18.4,
            amount: 1200.00,
            status: 'Completed',
            timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
            user_info: {
              id: '1002',
              name: 'Sarah Johnson'
            }
          },
          {
            id: 't127',
            type: 'WITHDRAWAL',
            source_username: 'Online Purchase',
            source_user_id: 'ONLINE003',
            risk_score: 65,
            fraud_probability: 58.9,
            amount: 199.99,
            status: 'Pending',
            timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
            user_info: {
              id: '1001',
              name: 'John Smith'
            }
          }
        ];
        
        this.currentUser = {
          id: '1001',
          name: 'John Smith'
        };
        
        this.calculateFraudStats();
        
        this.$nextTick(() => {
          this.renderRiskChart();
        });
      },
      
      async reviewTransaction(transactionId, action) {
        const index = this.transactions.findIndex(tx => tx.id === transactionId);
        if (index === -1) return;
        
        try {
          const transaction = this.transactions[index];
          
          if (action === 'approve') {
            try {
              await api.approveTransaction(transactionId);
              this.transactions[index].status = 'Completed';
              this.calculateFraudStats();
            } catch (error) {
              console.error('Error approving transaction:', error);
              // Still update UI for demonstration purposes
              this.transactions[index].status = 'Completed';
              this.calculateFraudStats();
            }
          } else if (action === 'flag') {
            try {
              await api.flagTransaction(transactionId);
              this.transactions[index].status = 'Flagged';
              this.calculateFraudStats();
            } catch (error) {
              console.error('Error flagging transaction:', error);
              // Still update UI for demonstration purposes
              this.transactions[index].status = 'Flagged';
              this.calculateFraudStats();
            }
          }
        } catch (error) {
          console.error('Error updating transaction:', error);
        }
      },
      
      renderRiskChart() {
        console.log('Attempting to render chart');
        
        let canvas = this.$refs.riskCanvas;
        if (!canvas) {
          console.log('Canvas ref not found, trying getElementById');
          canvas = document.getElementById('riskChart');
        }
        
        if (!canvas) {
          console.error('Canvas element not found');
          return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Could not get 2D context from canvas');
          return;
        }
        
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        let chartData;
        switch (this.chartMode) {
          case 'fraud':
            chartData = this.prepareFraudChartData();
            this.chartTitle = 'Fraud Probability Analysis';
            break;
          case 'risk':
            chartData = this.prepareRiskChartData();
            this.chartTitle = 'Risk Score Analysis';
            break;
          case 'amounts':
            chartData = this.prepareAmountChartData();
            this.chartTitle = 'Transaction Amount Analysis';
            break;
          default:
            chartData = this.prepareFraudChartData();
            this.chartTitle = 'Fraud Probability Analysis';
        }
        
        const { labels, datasets } = chartData;
        
        if (datasets.length === 0 || labels.length === 0) {
          console.log('No data available for chart');
          this.drawNoDataMessage(ctx, width, height);
          return;
        }
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        const padding = 50;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.chartTitle, width / 2, 20);
        
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.strokeStyle = '#ddd';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.strokeStyle = '#ddd';
        ctx.stroke();
        
        const allValues = datasets.flatMap(ds => ds.values);
        const maxValue = Math.max(...allValues, 1) * 1.1;
        
        if (this.chartMode === 'fraud' || this.chartMode === 'risk') {
          this.drawMetricLine(ctx, chartData, padding, chartWidth, chartHeight, height, maxValue);
        } else {
          this.drawTransactionLines(ctx, chartData, padding, chartWidth, chartHeight, height, maxValue);
        }
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        
        const numYLabels = 5;
        for (let i = 0; i <= numYLabels; i++) {
          const value = (maxValue / numYLabels) * i;
          const y = height - padding - ((value / maxValue) * chartHeight);
          
          let label;
          if (this.chartMode === 'fraud' || this.chartMode === 'risk') {
            label = Math.round(value);
            if (this.chartMode === 'fraud') label += '%';
          } else {
            label = '$' + this.formatAmount(value);
          }
          
          ctx.fillText(label, padding - 10, y + 4);
          
          ctx.beginPath();
          ctx.moveTo(padding, y);
          ctx.lineTo(width - padding, y);
          ctx.strokeStyle = '#eee';
          ctx.stroke();
        }
        
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
          const x = padding + (index * (chartWidth / (labels.length - 1 || 1)));
          ctx.fillText(label, x, height - padding + 20);
          
          ctx.beginPath();
          ctx.moveTo(x, padding);
          ctx.lineTo(x, height - padding);
          ctx.strokeStyle = '#eee';
          ctx.stroke();
        });
        
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        
        let yAxisTitle;
        switch(this.chartMode) {
          case 'fraud':
            yAxisTitle = 'Fraud Probability (%)';
            break;
          case 'risk':
            yAxisTitle = 'Risk Score';
            break;
          case 'amounts':
            yAxisTitle = 'Amount ($)';
            break;
          default:
            yAxisTitle = 'Value';
        }
        
        ctx.fillText(yAxisTitle, 0, 0);
        ctx.restore();
        
        ctx.fillText('Date', width / 2, height - 15);
        
        if (this.chartMode === 'amounts' && datasets.length > 0) {
          this.drawTransactionLegend(ctx, datasets, width, padding);
        }
        
        console.log('Chart rendering complete');
      },
      
      drawMetricLine(ctx, chartData, padding, chartWidth, chartHeight, height, maxValue) {
        const { datasets } = chartData;
        const dataset = datasets[0];
        
        const lineColors = {
          'fraud': '#9b59b6',
          'risk': '#e74c3c'
        };
        
        const lineColor = lineColors[this.chartMode] || '#e74c3c';
        const fillColor = this.chartMode === 'fraud' 
          ? 'rgba(155, 89, 182, 0.1)' 
          : 'rgba(231, 76, 60, 0.1)';
        
        const points = dataset.values.map((value, index) => {
          const x = padding + (index * (chartWidth / (dataset.values.length - 1 || 1)));
          const y = height - padding - ((value / maxValue) * chartHeight);
          return { x, y };
        });
        
        if (points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, height - padding);
          points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.lineTo(points[points.length - 1].x, height - padding);
          ctx.closePath();
          ctx.fillStyle = fillColor;
          ctx.fill();
        }
        
        ctx.beginPath();
        points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        points.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = lineColor;
          ctx.fill();
        });
        
        if (this.chartMode === 'fraud') {
          const thresholdY = height - padding - ((70 / maxValue) * chartHeight);
          
          ctx.beginPath();
          ctx.moveTo(padding, thresholdY);
          ctx.lineTo(width - padding, thresholdY);
          ctx.strokeStyle = 'rgba(231, 76, 60, 0.7)';
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          
          ctx.fillStyle = '#e74c3c';
          ctx.font = '10px Arial';
          ctx.textAlign = 'right';
          ctx.fillText('High Risk Threshold (70%)', width - padding - 10, thresholdY - 5);
        }
      },
      
      drawTransactionLines(ctx, chartData, padding, chartWidth, chartHeight, height, maxValue) {
        const { datasets } = chartData;
        
        datasets.forEach(dataset => {
          const points = dataset.values.map((value, index) => {
            const x = padding + (index * (chartWidth / (dataset.values.length - 1 || 1)));
            const y = height - padding - ((value / maxValue) * chartHeight);
            return { x, y };
          });
          
          if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, height - padding);
            points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.lineTo(points[points.length - 1].x, height - padding);
            ctx.closePath();
            ctx.fillStyle = dataset.fillColor || 'rgba(52, 152, 219, 0.1)';
            ctx.fill();
          }
          
          ctx.beginPath();
          points.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.strokeStyle = dataset.color || '#3498db';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = dataset.color || '#3498db';
            ctx.fill();
          });
        });
      },
      
      drawTransactionLegend(ctx, datasets, width, padding) {
        const legendX = width - padding - 120;
        const legendY = padding + 20;
        const lineHeight = 20;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(legendX - 10, legendY - 15, 130, datasets.length * lineHeight + 10);
        ctx.strokeStyle = '#ddd';
        ctx.strokeRect(legendX - 10, legendY - 15, 130, datasets.length * lineHeight + 10);
        
        datasets.forEach((dataset, index) => {
          const y = legendY + (index * lineHeight);
          
          ctx.beginPath();
          ctx.moveTo(legendX, y);
          ctx.lineTo(legendX + 20, y);
          ctx.strokeStyle = dataset.color || '#3498db';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(legendX + 10, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = dataset.color || '#3498db';
          ctx.fill();
          
          ctx.fillStyle = '#333';
          ctx.font = '12px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(dataset.label, legendX + 25, y + 4);
        });
      },
      
      drawNoDataMessage(ctx, width, height) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#999';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No data available for chart',width / 2, height / 2),
        ctx.fillText('No data available for chart', width / 2, height / 2)
      },
      
      prepareFraudChartData() {
        if (!this.transactions || this.transactions.length === 0) {
          return { labels: [], datasets: [] };
        }
        
        // Group by date
        const groupedByDate = {};
        this.transactions.forEach(tx => {
          if (tx.fraud_probability === undefined) return;
          
          const date = this.formatDateShort(tx.timestamp);
          if (!groupedByDate[date]) {
            groupedByDate[date] = [];
          }
          groupedByDate[date].push(tx.fraud_probability);
        });
        
        const labels = Object.keys(groupedByDate).sort();
        const values = labels.map(date => {
          const values = groupedByDate[date];
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        });
        
        return {
          labels,
          datasets: [{
            label: 'Avg Fraud Probability',
            values
          }]
        };
      },
      
      prepareRiskChartData() {
        if (!this.transactions || this.transactions.length === 0) {
          return { labels: [], datasets: [] };
        }
        
        // Group by date
        const groupedByDate = {};
        this.transactions.forEach(tx => {
          if (tx.risk_score === undefined) return;
          
          const date = this.formatDateShort(tx.timestamp);
          if (!groupedByDate[date]) {
            groupedByDate[date] = [];
          }
          groupedByDate[date].push(tx.risk_score);
        });
        
        const labels = Object.keys(groupedByDate).sort();
        const values = labels.map(date => {
          const values = groupedByDate[date];
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        });
        
        return {
          labels,
          datasets: [{
            label: 'Avg Risk Score',
            values
          }]
        };
      },
      
      prepareAmountChartData() {
        if (!this.transactions || this.transactions.length === 0) {
          return { labels: [], datasets: [] };
        }
        
        // Group by date and type
        const dates = {};
        const types = {
          'DEPOSIT': { color: '#2ecc71', fillColor: 'rgba(46, 204, 113, 0.1)' },
          'WITHDRAWAL': { color: '#e74c3c', fillColor: 'rgba(231, 76, 60, 0.1)' },
          'TRANSFER_IN': { color: '#3498db', fillColor: 'rgba(52, 152, 219, 0.1)' },
          'TRANSFER_OUT': { color: '#f39c12', fillColor: 'rgba(243, 156, 18, 0.1)' }
        };
        
        this.transactions.forEach(tx => {
          const date = this.formatDateShort(tx.timestamp);
          if (!dates[date]) {
            dates[date] = { 
              DEPOSIT: 0, 
              WITHDRAWAL: 0, 
              TRANSFER_IN: 0, 
              TRANSFER_OUT: 0 
            };
          }
          dates[date][tx.type] += tx.amount;
        });
        
        const labels = Object.keys(dates).sort();
        const datasets = Object.keys(types).map(type => {
          return {
            label: this.formatTransactionType(type),
            values: labels.map(date => dates[date][type]),
            color: types[type].color,
            fillColor: types[type].fillColor
          };
        });
        
        return { labels, datasets };
      },
      
      formatAmount(amount) {
        if (amount === undefined || amount === null) return '0.00';
        return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      },
      
      formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString();
      },
      
      formatDateShort(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      },
      
      formatTransactionType(type) {
        switch(type) {
          case 'DEPOSIT': return 'Deposit';
          case 'WITHDRAWAL': return 'Withdrawal';
          case 'TRANSFER_IN': return 'Transfer In';
          case 'TRANSFER_OUT': return 'Transfer Out';
          default: return type;
        }
      },
      
      getTransactionTypeClass(type) {
        return `type-${type.toLowerCase().replace('_', '-')}`;
      },
      
      getAmountClass(type) {
        if (type === 'DEPOSIT' || type === 'TRANSFER_IN') {
          return 'amount-positive';
        } else {
          return 'amount-negative';
        }
      },
      
      getAmountPrefix(type) {
        if (type === 'DEPOSIT' || type === 'TRANSFER_IN') {
          return '+';
        } else {
          return '-';
        }
      },
      
      getStatusClass(status) {
        if (!status) return 'status-completed';
        return `status-${status.toLowerCase()}`;
      },
      
      getRiskClass(score) {
        if (!score) return 'risk-na';
        if (score < 30) return 'risk-low';
        if (score < 70) return 'risk-medium';
        return 'risk-high';
      },
      
      getFraudClass(probability) {
        if (probability === undefined) return 'fraud-na';
        if (probability < 30) return 'fraud-low';
        if (probability < 70) return 'fraud-medium';
        return 'fraud-high';
      },
      
      prevPage() {
        if (this.currentPage > 1) {
          this.currentPage -= 1;
        }
      },
      
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage += 1;
        }
      }
    },
    
    mounted() {
      this.checkUserRole();
      this.fetchDashboardData();
      
      // Add resize listener for chart responsiveness
      window.addEventListener('resize', this.renderRiskChart);
    },
    
    beforeDestroy() {
      // Remove resize listener when component is destroyed
      window.removeEventListener('resize', this.renderRiskChart);
    },
    
    watch: {
      // Re-render chart when filters change
      'filters': {
        handler() {
          this.currentPage = 1;
          this.$nextTick(() => {
            this.renderRiskChart();
          });
        },
        deep: true
      }
    }
  }
  </script>
  
  <style scoped>
  .dashboard {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  h1 {
    margin-bottom: 20px;
    color: #2c3e50;
  }
  
  h2 {
    margin-top: 30px;
    margin-bottom: 15px;
    color: #34495e;
  }
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    font-size: 18px;
    color: #7f8c8d;
  }
  
  .admin-info {
    background-color: #ecf0f1;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .user-selector {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .user-selector select {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #bdc3c7;
  }
  
  .account-overview {
    margin-bottom: 30px;
  }
  
  .balance-card {
    background-color: #3498db;
    color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .balance-card h3 {
    margin-top: 0;
    font-size: 16px;
    font-weight: normal;
  }
  
  .balance-amount {
    font-size: 32px;
    font-weight: bold;
    margin: 10px 0;
  }
  
  .user-details {
    font-size: 14px;
  }
  
  .user-details p {
    margin: 5px 0;
  }
  
  .risk-graph-section {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
  }
  
  .graph-controls {
    margin-bottom: 15px;
  }
  
  .chart-type-toggle {
    display: flex;
    gap: 15px;
  }
  
  .chart-type-toggle label {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
  }
  
  .graph-container {
    position: relative;
    height: 320px;
  }
  
  .summary-section {
    margin-bottom: 30px;
  }
  
  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
  }
  
  .summary-card {
    background-color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .summary-card h3 {
    margin-top: 0;
    font-size: 14px;
    color: #7f8c8d;
  }
  
  .summary-card p {
    font-size: 18px;
    font-weight: bold;
    margin: 10px 0 0;
    color: #2c3e50;
  }
  
  .fraud-summary {
    margin-bottom: 30px;
  }
  
  .header-with-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .header-with-link a {
    color: #3498db;
    text-decoration: none;
  }
  
  .transaction-filters {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .filter-group select {
    padding: 6px;
    border-radius: 4px;
    border: 1px solid #bdc3c7;
  }
  
  .recent-transactions {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .transaction-item {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #ecf0f1;
    align-items: center;
  }
  
  .transaction-item:last-child {
    border-bottom: none;
  }
  
  .transaction-type {
    width: 110px;
    padding: 6px 10px;
    border-radius: 4px;
    text-align: center;
    font-size: 13px;
    font-weight: bold;
  }
  
  .type-deposit {
    background-color: #e8f8f5;
    color: #2ecc71;
  }
  
  .type-withdrawal {
    background-color: #fdebd0;
    color: #e67e22;
  }
  
  .type-transfer-in {
    background-color: #ebf5fb;
    color: #3498db;
  }
  
  .type-transfer-out {
    background-color: #fadbd8;
    color: #e74c3c;
  }
  
  .transaction-info {
    flex: 1;
    margin-left: 15px;
  }
  
  .recipient {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .transaction-details-row {
    display: flex;
    gap: 15px;
    margin-top: 5px;
    font-size: 13px;
  }
  
  .risk-score, .fraud-probability {
    padding: 3px 8px;
    border-radius: 4px;
  }
  
  .risk-low, .fraud-low {
    background-color: #eafaf1;
    color: #27ae60;
  }
  
  .risk-medium, .fraud-medium {
    background-color: #fef9e7;
    color: #f39c12;
  }
  
  .risk-high, .fraud-high {
    background-color: #fadbd8;
    color: #c0392b;
  }
  
  .risk-na, .fraud-na {
    background-color: #ecf0f1;
    color: #95a5a6;
  }
  
  .user-transaction-info {
    margin-top: 5px;
    font-size: 13px;
    color: #7f8c8d;
  }
  
  .transaction-details {
    text-align: right;
    min-width: 150px;
  }
  
  .transaction-amount {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .amount-positive {
    color: #2ecc71;
  }
  
  .amount-negative {
    color: #e74c3c;
  }
  
  .transaction-status {
    font-size: 13px;
    padding: 3px 8px;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 5px;
  }
  
  .status-completed {
    background-color: #eafaf1;
    color: #27ae60;
  }
  
  .status-pending {
    background-color: #fef9e7;
    color: #f39c12;
  }
  
  .status-flagged {
    background-color: #fadbd8;
    color: #e74c3c;
  }
  
  .status-failed {
    background-color: #f5f5f5;
    color: #7f8c8d;
  }
  
  .transaction-date {
    font-size: 12px;
    color: #95a5a6;
  }
  
  .no-transactions {
    text-align: center;
    padding: 30px;
    color: #7f8c8d;
  }
  
  .admin-actions {
    margin-top: 8px;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
  
  .admin-actions button {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    border: none;
  }
  
  .btn-approve {
    background-color: #27ae60;
    color: white;
  }
  
  .btn-flag {
    background-color: #e74c3c;
    color: white;
  }
  
  .pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
  }
  
  .pagination-controls button {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    background-color: #3498db;
    color: white;
    cursor: pointer;
  }
  
  .pagination-controls button:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    .transaction-item {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .transaction-info {
      margin-left: 0;
      margin-top: 10px;
      width: 100%;
    }
    
    .transaction-details {
      margin-top: 10px;
      text-align: left;
      width: 100%;
    }
    
    .summary-cards {
      grid-template-columns: 1fr;
    }
    
    .transaction-filters {
      flex-direction: column;
      gap: 10px;
    }
    
    .admin-actions {
      justify-content: flex-start;
    }
  }
  </style>