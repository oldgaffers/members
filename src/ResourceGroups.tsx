import { useState, useEffect, useRef, useCallback } from 'react';

type Item = {
  id: string
  name: string
}

type ResourceGroupsProps = {
  items: Item[]
  onChange: Function
}

export function ResourceGroups({ items, onChange }: ResourceGroupsProps) {
  const initialSelectedValue = items && items.length > 0 ? items[0].id : '';
  const [selectedValue, setSelectedValue] = useState(initialSelectedValue);
  const selectRef = useRef(null);

  const doOnChange = useCallback((item: Item | undefined) => {
    const args = { selected: item };
    if (onChange) {
      onChange(args);
    }
  }, [onChange]); // Dependency on onChange

  useEffect(() => {
    if (items && items.length > 0 && selectedValue === '') {
      const firstItemId = items[0].id;
      setSelectedValue(firstItemId);
      doOnChange(items[0]);
    }
  }, [items, selectedValue, doOnChange]); // Include doOnChange in the dependencies

  const find = (id: string) => (items ? items.find((item) => item.id === id): undefined);

  const change = (ev: { target: { value: any; }; }) => {
    const { value } = ev.target;
    setSelectedValue(value);
    const item = find(value);
    doOnChange(item);
  };

  return (
    <span>
      Group: &nbsp;
      <select onChange={change} ref={selectRef} value={selectedValue}>
        {items.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
    </span>
  );
}
