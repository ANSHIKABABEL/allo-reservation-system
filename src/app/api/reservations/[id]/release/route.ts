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

    const result =
      await prisma.$transaction(async (tx) => {

        // find reservation
        const reservation =
          await tx.reservation.findUnique({
            where: {
              id,
            },
          });

        if (!reservation) {
          return {
            error: "Reservation not found",
            status: 404,
          };
        }

        // already released
        if (
          reservation.status === "RELEASED"
        ) {
          return {
            error:
              "Reservation already released",
            status: 400,
          };
        }

        // decrease reserved stock
        await tx.inventory.update({
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

        // update reservation status
        const updatedReservation =
          await tx.reservation.update({
            where: {
              id,
            },
            data: {
              status: "RELEASED",
            },
          });

        return {
          updatedReservation,
          status: 200,
        };
      });

    if ("error" in result) {
      return NextResponse.json(
        {
          error: result.error,
        },
        {
          status: result.status,
        }
      );
    }

    return NextResponse.json(result);

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        error: "Release failed",
      },
      {
        status: 500,
      }
    );
  }
}