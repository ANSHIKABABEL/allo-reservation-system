import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {

  try {

    const reservations =
      await prisma.reservation.findMany();

    return NextResponse.json(
      reservations
    );

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        error:
          "Failed to fetch reservations",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      inventoryId,
      quantity,
    } = body;

    const result =
      await prisma.$transaction(async (tx) => {

        // Find inventory
        const inventory =
          await tx.inventory.findUnique({
            where: {
              id: inventoryId,
            },
          });

        if (!inventory) {
          throw new Error("Inventory not found");
        }

        const availableUnits =
          inventory.totalUnits -
          inventory.reservedUnits;

        // Not enough stock
        if (availableUnits < quantity) {
          return {
            error: "Not enough stock",
            status: 409,
          };
        }

        // Update reserved stock
        await tx.inventory.update({
          where: {
            id: inventoryId,
          },
          data: {
            reservedUnits: {
              increment: quantity,
            },
          },
        });

        // Create reservation
        const reservation =
          await tx.reservation.create({
            data: {
              id: crypto.randomUUID(),

              inventoryId,
              quantity,

              status: "PENDING",

              expiresAt: new Date(
                Date.now() + 10 * 60 * 1000
              ),
            },
          });

        return {
          reservation,
          status: 200,
        };
      });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Reservation failed" },
      { status: 500 }
    );
  }
}