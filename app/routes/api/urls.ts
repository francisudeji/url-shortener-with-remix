import { json } from "remix";
import type { LoaderFunction } from "remix";
import { db } from "~/helpers";

export const loader: LoaderFunction = async () => {
  const urls = await db.url.findMany({});

  return json(urls);
};
