import type { Metadata } from "next";

// Khởi tạo một fetcher tuân chuẩn Next.js fetch API để lấy dữ liệu SSR
async function getAuction(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/api/auctions/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const auction = await getAuction(id);

  if (!auction) {
    return {
      title: "Auction Not Found | GALLERY X",
    };
  }

  return {
    title: `${auction.title} | GALLERY X`,
    description: auction.description.substring(0, 150) + "...",
    openGraph: {
      title: auction.title,
      description: auction.description.substring(0, 150) + "...",
      images: [auction.images[0]],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: auction.title,
      description: auction.description.substring(0, 150) + "...",
      images: [auction.images[0]],
    }
  };
}

export default function AuctionDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
