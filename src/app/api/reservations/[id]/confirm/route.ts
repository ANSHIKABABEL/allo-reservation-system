import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {

    const { id } =
      await context.params;

    // find reservation
    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id,
        },
      });

    // reservation not found
    if (!reservation) {
      return NextResponse.json(
        {
          error: "Reservation not found",
        },
        {
          status: 404,
        }
      );
    }

    // expired reservation
if (
  reservation.expiresAt < new Date()
) {

  // release stock
  await prisma.inventory.update({
    where: {
      id: reservation.inventoryId,
    },
    data: {
      reservedUnits: {
        decrement:
          reservation.quantity,
      },
    },
  });

  // update reservation
  await prisma.reservation.update({
    where: {
      id,
    },
    data: {
      status: "RELEASED",
    },
  });

  return NextResponse.json(
    {
      error: "Reservation expired",
    },
    {
      status: 410,
    }
  );
}

    // confirm reservation
    const updatedReservation =
      await prisma.reservation.update({
        where: {
          id,
        },
        data: {
          status: "CONFIRMED",
        },
      });

    return NextResponse.json(
      updatedReservation
    );

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        error: "Confirmation failed",
      },
      {
        status: 500,
      }
    );
  }
}