import Image from "next/image";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { users } from "@/lib/recipes";
import Breadcrumb from "@/app/components/Breadcrumb";

export default async function Home() {
  const convexUsers = await fetchQuery(api.users.list, {});
  const convexUserBySlug = new Map(
    convexUsers.map((u) => [u.name.split(" ")[0].toLowerCase(), u]),
  );

  return (
    <>
    <Breadcrumb items={[{ label: "home" }]} />
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-6 md:max-w-5xl">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {users.map((user, index) => {
          const convexUser = convexUserBySlug.get(user.slug);
          const imageSrc = convexUser?.imageUrl ?? user.image;
          const label = (convexUser?.name ?? user.name)
            .split(" ")[0]
            .toLowerCase();

          if (!convexUser) return null;

          return (
            <Link
              key={user.slug}
              href={`/${convexUser._id}/recipes`}
              aria-label={label}
              className="flex flex-col items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.99]"
            >
              <div className="relative aspect-square w-[70%]">
                {imageSrc && (
                  <Image
                    src={imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 240px"
                    className="object-contain"
                    priority={index === 0}
                  />
                )}
              </div>
              <span
                className="line-clamp-2 text-center text-base sm:text-lg"
                style={{
                  fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
    </>
  );
}
