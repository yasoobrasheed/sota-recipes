import Image from "next/image";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { categories } from "@/lib/recipes";

export default async function Home() {
  const users = await fetchQuery(api.users.list, {});
  const userBySlug = new Map(
    users.map((u) => [u.name.split(" ")[0].toLowerCase(), u]),
  );

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 md:max-w-3xl md:flex-row md:items-center">
      {categories.map((category, index) => {
        const user = userBySlug.get(category.slug);
        const imageSrc = user?.imageUrl ?? category.image;
        const label = (user?.name ?? category.name).split(" ")[0].toLowerCase();

        return (
          <Link
            key={category.slug}
            href={`/${category.slug}`}
            aria-label={label}
            className="flex flex-1 flex-col items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.99]"
          >
            <div className="relative aspect-square w-full">
              {imageSrc && (
                <Image
                  src={imageSrc}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 400px"
                  className="object-contain"
                  priority={index === 0}
                />
              )}
            </div>
            <span
              className="text-center text-base sm:text-lg"
              style={{
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </main>
  );
}
