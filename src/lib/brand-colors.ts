export const getBrandColor = (client: string) => {
  const name = client.toLowerCase();
  if (name.includes('itaú') || name.includes('itau')) return '#ec7000';
  if (name.includes('santander')) return '#ec0000';
  if (name.includes('bradesco')) return '#cc092f';
  if (name.includes('banco do brasil')) return '#f8d117';
  return null;
};

export const getBrandStripClass = (client: string) => {
  const name = client.toLowerCase();
  if (name.includes('itaú') || name.includes('itau')) return 'bg-[#ec7000]';
  if (name.includes('santander')) return 'bg-[#ec0000]';
  if (name.includes('bradesco')) return 'bg-gradient-to-r from-[#cc092f] via-[#cc092f] to-white';
  if (name.includes('banco do brasil')) return 'bg-[#f8d117]';
  return 'bg-glass-border/30';
};
