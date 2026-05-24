import "./globals.css";

export const metadata = {
  title: "Inventory Reservation System",
  description: "Allo Engineering Assignment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}