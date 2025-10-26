import { Boat } from "./boatregister-api.mts";
import { Member } from "./membership.mts";

export default function membersBoats(boats: Boat[] = [], members: Member[] = []): Boat[] {
  return boats.filter((b) => b.owners?.length > 0).map((b) => {
    const owners = b.owners.map((o) => members.find((m) => m.id === o && o)).filter((o) => o);
    return { ...b, owners };
  }).filter((b) => b.owners.length > 0);
}
