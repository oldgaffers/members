export function joinList(strings, sep, lastSep) {
  if (strings.length === 1) {
    return strings[0];
  }
  return strings.slice(0, -1).join(sep) + lastSep + strings.slice(-1);
}

export function namelist(value) {
  const lastNames = [...new Set(value.map((owner) => owner?.lastname))]?.filter((n) => n);
  const r = joinList(
    lastNames.map((ln) => {
      const fn = value.filter((o) => o?.lastname === ln)?.map((o) => o.firstname);
      const r = `${joinList(fn, ', ', ' & ')} ${ln}`;
      return r;
    }),
    ', ',
    ' & ',
  );
  return r;
}

export function ownerValueGetter({ value }) {
  if (!value) {
    return '';
  }
  const visible = value.filter((m) => m.GDPR);
  if (visible.length === 0) {
    return '(private)';
  }
  const names = namelist(visible);
  if (visible.length === value.length) {
    return names;
  }
  return `${names}, and other private owners`;
}

export function ownerList(row) {
  if (!row) {
    return '';
  }
  const names = namelist(row);
  return names;
}
