import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { generateOG, type OgInput } from "../../lib/og.ts";
import { ogSlugForPath } from "../../lib/og-path.ts";
import { severityLabels } from "../../vocabulary.ts";

interface OgPage extends OgInput {
  path: string;
}

export async function getStaticPaths(): Promise<
  { params: { path: string }; props: OgPage }[]
> {
  const rules = await getCollection("rules");
  // Pages are declared by URL path; the image slug derives from it through
  // the same helper Layout.astro uses, so head tags and route params agree.
  const pages: { urlPath: string; input: OgInput }[] = [
    ...rules.map((rule) => ({
      urlPath: `/rules/${rule.data.ruleId}`,
      input: {
        eyebrow: rule.data.ruleId,
        title: rule.data.title,
        badge: {
          label: severityLabels[rule.data.severity],
          severity: rule.data.severity,
        },
      } as OgInput,
    })),
    {
      urlPath: "/",
      input: {
        eyebrow: "a documentation-driven linter",
        title: "Deadheading is cutting the spent growth off a plant.",
      },
    },
    {
      urlPath: "/install",
      input: { eyebrow: "cli, bookmarklet, eslint", title: "Install" },
    },
    {
      urlPath: "/rules",
      input: {
        eyebrow: "grouped by where it lives",
        title: `All ${rules.length} rules`,
      },
    },
    {
      urlPath: "/404",
      input: { eyebrow: "no page at this address", title: "Not found" },
    },
  ];
  return pages.map(({ urlPath, input }) => {
    const slug = ogSlugForPath(urlPath);
    return { params: { path: slug }, props: { ...input, path: slug } };
  });
}

export const GET: APIRoute = async ({ props }) => {
  const page = props as OgPage;
  const { path: _omit, ...input } = page;
  const png = await generateOG(input);
  // `new Uint8Array(png)` copies into ArrayBuffer-backed storage: plain
  // `Buffer` (typed `Uint8Array<ArrayBufferLike>`) is not assignable to
  // `BodyInit` under the site's strict TS.
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
