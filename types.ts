
export interface Business {
  name: string;
  industry: string;
  phone: string;
  address: string;
  email?: string;
  website?: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
  };
}

export interface SearchResult {
  text: string;
  businesses: Business[];
  sources: GroundingChunk[];
}
