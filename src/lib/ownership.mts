import { Member } from "./membership.mts";

export function joinList(strings: any[], sep: string, lastSep: string) {
  if (strings.length === 1) {
    return strings[0];
  }
  return strings.slice(0, -1).join(sep) + lastSep + strings.slice(-1);
}

export function namelist(value: any[]) {
  const lastNames = [...new Set(value.map((owner: { lastname: any; }) => owner?.lastname))]?.filter((n) => n);
  const r = joinList(
    lastNames.map((ln) => {
      const fn = value.filter((o: { lastname: unknown; }) => o?.lastname === ln)?.map((o: { firstname: any; }) => o.firstname);
      const r = `${joinList(fn, ', ', ' & ')} ${ln}`;
      return r;
    }),
    ', ',
    ' & ',
  );
  return r;
}

export function ownerValueGetter({ value }: { value: Member[] }) {
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

export function ownerList(row: any[]) {
  if (!row) {
    return '';
  }
  const names = namelist(row);
  return names;
}
