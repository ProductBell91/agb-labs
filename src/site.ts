// Who the site is about. Profiles feed the Person schema's sameAs (how Google ties this site to the person
// behind it) and the visible links in the footer and on /about/. Leave a URL empty to omit that profile;
// `listed: false` keeps it in the schema only.
export const person = {
  id: 'https://agb-labs.com/#adam',
  name: 'Adam Bell',
  legalName: 'Adam Guy Bell',
  jobTitle: 'Product Manager',
  city: 'Manchester',
};

export const profiles: { label: string; url: string; listed?: boolean }[] = [
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/adam-bell-05a84642' },
  { label: 'GitHub', url: 'https://github.com/ProductBell91' },
].filter((p) => p.url);

export const listedProfiles = profiles.filter((p) => p.listed !== false);
