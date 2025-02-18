// utils/timerController.js
const Recaptcha = require('../models/Recaptcha');

class RecaptchaTimer {
  constructor(ws, siteKey) {
    this.ws = ws;
    this.siteKey = siteKey;
    this.timer = null;
  }

  parseTimeString(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000;
  }

  formatTimeString(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  async startTimer(initialTime) {
    let remainingTime = this.parseTimeString(initialTime);
    
    const updateInterval = async () => {
      remainingTime -= 1000;
      
      if (remainingTime <= 0) {
        await this.handleTimerExpired();
        return;
      }

      const timeString = this.formatTimeString(remainingTime);
      await this.updateTime(timeString);
      
      this.timer = setTimeout(updateInterval, 1000);
    };

    this.timer = setTimeout(updateInterval, 1000);
  }

  async updateTime(timeString) {
    try {
      const recaptcha = await Recaptcha.findBySiteKey(this.siteKey);
      if (!recaptcha) {
        throw new Error('Recaptcha not found');
      }

      const updateData = {
        ...recaptcha,
        time_g_response: timeString
      };

      await Recaptcha.updateBySiteKey(this.siteKey, updateData);
      
      // Use existing WebSocket message structure
      this.ws.send(JSON.stringify({
        type: 'RECAPTCHA',
        action: 'UPDATE',
        success: true,
        data: updateData
      }));
    } catch (error) {
      console.error('Error updating time:', error);
    }
  }

  async handleTimerExpired() {
    try {
      const recaptcha = await Recaptcha.findBySiteKey(this.siteKey);
      if (!recaptcha) {
        throw new Error('Recaptcha not found');
      }

      const updateData = {
        ...recaptcha,
        g_response: null,
        status_g_response: false,
        time_g_response: '00:00:00'
      };

      await Recaptcha.updateBySiteKey(this.siteKey, updateData);
      
      // Use existing WebSocket message structure
      this.ws.send(JSON.stringify({
        type: 'RECAPTCHA',
        action: 'UPDATE',
        success: true,
        data: updateData
      }));

      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    } catch (error) {
      console.error('Error handling timer expiration:', error);
    }
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

module.exports = RecaptchaTimer;