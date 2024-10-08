import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Member } from './lib/membership.mts';
import { Boat } from './lib/api.mts';
import { phoneGetter } from './lib/utils.mts';
import { Key } from 'react';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    paddingLeft: 10,
  },
  table: {
    width: '100%',
  },
  row: {
    fontSize: 10,
    display: 'flex',
    flexDirection: 'row',
    borderTop: '1px solid #EEE',
    paddingTop: 8,
    paddingBottom: 8,
  },
  header: {
    borderTop: 'none',
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  col1: {
    width: '20%',
  },
  col2: {
    width: '14%',
  },
  col3: {
    width: '16%',
  },
  col4: {
    width: '16%',
  },
  col5: {
    width: '20%',
  },
  col6: {
    width: '14%',
  },
});

function boatGetter(row: Member, boats: Boat[]) {
  const { id } = row;
  const theirBoats = boats.filter((b) => b.owners?.find((o) => o?.id === id));
  return theirBoats.map((b) => b.name).sort().join(', ');
}

function chunkify(a: Array<any>, n: number) {
  return [...Array(Math.ceil(a.length / n)).keys()].map((i) => i * n).map((i) => a.slice(i, i + n));
}

// Create Document Component
export function MembersListDoc({members, boats}: { members: Member[], boats: Boat[]}) {
  const sorted = [...members];
  sorted.sort((a, b) => a.lastname.localeCompare(b.lastname) );
  const chunked = chunkify(sorted, 20);
  return (<Document>
    {chunked.map((chunk: Member[], i: number) =>(
    <Page size="A4" style={styles.page} key={i}>
      <View style={[styles.row, styles.bold, styles.header]}>
        <Text style={styles.col1}>Name</Text>
        <Text style={styles.col2}>No.</Text>
        <Text style={styles.col3}>Telephone</Text>
        <Text style={styles.col4}>Town</Text>
        <Text style={styles.col5}>Boat Name</Text>
        <Text style={styles.col6}>Area</Text>
      </View>
      {chunk.map((row: Member, i: number) => {
        return (<View key={i} style={styles.row} wrap={false}>
          <Text style={styles.col1}>{row.lastname}{'\n'}{row.salutation} {row.firstname}</Text>
          <Text style={styles.col2}>{row.member}</Text>
          <Text style={styles.col3}>{phoneGetter({row})}</Text>
          <Text style={styles.col4}>{row.town}</Text>
          <Text style={[styles.col5,styles.italic]}>{boatGetter(row, boats)}</Text>
          <Text style={styles.col6}>{row.area}</Text>
        </View>);
      })}
    </Page>
    ))}
  </Document>);
}
