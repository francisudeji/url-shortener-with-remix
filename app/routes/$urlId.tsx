import { json, Link, redirect } from "remix";
import type { LoaderFunction, MetaFunction } from "remix";
import { db } from "~/helpers";

export const meta: MetaFunction = () => {
  return {
    title: "404 - Page Not Found | URL Shortener",
    description: "Page Not Found",
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const { urlId } = params;

  const url = await db.url.findUnique({ where: { url_id: urlId } });

  if (!url) {
    return json(urlId, { status: 404 });
  }

  return redirect(url.original_url);
};

export default function UrlId() {
  return (
    <main className="flex flex-col items-center justify-center h-screen container mx-auto max-w-lg px-4 space-y-4">
      <h1 className="text-2xl text-gray-900">Something went wrong!</h1>

      <p className="text-center py-2">
        The link you're looking for does not exist 😔
      </p>
      <Link
        to="/"
        className="text-blue-500 text-center hover:underline focus:underline"
      >
        Create a short link
      </Link>
    </main>
  );
}
