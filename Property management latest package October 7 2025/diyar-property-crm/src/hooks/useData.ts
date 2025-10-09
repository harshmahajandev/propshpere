// React hooks for data fetching and state management
import { useState, useEffect } from 'react';
import { 
  islandsAPI, 
  projectsAPI, 
  propertiesAPI, 
  customersAPI, 
  leadsAPI, 
  recommendationsAPI,
  financialAPI 
} from '../lib/api';

// Custom hook for islands data
export const useIslands = () => {
  const [islands, setIslands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIslands = async () => {
    try {
      setLoading(true);
      const data = await islandsAPI.getAll();
      setIslands(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIslands();
  }, []);

  return { islands, loading, error, refetch: fetchIslands };
};

// Custom hook for projects data
export const useProjects = (islandId?: string) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = islandId 
          ? await projectsAPI.getByIsland(islandId)
          : await projectsAPI.getAll();
        setProjects(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [islandId]);

  return { projects, loading, error };
};

// Custom hook for properties data
export const useProperties = (projectId?: string) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = projectId 
          ? await propertiesAPI.getByProject(projectId)
          : await propertiesAPI.getAll();
        setProperties(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [projectId]);

  return { properties, loading, error };
};

// Custom hook for customers data
export const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const data = await customersAPI.getAll();
        setCustomers(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const createCustomer = async (customerData: any) => {
    try {
      const newCustomer = await customersAPI.create(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { customers, loading, error, createCustomer };
};

// Custom hook for leads data
export const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const data = await leadsAPI.getAll();
        setLeads(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const createLead = async (leadData: any) => {
    try {
      const newLead = await leadsAPI.create(leadData);
      setLeads(prev => [newLead, ...prev]);
      return newLead;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const updatedLead = await leadsAPI.updateStatus(leadId, status);
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? updatedLead : lead
      ));
      return updatedLead;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { leads, loading, error, createLead, updateLeadStatus };
};

// Custom hook for recommendations
export const useRecommendations = (customerId?: string) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendations = async (targetCustomerId: string) => {
    try {
      setLoading(true);
      const data = await recommendationsAPI.generateRecommendations(targetCustomerId);
      setRecommendations(data?.data || []);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (targetCustomerId: string) => {
    try {
      setLoading(true);
      const data = await recommendationsAPI.getForCustomer(targetCustomerId);
      setRecommendations(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchRecommendations(customerId);
    }
  }, [customerId]);

  return { recommendations, loading, error, generateRecommendations, fetchRecommendations };
};

// Custom hook for financial data
export const useFinancialData = (customerId?: string) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = customerId 
          ? await financialAPI.getCustomerTransactions(customerId)
          : await financialAPI.getTransactions();
        setTransactions(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [customerId]);

  return { transactions, loading, error };
};