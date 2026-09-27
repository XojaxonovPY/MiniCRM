import { apiRequest } from './client';

export const leadsApi = {
  getLeads: async ({ search = '', status = '', limit = 20, offset = 0, sorted_by = [] } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit);
    if (offset !== undefined) params.append('offset', offset);
    if (sorted_by && sorted_by.length > 0) {
      sorted_by.forEach(sortField => params.append('sorted_by', sortField));
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/controller/lead/list/${query}`, {
      method: 'GET',
    });
  },

  getLeadById: async (id) => {
    return await apiRequest(`/controller/get/lead/${id}/`, {
      method: 'GET',
    });
  },

  createLead: async (leadData) => {
    // leadData: { name, source, note, phone_number?, email? }
    return await apiRequest('/controller/create/lead/', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  updateLead: async (id, patchData) => {
    // patchData: { name?, source?, note?, status?, phone_number?, email? }
    return await apiRequest(`/controller/update/lead/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(patchData),
    });
  },

  getLeadHistory: async (id) => {
    return await apiRequest(`/controller/actions/history/${id}`, {
      method: 'GET',
    });
  },
};
