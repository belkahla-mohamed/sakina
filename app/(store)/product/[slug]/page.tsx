import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SITE } from "@/lib/config";
import { getProduct, getProducts } from "@/lib/catalog";
import { ProductView } from "@/components/product/ProductView";
import { PageSkeleton } from "@/components/PageSkeleton";

interface Params {
  params: Promise<{ slug: string }>;
}

function absoluteImage(image: string | null): string | undefined {
  if (!image) return undefined;
  return image.startsWith("http") ? image : `${SITE.url}${image}`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produit introuvable" };
  const url = `/product/${product.slug}`;
  const image = absoluteImage(product.image);
  return {
    title: product.name_fr,
    description: product.desc_fr,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${product.name_fr} — ${SITE.name}`,
      description: product.desc_fr,
      images: image ? [{ url: image, alt: product.name_fr }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name_fr} — ${SITE.name}`,
      description: product.desc_fr,
      images: image ? [image] : undefined,
    },
  };
}

async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProduct(slug), getProducts()]);

  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  const image = absoluteImage(product.image);
  const inStock = product.stock > 0 && product.badge !== "epuise";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name_fr,
    image: image ? [image] : undefined,
    description: product.desc_fr,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      url: `${SITE.url}/product/${product.slug}`,
      priceCurrency: "MAD",
      price: Number(product.price).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE.name },
    },
    ...(product.reviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating).toFixed(1),
            reviewCount: product.reviews,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <ProductView product={product} related={related} />
    </>
  );
}

export default function ProductPage({ params }: Params) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
