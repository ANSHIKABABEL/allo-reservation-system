"use client";

import { useEffect, useState } from "react";

type ProductType = {
  inventoryId: string;
  productName: string;
  warehouseName: string;

  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
};

export default function HomePage() {

  const [products, setProducts] =
    useState<ProductType[]>([]);

  const [loading, setLoading] =
    useState(true);
    const [reservingId, setReservingId] =
  useState("");

  async function fetchProducts() {

    try {

      const response =
        await fetch("/api/products");

      const data =
        await response.json();

      setProducts(data);

    } catch (error) {

      console.log(error);

    } finally {
setReservingId("");
      setLoading(false);
    }
  }

  async function reserveItem(
    inventoryId: string
  ) {
setReservingId(inventoryId);
    try {

      const response =
        await fetch("/api/reservations", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            inventoryId,
            quantity: 1,
          }),
        });

      const data =
        await response.json();

      // stock unavailable
      if (response.status === 409) {
        alert(data.error);
        return;
      }
window.location.href =
  `/reservation/${data.reservation.id}`;

    } catch (error) {

      console.log(error);

      alert("Reservation failed");
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950 p-10">
    

    <div className="flex justify-between items-center mb-10">

  <div>

    <h1 className="text-5xl font-bold text-white">
      Allo
    </h1>

    <p className="text-gray-400">
      Inventory Reservation Platform
    </p>

  </div>

  <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-gray-300">
    Multi Warehouse
  </div>

</div>

    <div className="max-w-6xl mx-auto">

      <div className="grid md:grid-cols-2 gap-6">

        {products.map((item) => (

          <div
            key={item.inventoryId}
            className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-6 transition hover:scale-[1.02] hover:bg-white/15"
          >

            <div className="flex justify-between items-start">

              <div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  {item.productName}
                </h2>

                <p className="text-gray-300">
                  📦 {item.warehouseName}
                </p>

              </div>

              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold
                ${
                  item.availableUnits > 3
                    ? "bg-green-500/20 text-green-300"
                    : item.availableUnits > 0
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {item.availableUnits > 3
                  ? "In Stock"
                  : item.availableUnits > 0
                  ? "Low Stock"
                  : "Out of Stock"}
              </div>

            </div>

            <div className="mt-6 space-y-2">

              <div className="flex justify-between text-gray-300">
                <span>Total Units</span>
                <span>{item.totalUnits}</span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Reserved Units</span>
                <span>{item.reservedUnits}</span>
              </div>

              <div className="flex justify-between text-white font-semibold text-lg">
                <span>Available</span>
                <span>{item.availableUnits}</span>
              </div>

            </div>

            <button
              onClick={() =>
                reserveItem(item.inventoryId)
              }
              disabled={item.availableUnits === 0}
              className={`w-full mt-6 py-3 rounded-xl font-semibold transition
              ${
                item.availableUnits === 0
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white hover:shadow-lg hover:shadow-blue-500/30"
              }`}
            >
              {item.availableUnits === 0
                ? "Out of Stock"
                : reservingId === item.inventoryId
  ? "Reserving..."
  : "Reserve Now"}
            </button>

          </div>
        ))}

      </div>

    </div>
  </div>
);
}