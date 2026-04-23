import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return Response.json({ error: "Slug required" }, { status: 400 });
    }

    const snapshot = await getDocs(
      query(
        collection(db, "pages"),
        where("slug", "==", slug),
        where("published", "==", true),
      ),
    );

    if (snapshot.empty) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return Response.json({
      id: doc.id,
      title: String(data.title ?? ""),
      slug: String(data.slug ?? ""),
      html: String(data.html ?? ""),
    });
  } catch (err) {
    console.error("Error fetching page:", err);
    return Response.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}
