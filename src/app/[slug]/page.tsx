import { adminDb } from "@/lib/firebase/admin";
import { notFound, redirect } from "next/navigation";

interface SlugPageProps {
  params: {
    slug: string;
  };
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = params;

  const qrCodeQuery = await adminDb
    .collection("qr_codes")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (qrCodeQuery.empty) {
    notFound();
  }

  const qrCodeDoc = qrCodeQuery.docs[0];
  const { url } = qrCodeDoc.data();

  if (url) {
    redirect(url);
  } else {
    notFound();
  }
} 