"use client";

import { useEffect, useState } from "react";

type ReservationType = {
  id: string;

  quantity: number;

  status: string;

  expiresAt: string;

  inventoryId: string;
};

export default function ReservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const [reservation, setReservation] =
    useState<ReservationType | null>(
      null
    );

  const [timeLeft, setTimeLeft] =
    useState("");

  async function fetchReservation() {

    const { id } = await params;

    const response =
      await fetch("/api/reservations");

    const data =
      await response.json();

    const foundReservation =
      data.find(
        (item: ReservationType) =>
          item.id === id
      );

    setReservation(foundReservation);
  }

  async function confirmReservation() {

    if (!reservation) return;

    const response =
      await fetch(
        `/api/reservations/${reservation.id}/confirm`,
        {
          method: "POST",
        }
      );

    const data =
      await response.json();

    if (response.status === 410) {
      alert(data.error);
      return;
    }

   await fetchReservation();

alert("Purchase confirmed!");
  }

  async function cancelReservation() {

    if (!reservation) return;

    await fetch(
      `/api/reservations/${reservation.id}/release`,
      {
        method: "POST",
      }
    );

   await fetchReservation();

alert("Reservation cancelled");
  }

  useEffect(() => {

    fetchReservation();

  }, []);

  useEffect(() => {

    if (!reservation) return;

    const interval =
      setInterval(() => {

        const now =
          new Date().getTime();

        const expiry =
          new Date(
            reservation.expiresAt
          ).getTime();

        const difference =
          expiry - now;

        if (difference <= 0) {

          setTimeLeft("Expired");

          clearInterval(interval);

          return;
        }

        const minutes =
          Math.floor(
            difference / 1000 / 60
          );

        const seconds =
          Math.floor(
            (difference / 1000) % 60
          );

        setTimeLeft(
          `${minutes}m ${seconds}s`
        );

      }, 1000);

    return () =>
      clearInterval(interval);

  }, [reservation]);

  if (!reservation) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-950 flex items-center justify-center p-6">

    <div className="w-full max-w-3xl backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">

      <h1 className="text-4xl font-bold text-white mb-8">
        Reservation Details
      </h1>

      <div className="space-y-6">

        <div className="flex justify-between items-center">
          <span className="text-gray-300">
            Reservation ID
          </span>

          <span className="text-white text-sm">
            {reservation.id}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-300">
            Quantity
          </span>

          <span className="text-white font-semibold">
            {reservation.quantity}
          </span>
        </div>

        <div className="flex justify-between items-center">

          <span className="text-gray-300">
            Status
          </span>

          <span
            className={`px-4 py-1 rounded-full text-sm font-semibold
            ${
              reservation.status === "CONFIRMED"
                ? "bg-green-500/20 text-green-300"
                : reservation.status === "RELEASED"
                ? "bg-red-500/20 text-red-300"
                : "bg-yellow-500/20 text-yellow-300"
            }`}
          >
            {reservation.status}
          </span>

        </div>

        <div className="bg-white/5 rounded-2xl p-6 text-center">

          {
            reservation.status === "CONFIRMED"
            ? (
              <div>
                <p className="text-3xl mb-2">
                  ✅
                </p>

                <p className="text-green-400 text-xl font-semibold">
                  Purchase Confirmed
                </p>
              </div>
            )
            : reservation.status === "RELEASED"
            ? (
              <div>
                <p className="text-3xl mb-2">
                  ❌
                </p>

                <p className="text-red-400 text-xl font-semibold">
                  Reservation Released
                </p>
              </div>
            )
            : (
              <div>
                <p className="text-gray-400 mb-2">
                  Reservation expires in
                </p>

                <p className="text-5xl font-bold text-white tracking-wider">
                  {timeLeft}
                </p>
              </div>
            )
          }

        </div>

<div className="flex gap-4">

  <button
    onClick={confirmReservation}
    disabled={
      reservation.status !== "PENDING"
    }
    className={`flex-1 py-3 rounded-xl font-semibold transition
    ${
      reservation.status !== "PENDING"
        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-500 text-white hover:shadow-lg hover:shadow-green-500/30"
    }`}
  >
    {
      reservation.status === "CONFIRMED"
      ? "Purchase Confirmed"
      : "Confirm Purchase"
    }
  </button>

  <button
    onClick={cancelReservation}
    disabled={
      reservation.status !== "PENDING"
    }
    className={`flex-1 py-3 rounded-xl font-semibold transition
    ${
      reservation.status !== "PENDING"
        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
        : "bg-red-600 hover:bg-red-500 text-white hover:shadow-lg hover:shadow-red-500/30"
    }`}
  >
    {
      reservation.status === "RELEASED"
      ? "Reservation Released"
      : "Cancel"
    }
  </button>

</div>

      </div>

    </div>
  </div>
);
}