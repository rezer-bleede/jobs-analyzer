export interface EmployerRecord {
  company_name: string
  domain?: string | null
  company_url?: string | null
  industry?: string | null
  jobs_seen?: number | null
  data_ai_jobs_90d?: number | null
  cities?: string[] | null
  sources?: string[] | null
  careers_sa_url?: string | null
  careers_sa_open_jobs?: number | null
  lei?: string | null
  legal_name?: string | null
  commercial_registration_number?: string | null
  registration_authority?: string | null
  legal_city?: string | null
  legal_region?: string | null
  legal_status?: string | null
  parent_lei?: string | null
  parent_legal_name?: string | null
  wikidata_id?: string | null
  headquarters?: string | null
  is_ai_active?: boolean | null
  hf_model_count?: number | null
  hf_dataset_count?: number | null
  hf_downloads?: number | null
}
