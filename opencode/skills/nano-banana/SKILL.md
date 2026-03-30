---
name: nano-banana
description: Generate or edit images with Gemini 3.1 Flash Image via the Yunwu proxy. Read the prompt from stdin and return raw JSON with base64 image data.
---

## Nano Banana

This skill provides a small Bun CLI for Gemini image generation and image editing through Yunwu.

The bundled script reads the prompt from `stdin`, sends a request to `gemini-3.1-flash-image-preview`, and writes the raw API JSON response to `stdout`.

Ensure `YUNWU_API_KEY` is available in the environment before running it.

## Script

`<skill-base>/generate.ts`

## Usage

Text to image:

```bash
printf 'A studio product photo of a nano banana dessert on dark stone\n' | bun run <skill-base>/generate.ts > result.json
```

Image editing with one input image:

```bash
printf 'Add a small llama beside the person and keep the lighting natural\n' | bun run <skill-base>/generate.ts --image ./photo.jpg > result.json
```

Multiple image inputs for style reference or composition:

```bash
printf 'Create a poster that blends the colors of the first image with the composition of the second\n' | bun run <skill-base>/generate.ts --image ./style-a.png --image ./style-b.png > result.json
```

Control output size and aspect ratio:

```bash
printf 'A clean modern weather infographic for Shanghai\n' | bun run <skill-base>/generate.ts --resolution 2K --aspect-ratio 16:9 > result.json
```

## Options

- `--image <path>`: add an input image. Repeatable. Maximum 14 images.
- `--resolution <size>`: one of `512`, `1K`, `2K`, `4K`. Default is `1K`.
- `--aspect-ratio <ratio>`: one of `1:1`, `1:4`, `1:8`, `2:3`, `3:2`, `3:4`, `4:1`, `4:3`, `4:5`, `5:4`, `8:1`, `9:16`, `16:9`, `21:9`. Default is `1:1`.
- `--help`: print usage.

Each input image must be `4 MB` or smaller. The script returns an error JSON object if any image is too large.

## Result Handling

The response is raw JSON. Image bytes are typically returned in:

```text
.candidates[0].content.parts[].inlineData.data
```

Check whether the call returned an image:

```bash
jq '.candidates[0].content.parts | map(select(.inlineData != null)) | length' result.json
```

Check the returned MIME type:

```bash
jq -r '.candidates[0].content.parts[] | select(.inlineData != null) | .inlineData.mimeType' result.json
```

Extract the first returned image bytes with `jq` and `base64`:

```bash
jq -r '.candidates[0].content.parts[] | select(.inlineData != null) | .inlineData.data' result.json | base64 -d > output.bin
```

Extract the first returned image with Bun when `jq` is unavailable:

```bash
bun -e 'const payload = JSON.parse(await Bun.file("result.json").text()); const part = payload.candidates?.[0]?.content?.parts?.find((item) => item.inlineData); if (!part?.inlineData?.data) throw new Error("No image data found"); await Bun.write("output.bin", Buffer.from(part.inlineData.data, "base64"));'
```

Inspect any text returned alongside the image:

```bash
jq -r '.candidates[0].content.parts[] | select(.text != null) | .text' result.json
```

Inspect errors:

```bash
jq '.' result.json
```

## Notes

- The script uses the Yunwu Gemini proxy endpoint at `https://yunwu.ai/v1beta`.
- The prompt must come from `stdin`.
- The script writes both success and failure as JSON to `stdout` so callers can handle everything in one pipeline.
