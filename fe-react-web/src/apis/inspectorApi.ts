import apiClient from './apiClient';

import { searchBikes, SearchBikesParams } from '../api/bikeApi';

// Inspector APIs
export const getInspectorDashboard = async () => {
  const res = await apiClient.get('/inspector/v1/dashboard');
  return res.data;
};

export const getPendingBikes = async () => {
  const res = await apiClient.get('/inspector/v1/bikes/pending');
  return res.data;
};

export const getBikeDetails = async (bikeId: string) => {
  const res = await apiClient.get(`/inspector/v1/bikes/${bikeId}`);
  return res.data;
};

export const startInspection = async (bikeId: string) => {
  const res = await apiClient.post(`/inspector/v1/bikes/${bikeId}/start`);
  return res.data;
};

export const submitInspection = async (bikeId: string, data: any) => {
  const res = await apiClient.post(
    `/inspector/v1/bikes/${bikeId}/inspect`,
    data,
  );
  return res.data;
};

export const getInspectionHistory = async () => {
  const res = await apiClient.get('/inspector/v1/inspections');
  return res.data;
};

export const getInspectionDetails = async (inspectionId: string) => {
  const res = await apiClient.get(`/inspector/v1/inspections/${inspectionId}`);
  return res.data;
};

// Gọi API search bikes cho inspector (có thể tái sử dụng cho FE)
export async function fetchBikesForInspector(params: SearchBikesParams) {
  return searchBikes(params);
}

export const updateInspection = async (inspectionId: string, data: any) => {
  const res = await apiClient.put(
    `/inspector/v1/inspections/${inspectionId}`,
    data,
  );
  return res.data;
};
