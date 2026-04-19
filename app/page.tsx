import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/recipes";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 md:max-w-3xl md:flex-row md:items-center">
      {categories.map((category, index) => (
        <Link
          key={category.slug}
          href={`/${category.slug}`}
          aria-label={category.name}
          className="relative aspect-square flex-1 transition-transform hover:scale-[1.02] active:scale-[0.99]"
        >
          {category.image && (
            <Image
              src={category.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 400px"
              className="object-contain"
              priority={index === 0}
            />
          )}
        </Link>
      ))}
    </main>
  );
}
