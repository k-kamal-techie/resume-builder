export interface UserSettingsData {
  anthropicToken: string;
  anthropicModel: string;
}

export interface UserSettingsResponse {
  hasToken: boolean;
  anthropicModel: string;
  tokenPreview: string; // masked, e.g. "...a1b2"
}
