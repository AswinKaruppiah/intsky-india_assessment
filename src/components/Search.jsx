import { useDebounce } from "../hooks/useDebounce";
import { useSearch } from "../hooks/useSearch";
import { useState } from "react";

export function Search() {
  const [query, setQuery] = useState("");
  const [select, setSelect] = useState(null);
  const debounce = useDebounce(query);
  const { data, loading, error } = useSearch(debounce);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(null);

  function onSelect(items) {
    setQuery(items.code);
    setSelect(items);
    setIsOpen(false);
  }

  function onClear() {
    setQuery("");
    setIsOpen(false);
  }

  function handleKeyDown(e) {
    const totalItems = data?.length ?? 0;

    switch (e.key) {
      case "ArrowUp": {
        e.preventDefault();
        if (!totalItems) return;

        setFocusedIndex((pre) => {
          if (pre === null) {
            return totalItems - 1;
          }
          return pre <= 0 ? pre : pre - 1;
        });
        break;
      }

      case "ArrowDown": {
        e.preventDefault();
        if (!totalItems) return;
        setFocusedIndex((pre) => {
          if (pre === null) {
            return 0;
          }
          return pre < totalItems - 1 ? pre + 1 : pre;
        });
        break;
      }

      case "Enter": {
        if (!totalItems) return;

        const selectedItem = data?.[focusedIndex];

        if (selectedItem) {
          onSelect(selectedItem);
        }
        e.target.blur();
        break;
      }

      case "Escape": {
        setIsOpen(false);
        setFocusedIndex(null);
        e.target.blur();
        break;
      }

      default:
        break;
    }
  }

  return (
    <div className="search-container">
      <div className="input-warpper">
        <label htmlFor="from">From</label>
        <input
          id="from"
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setFocusedIndex(null);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        {query.trim() !== "" && (
          <button className="clear-btn" onClick={() => onClear()}>
            X
          </button>
        )}
        <div className="result-dropdown-wapper">
          {isOpen && debounce.trim() !== "" && query.trim() !== "" && (
            <div className="result-dropdown">
              <DisplayDropdown
                data={data}
                loading={loading}
                error={error}
                query={query}
                onSelect={onSelect}
                select={select}
                focusedIndex={focusedIndex}
                setFocusedIndex={setFocusedIndex}
              />
            </div>
          )}
        </div>
      </div>

      {select && (
        <div className="selected-result">
          <pre>{JSON.stringify(select, "", 2)}</pre>
        </div>
      )}
    </div>
  );
}

function DisplayDropdown({
  data,
  loading,
  error,
  query,
  onSelect,
  select,
  focusedIndex,
  setFocusedIndex,
}) {
  if (loading)
    return (
      <div className="no-result">
        <h3>loading...</h3>
      </div>
    );

  if (error)
    return (
      <div className="no-result">
        <h3>{error}</h3>
      </div>
    );

  if (data?.length <= 0 && query?.trim() !== "")
    return (
      <div className="no-result">
        <h3>No airports match</h3>
      </div>
    );

  return (
    <ul>
      {data?.map((items, i) => {
        const isSelected = select?.code === items.code;
        const isFocused = focusedIndex === i;
        return (
          <li key={items.code} className="dropdown-item">
            <button
              className={`${isSelected ? "active" : ""} ${isFocused ? "focused" : ""}`}
              onClick={() => onSelect(items)}
              onMouseEnter={() => setFocusedIndex(i)}
            >
              <div>
                <h3>{items.code}</h3>
                <h3>{items.city}</h3>
                <h3>{items.country}</h3>
              </div>
              <h4>{items.name}</h4>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
