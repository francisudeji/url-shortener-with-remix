import { useState } from "react";
import { Form, json, useActionData, useTransition } from "remix";
import type { ActionFunction } from "remix";
import { db, getUrlId } from "~/helpers";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = formData.get("url");

  if (typeof url !== "string") {
    return json(
      { url, error: true, message: "Invalid request, try again!" },
      { status: 400 }
    );
  }

  if (!url.trim().length) {
    return json(
      { url: url.trim(), error: true, message: "😤 url cannot be blank" },
      { status: 400 }
    );
  }

  const regex = new RegExp(
    /^(?:(http|https|ftp|ftps)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
  );
  const isValidUrl = regex.test(url);

  if (!isValidUrl) {
    return json(
      {
        url: url.trim(),
        error: true,
        message: "The url you provided is invalid",
      },
      { status: 400 }
    );
  }

  const modifiedUrl = url.includes("http", 0) ? url : `https://${url}`;

  const shortenedUrl = await db.url.findUnique({
    where: { original_url: modifiedUrl },
  });

  if (shortenedUrl) {
    const { new_url, original_url } = shortenedUrl;
    return json(
      { url: new_url, original_url, error: false, message: "OK" },
      { status: 200 }
    );
  }

  try {
    const urlId = getUrlId();
    const data = await db.url.create({
      data: {
        new_url: `${request.url}${urlId}`,
        original_url: modifiedUrl,
        url_id: urlId,
      },
    });

    const { new_url, original_url } = data;

    return json(
      { url: new_url, original_url, error: false, message: "OK" },
      { status: 201 }
    );
  } catch (err: unknown) {
    return json(
      { url, error: true, message: "Something went wrong" },
      { status: 400 }
    );
  }
};

export default function Index() {
  const [copied, setCopied] = useState(false);
  const data = useActionData();
  const transition = useTransition();

  async function copyToClipboard() {
    const text = data?.url || "";
    await navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => console.error(err));
  }

  return (
    <div className="container mx-auto max-w-lg px-4 h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl text-gray-900">URL Shortener with Remix</h1>
      <Form method="post" className="w-full">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0 md:space-x-2">
          <input
            type="text"
            name="url"
            autoComplete="off"
            autoCapitalize="off"
            placeholder="https://examplewebsite.domain"
            defaultValue={data?.url}
            aria-invalid={Boolean(data?.url) || undefined}
            aria-describedby={data?.url ? "error" : undefined}
            className="px-2 w-full rounded-md h-12 border border-grey-50 focus:outline-none focus:ring focus:ring-1 focus:ring-blue-500  active:outline-none active:ring active:ring-1 active:ring-blue-500"
          />
          <button
            className="h-12 px-4 text-white uppercase text-sm tracking-wide bg-blue-500 flex-shrink-0 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 active:outline-none active:ring active:ring-1 active:ring-blue-500 active:ring-offset-2"
            type="submit"
          >
            {transition.state === "submitting" ? "Please wait..." : "Shorten"}
          </button>
        </div>
      </Form>
      {data?.error ? (
        <div className="bg-red-500 text-white w-full text-center py-2 rounded-md">
          {data?.message}
        </div>
      ) : null}
      {data?.message === "OK" ? (
        <div className="w-full text-sm flex flex-col bg-white border border-gray-50 rounded-md p-2 md:flex-row md:justify-between md:items-center">
          <div className="flex flex-col space-y-1">
            <span className="text-gray-900">{data?.original_url}</span>
            <a href={data?.url} target="_blank" className="text-blue-500">
              {data?.url}
            </a>
          </div>
          <button
            className={`${
              copied ? "bg-green-500" : "bg-gray-500"
            } block text-sm text-white p-2 mt-2 rounded-md md:inline-block md:mt-0`}
            onClick={copyToClipboard}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
