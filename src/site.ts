// Who the site is about. Profiles feed the Person schema's sameAs (how Google ties this site to the person
// behind it) and the visible links in the footer and on /about/. Leave a URL empty to omit that profile.
export const person = {
  id: 'https://agb-labs.com/#adam',
  name: 'Adam Bell',
  legalName: 'Adam Guy Bell',
  jobTitle: 'Product Manager',
  city: 'Manchester',
};

export const profiles: { label: string; url: string }[] = [
  { label: 'LinkedIn', url: '' },
].filter((p) => p.url);
