import { adminDb } from "@/lib/firebase/admin";
import { notFound, redirect } from "next/navigation";

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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