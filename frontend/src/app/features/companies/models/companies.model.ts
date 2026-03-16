export interface Company {
  id: string | number;
  tenantId: string | number;
  registrationNo: string;
  name: string;
  industry: string | null;
  source: string;
  status: 'active' | 'inactive';
  annualRevenue: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyPayload {
  registrationNo: string;
  name: string;
  industry: string | null;
  source: string;
  status: 'active' | 'inactive';
  annualRevenue: number | null;
}

export interface CompaniesQuery {
  q?: string;
  page?: number;
  limit?: number;
  industry?: string;
  source?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}
