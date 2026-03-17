export interface AIUniversaReadinessItem {
  label: string;
  done: boolean;
  detail?: string;
  category?: string;
}

export const AI_UNIVERSA_READINESS_ITEMS: AIUniversaReadinessItem[] = [
  { label: 'Registration LP live', done: true, category: 'Tech' },
  { label: 'Survey page live', done: true, category: 'Tech' },
  { label: 'Confirmation page live', done: true, category: 'Tech' },
  { label: 'WhatsApp groups configured', done: true, detail: '50/50 links', category: 'Ops' },
  { label: 'GA4 deployed', done: true, category: 'Tech' },
  { label: 'Meta Pixel deployed', done: true, category: 'Tech' },
  { label: 'UTM tracking active', done: true, category: 'Marketing' },
  { label: 'Ad creatives approved', done: false, category: 'Marketing' },
  { label: 'Email sequences loaded in GHL', done: false, category: 'Content' },
  { label: 'Trailer video produced', done: false, category: 'Content' },
  { label: 'Real checkout links (Stripe)', done: false, category: 'Tech' },
  { label: 'VSL videos embedded', done: false, category: 'Content' },
  { label: 'YouTube Live setup', done: false, category: 'Ops' },
  { label: 'Offer page final review', done: false, category: 'Tech' },
  { label: 'Delovni Zvezki printed/ready', done: false, category: 'Content' },
];
