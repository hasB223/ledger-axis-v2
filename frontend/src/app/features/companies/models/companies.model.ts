export interface Company {
  id: string;
  name: string;
  country: string;
  status: 'active' | 'inactive';
  description: string;
}

export interface CompanyPayload {
  name: string;
  country: string;
  status: 'active' | 'inactive';
  description: string;
}
