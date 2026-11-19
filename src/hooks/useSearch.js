import { useState, useEffect } from "react";

export function useSearch(inputValue) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function searchAirport(text) {
    setError(null);
    try {
      setLoading(true);
      let result = await fetch("/data/airports.json");
      result = await result.json();
      result = result.filter((item) => {
        const search = text.toLowerCase().trim();

        return (
          item.code.toLowerCase().includes(search) ||
          item.city.toLowerCase().includes(search)
        );
      });
      setData(result.slice(0, 5));
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (inputValue.trim() === "") return setData(null);
    searchAirport(inputValue);
  }, [inputValue]);

  return { data, loading, error };
}
