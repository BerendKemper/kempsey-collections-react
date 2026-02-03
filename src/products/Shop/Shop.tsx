import React, { useEffect, useState } from "react";
import { ShopCard } from "../ShopCard/ShopCard";
import type { ArtItem } from "../../types/art";
import "./Shop.css";
import MOCK_ITEMS from './MockItems.json';

export const Shop: React.FC = () => {
  const [items, setItems] = useState<ArtItem[]>([]);
  type Key = `date` | `price` | `title`;
  const [filters, setFilters] = useState({
    title: ``,
    artist: ``,
    minPrice: null as number | null,
    maxPrice: null as number | null,
    sortBy: `date` as Key,
  });

  useEffect(() => {
    fetch(`/api/arts`) // your Worker endpoint
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch arts`);
        return res.json();
      })
      .then((data: ArtItem[]) => setItems(data))
      // Simulate API fetch with mock data
      .catch(() => setItems(MOCK_ITEMS));
  }, []);

  // WRONG because it filters the cards that were returned from an API call.
  // INSTEAD must apply a filter in the API query
  // TEMPORARY WORKAROUND
  const filteredItems = items
    .filter(item =>
      item.title.toLowerCase().includes(filters.title.toLowerCase())
    )
    .filter(item =>
      filters.artist
        ? item.artist.toLowerCase().includes(filters.artist.toLowerCase())
        : true
    )
    .filter(item =>
      filters.minPrice !== null ? item.price >= filters.minPrice : true
    )
    .filter(item =>
      filters.maxPrice !== null ? item.price <= filters.maxPrice : true
    )
    .sort((a, b) => {
      if (filters.sortBy === `price`) return a.price - b.price;
      if (filters.sortBy === `title`)
        return a.title.localeCompare(b.title);
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });



  return (
    <div className="shop">
      <aside className="sidebar">
        <div className="filters">
          <h3>Filters</h3>

          <input
            placeholder="Title"
            value={filters.title}
            onChange={e =>
              setFilters({ ...filters, title: e.target.value })
            }
          />

          <input
            placeholder="Artist"
            value={filters.artist}
            onChange={e =>
              setFilters({ ...filters, artist: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Min price"
            onChange={e =>
              setFilters({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : null,
              })
            }
          />

          <input
            type="number"
            placeholder="Max price"
            onChange={e =>
              setFilters({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : null,
              })
            }
          />

          <select
            value={filters.sortBy}
            onChange={e =>
              setFilters({
                ...filters,
                sortBy: e.target.value as Key,
              })
            }
          >
            <option value="date">Newest</option>
            <option value="price">Price</option>
            <option value="title">Title</option>
          </select>
        </div>
      </aside>
      <section className="items">
        {filteredItems.map(item => (
          <ShopCard
            key={item.id} // React list key
            title={item.title} // map ArtItem → UI props
            artist={item.artist}
            price={item.price}
            imageUrl={`/api/images/${item.imageKey}`} // map imageKey → URL
          />
        ))}
      </section >
    </div>
  );
};
