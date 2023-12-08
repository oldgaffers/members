import { Boat } from "./api.mts";
import { Member } from "./membership.mts";

export default function membersBoats(boats: Boat[] = [], members: Member[] = []) {
  return boats.filter((b) => b.owners?.length > 0).map((b) => {
    const owners = b.owners.map((o) => members.find((m) => m.id === o && o)).filter((o) => o);
    return { ...b, owners, id: b.oga_no };
  }).filter((b) => b.owners.length > 0);
}
