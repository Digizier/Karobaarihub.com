"use client";

import { useState, useEffect } from "react";
import { Building2, Filter, RotateCcw } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { getProperties } from "@/lib/db";
import { Property } from "@/lib/types";

export default function PropertiesCatalogPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [type, setType] = useState<string>("");
  const [minMarla, setMinMarla] = useState<string>("");
  const [maxMarla, setMaxMarla] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProperties({
      type: type || undefined,
      minMarla: minMarla ? Number(minMarla) : undefined,
      maxMarla: maxMarla ? Number(maxMarla) : undefined,
      limit: 20,
    }).then((res) => {
      setProperties(res.properties);
      setLoading(false);
    });
  }, [type, minMarla, maxMarla]);

  const reset = () => {
    setType("");
    setMinMarla("");
    setMaxMarla("");
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-gray-200">
          <div>
            <h1 className="font-serif font-bold text-2xl text-karobaari-darkGray">
              All Real Estate Properties &amp; Plots
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified houses, commercial units, and residential plots in Rawalpindi &amp; Islamabad
            </p>
          </div>

          {/* Quick Filter Strip */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {["", "House", "Plot", "Commercial"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                  type === t ? "bg-karobaari-maroon text-white border-karobaari-maroon shadow-sm" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {t === "" ? "All Types" : t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-200 animate-pulse">
                <div className="aspect-[16/10] bg-gray-200 rounded-xl mb-4" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-karobaari-darkGray">No Properties Found</h3>
            <p className="text-xs text-gray-500 mb-4">Try clearing your filters or contact our advisor directly.</p>
            <button
              type="button"
              onClick={reset}
              className="bg-karobaari-maroon text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}