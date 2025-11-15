/**
 * POS Bridge - Reliable communication between POS and Customer Display
 * Handles WebSocket connections with automatic reconnection and fallback to polling
 */

class POSBridge {
  constructor(merchantId, stationId) {
    this.merchantId = merchantId;
    this.stationId = stationId;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 2000;
    this.heartbeatInterval = null;
    this.messageQueue = [];
    this.listeners = new Map();
    this.isConnected = false;
    this.useFallback = false;
    this.fallbackInterval = null;
  }

  // Initialize WebSocket connection
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('POSBridge: Already connected');
      return;
    }

    try {
      // Try WebSocket first
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/pos-bridge?merchant_id=${this.merchantId}&station_id=${this.stationId}`;
      
      console.log('POSBridge: Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('POSBridge: WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.useFallback = false;
        this.startHeartbeat();
        this.flushMessageQueue();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('POSBridge: Received message:', message);
          this.emit(message.type, message.data);
        } catch (e) {
          console.error('POSBridge: Failed to parse message:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('POSBridge: WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('POSBridge: WebSocket closed');
        this.isConnected = false;
        this.stopHeartbeat();
        this.handleDisconnect();
      };

    } catch (error) {
      console.error('POSBridge: Failed to create WebSocket:', error);
      this.startFallbackMode();
    }
  }

  // Handle disconnection with exponential backoff
  handleDisconnect() {
    this.emit('disconnected');

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`POSBridge: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.log('POSBridge: Max reconnect attempts reached, switching to fallback mode');
      this.startFallbackMode();
    }
  }

  // Fallback to polling when WebSocket fails
  startFallbackMode() {
    if (this.fallbackInterval) return;
    
    console.log('POSBridge: Starting fallback polling mode');
    this.useFallback = true;
    this.emit('fallback_mode');

    // Poll for updates every 2 seconds
    this.fallbackInterval = setInterval(() => {
      this.pollForUpdates();
    }, 2000);
  }

  stopFallbackMode() {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
      this.useFallback = false;
    }
  }

  // Poll for order updates (fallback method)
  async pollForUpdates() {
    try {
      // This will be implemented by the specific display
      this.emit('poll_request');
    } catch (error) {
      console.error('POSBridge: Polling error:', error);
    }
  }

  // Send message with retry logic
  send(type, data, retries = 3) {
    const message = { type, data, timestamp: Date.now() };

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        console.log('POSBridge: Sent message:', type);
        return Promise.resolve();
      } catch (error) {
        console.error('POSBridge: Failed to send message:', error);
        if (retries > 0) {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(this.send(type, data, retries - 1));
            }, 1000);
          });
        }
      }
    } else {
      // Queue message for later
      console.log('POSBridge: Queueing message for later:', type);
      this.messageQueue.push(message);
      return Promise.reject(new Error('Not connected'));
    }
  }

  // Flush queued messages
  flushMessageQueue() {
    console.log(`POSBridge: Flushing ${this.messageQueue.length} queued messages`);
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message.type, message.data, 1);
    }
  }

  // Heartbeat to keep connection alive
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send('heartbeat', { timestamp: Date.now() }, 0);
      }
    }, 15000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Event emitter pattern
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error('POSBridge: Listener error:', e);
      }
    });
  }

  // Cleanup
  disconnect() {
    console.log('POSBridge: Disconnecting');
    this.stopHeartbeat();
    this.stopFallbackMode();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }
}

export default POSBridge;