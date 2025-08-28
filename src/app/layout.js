import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Swaranusa - Transform Citizen Complaints into Professional Documents with AI",
  description: "Convert raw citizen complaints into professional, blockchain-verified documents using AI. Empower democratic participation with tamper-proof documentation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
