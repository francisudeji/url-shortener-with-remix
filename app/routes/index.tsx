import * as React from 'react';
import { Form, json, useActionData, useTransition,  } from "remix";
import type { ActionFunction, MetaFunction } from "remix";
import { db, getUrlId } from "~/helpers";


export const meta: MetaFunction = () => {
  return {
    title: "URL Shortener",
    description: "Shorten and share links"
  };
};


export const action: ActionFunction = async ({request}) => {
  const formData = await request.formData();
  const url = formData.get('url')

  console.log(url)

  if (typeof url !== 'string') {
    return json({ url, message: 'Invalid request, try again!' }, { status: 400 })
  }

  if (!url.trim().length) {
    return json({ url: url.trim(), message: '😤 url cannot be blank' }, { status: 400 })
  }

  const regex = new RegExp(/^(?:(http|https|ftp|ftps)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/);
  const isValidUrl = regex.test(url);

  if (!isValidUrl) {
    return json({ url: url.trim(), message: 'The url you provided is invalid'}, { status: 400 })
  }

  const modifiedUrl = url.includes('http', 0) ? url : `https://${url}`

  const shortenedUrl = await db.url.findUnique({where: { original_url: modifiedUrl }})

  if (shortenedUrl) {
    const { new_url, original_url } = shortenedUrl
    return json({url: new_url, original_url, message: 'OK' }, { status: 200 })
  }

  try {
    const urlId = getUrlId();
    const data = await db.url.create({
      data: { 
        new_url: `${request.url}${urlId}`, 
        original_url: modifiedUrl, 
        url_id: urlId 
      }
    })

    const { new_url, original_url } = data;


    return json({url: new_url, original_url, message: 'OK' }, { status: 201 })
  } catch(err: unknown) {
    return json({url, message: 'Something went wrong' }, { status: 400 })
  }
}

export default function Index() {
  const [copied, setCopied] = React.useState(false)
  const data = useActionData()
  const transition = useTransition()
  console.log(data?.url)

  async function copyToClipboard() {
    const text = data?.url || ""
    await navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false),1500)
    }).catch()
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Form method="post" >
        <div>
          <input 
            type="text" 
            name="url" 
            autoComplete="off" 
            placeholder="https://linktoyourwebsite.com"
            defaultValue={data?.url}
            aria-invalid={Boolean(data?.url) ||undefined}
            aria-describedby={data?.url ? "error" : undefined}
            />
          <button type="submit">
            {transition.state === "submitting" ? "Please wait..." : "Shorten"}
          </button>
          { data?.message !== 'OK' ? (<p>{data?.message}</p>) : <div>
            <p>{data?.url}</p>
            <button onClick={copyToClipboard}>{copied ? "Copied" : "Copy" }</button>
          </div> }
        </div>
      </Form>
    </div>
  );
}
