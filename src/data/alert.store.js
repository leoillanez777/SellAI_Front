import { defineStore } from 'pinia';

export const useAlertStore = defineStore('alert', {
  state: () => ({
    alert: [],
    count: 0,
    random: false,
    summaryMap: {
      'success': 'Exitoso', 
      'info': 'Información', 
      'warn': 'Atención', 
      'error': 'Error'
    }
  }),
  actions: {
    /**
     * @typedef import { useAlertStore } from '@/data'
     */

    /**
     * @description show a toast message
     * @param {string} message - Message to show
     * @param {'success' | 'info' | 'warn' | 'error'} severity - Type of message (success, info, warn, error)
     */
    toastAlert(msg, severity, seconds = 3, summary) {
      let _id = "", _t = this
      if (_t.count > 10) { _t.clear() }

      if (_t.random) { _id = `id_${Math.random().toString(36).substring(2)}` }
      else { _id = `id_${_t.count++}` }
      
      summary = summary || _t.summaryMap[severity] || "Mensaje"
      const life = seconds * 1000
      _t.alert.push({ msg, severity, id: _id, read: false, summary, life})
    },
    /**
     * @description the alert is marked as read
     * 
     * @param {*} id - Id of the alert to mark
     */
    markAsRead(id) {
      const alertToMark = this.alert.find(alert => alert.id === id);
      if (alertToMark) {
        alertToMark.read = true;
      }
    },
    /**
     * @description Initialize variables
     * @param {boolean} random - Generate random id
     */
    clear(random) {
      this.count = 0
      this.alert = []
      this.random = random || false
    },
    exception(ex, seconds = 3) {
      let t = this
      if (ex.response && ex.response.data) {
        if (ex.response.data.Error) {
          ex.response.data.Error.forEach(e => {
            debugger
            t.error(e)
          });
        }
        else if (ex.response.status === 500 && ex.response.data) {
          const originalText = ex.response.data
          const index = originalText.indexOf("\n")
          const extractedText = originalText.substring(0, index)
          t.toastAlert(extractedText, 'warn', seconds)
          }
        else if (ex.response.status === 500) {
          this.toastAlert('Error en el servidor!', 'warn', seconds)
        }
        else {
          t.toastAlert(ex.response.toJSON(), 'error', seconds)
        }
      } 
      else if (ex.request) {
        if (ex.message && ex.message == "Network Error") {
          t.toastAlert("Sin conexión con el servidor", 'warn', seconds)
        }
        else {
          t.toastAlert(ex.request, 'error', seconds)
        }
      } 
      else if (ex.message) {
        t.toastAlert(ex.message, 'error', seconds)
      }
      else {
        t.toastAlert(ex.toJSON(), 'error', seconds)
      }
    }
  }
})