export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ManifestoContent {
  headline: string;
  subtext: string;
  tagline: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export type ViewState = 'HOME' | 'LOOKBOOK' | 'NEW_ARRIVALS' | 'ABOUT';