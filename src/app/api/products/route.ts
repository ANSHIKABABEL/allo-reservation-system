import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const expiredReservations =
  await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lt: new Date(),
      },
    },
  });

for (const reservation of expiredReservations) {

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
      id: reservation.id,
    },
    data: {
      status: "RELEASED",
    },
  });
}
    const inventories = await prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    const formatted = inventories.map((item: { id: any; product: { name: any; }; warehouse: { name: any; }; totalUnits: number; reservedUnits: number; }) => ({
      inventoryId: item.id,

      productName: item.product.name,
      warehouseName: item.warehouse.name,

      totalUnits: item.totalUnits,
      reservedUnits: item.reservedUnits,

      availableUnits:
        item.totalUnits - item.reservedUnits,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}