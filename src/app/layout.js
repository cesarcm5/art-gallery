import { Cormorant_Garamond, Jost, Fraunces, Space_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Intro from "@/components/Intro";
import { StageProvider } from "@/components/gallery3d/StageContext";
import GalleryStage from "@/components/gallery3d/GalleryStage";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const jost = Jost({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
  variable: "--font-jost",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-fraunces",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata = {
  title: "Galleria — A Study in Masterworks",
  description:
    "An editorial slideshow of fifteen masterworks. Built with React, GSAP, Lenis and Framer Motion.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${jost.variable} ${fraunces.variable} ${spaceMono.variable} antialiased`}
      >
        <Intro />
        <StageProvider>
          {/* One room, shared by both routes, so the camera can fly between
              the profile preview and the slideshow instead of cutting. */}
          <GalleryStage />
          <SmoothScroll>{children}</SmoothScroll>
        </StageProvider>
      </body>
    </html>
  );
}
