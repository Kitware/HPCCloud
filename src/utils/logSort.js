export default function logSort(entryA, entryB) {
  return Date.parse(entryA.created) < Date.parse(entryB.created);
}
