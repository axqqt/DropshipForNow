"use client";
import { useState } from 'react';
import SearchForm from './Components/SearchForm';
import ProductList from './Components/ProductList';
import { saveAs } from 'file-saver';
import { exportToShopifyCsv } from '@/lib/csvExporter';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status,setStatus] = useState("")

  const handleSearch = async (searchTerms) => {
    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm: searchTerms }),
      });
      if(response.status===400){
        setStatus("Ack! We were unable to find results for your prompt :(")
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setLoading(false);
  };

  const handleExport = () => {
    // Convert products array to CSV
    const csv = exportToShopifyCsv(products);

    // Create a Blob from the CSV string
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Trigger the download using file-saver
    saveAs(blob, 'products.csv');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AliExpress Product Finder</h1>
      <SearchForm onSearch={handleSearch} />
      {loading ? (
        <p>Searching for winning products...</p>
      ) : (
        <ProductList products={products} onExport={handleExport} />
      )}
      <h1>{status}</h1>
    </div>
  );
}
