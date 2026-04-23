import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

type PageDoc = {
  id: string;
  title: string;
  html: string;
  slug: string;
};

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate static params for all published pages
export async function generateStaticParams() {
  try {
    const snapshot = await getDocs(
      query(collection(db, "pages"), where("published", "==", true)),
    );
    return snapshot.docs.map((doc) => ({
      slug: String(doc.data().slug ?? ""),
    }));
  } catch (err) {
    console.error("Error generating static params:", err);
    return [];
  }
}

// Generate metadata for each page
export async function generateMetadata(props: Props): Promise<Metadata> {
  try {
    const params = await props.params;
    const snapshot = await getDocs(
      query(
        collection(db, "pages"),
        where("slug", "==", params.slug),
        where("published", "==", true),
      ),
    );

    if (snapshot.empty) {
      return {
        title: "Page not found",
      };
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    const title = String(data.title ?? "");

    return {
      title: `${title} | TVD GLOBAL LIMITED`,
      description: `Read about ${title}`,
    };
  } catch (err) {
    console.error("Error generating metadata:", err);
    return {
      title: "TVD GLOBAL LIMITED",
    };
  }
}

async function fetchPage(slug: string): Promise<PageDoc | null> {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "pages"),
        where("slug", "==", slug),
        where("published", "==", true),
      ),
    );

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      title: String(data.title ?? ""),
      slug: String(data.slug ?? ""),
      html: String(data.html ?? ""),
    };
  } catch (err) {
    console.error("Error fetching page:", err);
    return null;
  }
}

export default async function PageBySlug(props: Props) {
  const params = await props.params;
  const page = await fetchPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold">{page.title}</h1>
      </header>
      <article
        className="sun-editor-editable readable-content"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </main>
  );
}
