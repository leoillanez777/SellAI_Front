import axios from 'axios';
// import { useAuthStore } from '@/store';

export default class RequestService {

  constructor() {
    // const authStore = useAuthStore();
    // const basicAuth = 'Bearer ' + authStore.token;
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': basicAuth
      },
    });
  }

  async getMethod(url) {
    try {
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      // TODO: Handle error here
      throw error;
    }
  }

  async postMethod(url, data) {
    try {
      const response = await this.axiosInstance.post(url, data)
      console.log("Response Post: ", response)
      return response.data
    } catch (error) {
      // TODO: Handle error here
      throw error
    }
  }
  
  async postData(url, file) {
    try {
      const formData = new FormData();
      formData.append('file', file, 'audio.mp3');
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      }
      const response = await this.axiosInstance(config);
      return response.data;
    } catch (error) {
      // TODO: Handle error here
      throw error;
    }
  }

  async putMethod(url, data) {
    try {
      const response = await this.axiosInstance.put(url, data)
      return response.data
    } catch (error) {
      // TODO: Handle error here
      throw error;
    }
  }

  async deleteMethod(url, id) {
    try {
      const response = await this.axiosInstance.delete(`${url}/${id}`);
      return response.data;
    } catch (error) {
      // TODO: Handle error here
      throw error;
    }
  }
}