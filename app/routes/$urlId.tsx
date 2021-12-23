import { json, redirect, useLoaderData } from "remix";
import type { LoaderFunction } from "remix";
import { db } from "~/helpers";

export const loader: LoaderFunction = async ({params}) => {
  const {urlId} = params

  const url = await db.url.findUnique({where: { url_id: urlId }})
  console.log(url)

  if (!url) {
    return json(urlId, { status: 404, statusText: 'NOT_FOUND' })
  }

  return redirect(url.original_url)
}

export default function UrlId() {
  const data = useLoaderData()

  console.log(data);
  
  return(
    <main>
      <h1>Something went wrong!</h1>
      
      <p>The link you've entered is invalid 😔</p>
    </main>
  )
}
