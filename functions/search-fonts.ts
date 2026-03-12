export async function onRequest(context) {
  const { env } = context;

  // Check if the R2 bucket is bound
  if (!env.FONTS_BUCKET) {
    return new Response(JSON.stringify({ 
      data: [], 
      total: 0, 
      error: "FONTS_BUCKET is not bound in Cloudflare settings." 
    }), {
      headers: { "content-type": "application/json" }
    });
  }

  try {
    // List all objects in the R2 bucket
    const listed = await env.FONTS_BUCKET.list();
    const fontData = [];

    for (const object of listed.objects) {
      const key = object.key;
      
      // Only process font files
      if (key.match(/\.(ttf|otf|woff|woff2)$/i)) {
        const filename = key.split('/').pop() || key;
        const familyName = filename.replace(/\.(ttf|otf|woff|woff2)$/i, '').replace(/[-_]/g, ' ');

        fontData.push({
          family: familyName,
          styles: [
            {
              name: `${familyName} Regular`,
              style: "regular",
              url: `/fonts/${key.split('/').map(encodeURIComponent).join('/')}`
            }
          ]
        });
      }
    }

    return new Response(JSON.stringify({
      data: fontData,
      total: fontData.length
    }), {
      headers: { "content-type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      data: [], 
      total: 0, 
      error: String(error) 
    }), {
      headers: { "content-type": "application/json" }
    });
  }
}
