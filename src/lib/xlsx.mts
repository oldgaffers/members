import * as jsonrawtoxlsx from 'jsonrawtoxlsx';
import { Boat } from './api.mts';
import { ownerList } from './ownership.mts';

function format_boat(b: Boat) {
    const { name, oga_no, owners, home_port } = b;
    return { Boat: name, 'No.': oga_no, Owner: ownerList(owners), 'Home Port': home_port };
}

export function boats2xlsx(boats: Boat[]) {
    const sorted = boats.map((b) => format_boat(b));
    sorted.sort((a, b) => a.Boat.localeCompare(b.Boat))
    return jsonrawtoxlsx(sorted);
}

export function members2xlsx(boats: Boat[]) {
    console.log(boats);
    return jsonrawtoxlsx(boats);
}

