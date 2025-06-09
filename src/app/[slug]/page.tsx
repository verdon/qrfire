"use client";

import { useEffect } from "react";
import { useParams, notFound, redirect } from "next/navigation";
import { db } from "@/lib/firebase/browser";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export default function SlugPage() {
  const params = useParams();
  const { slug } = params;

  useEffect(() => {
    const fetchUrlAndRedirect = async () => {
      if (typeof slug !== "string") {
        return;
      }

      const qrCodeQuery = query(
        collection(db, "qr_codes"),
        where("slug", "==", slug),
        limit(1)
      );

      const qrCodeQuerySnapshot = await getDocs(qrCodeQuery);

      if (qrCodeQuerySnapshot.empty) {
        notFound();
      } else {
        const qrCodeDoc = qrCodeQuerySnapshot.docs[0];
        const { url } = qrCodeDoc.data();

        if (url) {
          redirect(url);
        } else {
          notFound();
        }
      }
    };

    fetchUrlAndRedirect();
  }, [slug]);

  return null;
} 