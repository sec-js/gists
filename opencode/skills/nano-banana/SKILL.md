---
name: nano-banana
description: Generate or edit images with Nano Banana.
---

## Nano Banana

This skill provides a Bun CLI for image generation and image editing.

The bundled script reads the prompt from `stdin`, sends a request to `gemini-3.1-flash-image-preview`, and writes the raw API JSON response to `stdout`.

The default backend is Yunwu. Use OpenRouter only if Yunwu failed, and only after asking the user for explicit permission, because the user's OpenRouter budget is limited.

## Script

`<skill-base>/generate.ts`

## Usage

Text to image:

```bash
printf 'A studio product photo of a nano banana dessert on dark stone\n' | bun run <skill-base>/generate.ts > result.json
```

OpenRouter fallback after Yunwu failed and the user explicitly approved it:

```bash
printf 'A studio product photo of a nano banana dessert on dark stone\n' | bun run <skill-base>/generate.ts --backend openrouter > result.json
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
printf 'A clean modern weather infographic for Shanghai\n' | bun run <skill-base>/generate.ts --resolution 512 --aspect-ratio 16:9 > result.json
```

## Options

- `--image <path>`: add an input image. Repeatable. Maximum 14 images.
- `--backend <name>`: `yunwu` or `openrouter`. Default is `yunwu`.
- `--resolution <size>`: one of `512`, `1K`, `2K`, `4K`. Default is `1K`. Use the default unless user hints otherwise.
- `--aspect-ratio <ratio>`: one of `1:1`, `1:4`, `1:8`, `2:3`, `3:2`, `3:4`, `4:1`, `4:3`, `4:5`, `5:4`, `8:1`, `9:16`, `16:9`, `21:9`. Default is `1:1`.
- `--help`: print usage.

Each input image must be `4 MB` or smaller. The script returns an error JSON object if any image is too large.

## Result Handling

The response is raw JSON. Image bytes are typically returned in:

```text
Yunwu: .candidates[0].content.parts[].inlineData.data
OpenRouter: .choices[0].message.images[].image_url.url
```

### Yunwu extraction

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

### OpenRouter extraction

Check whether the call returned an image:

```bash
jq '.choices[0].message.images | length' result.json
```

Check the returned data URL prefix:

```bash
jq -r '.choices[0].message.images[0].image_url.url | split(",")[0]' result.json
```

Extract the first returned image bytes with `jq` and `base64`:

```bash
jq -r '.choices[0].message.images[0].image_url.url | split(",")[1]' result.json | base64 -d > output.bin
```

Inspect any text returned alongside the image:

```bash
jq -r '(.candidates[0].content.parts[]? | select(.text != null) | .text), (.choices[0].message.content // empty)' result.json
```

Inspect errors:

```bash
jq '.' result.json
```

## Prompt Guide

The official Gemini image generation guide recommends describing scenes in natural language instead of listing isolated keywords.

For generation prompts:

- Photorealistic scenes: use photography language such as shot type, camera or lens details, lighting, mood, textures, and aspect ratio.
- Stylized illustrations and stickers: be explicit about the style, line work, shading, palette, and request a transparent background if desired.
- Text in images: specify the exact text, describe the font style and layout clearly, and prefer Gemini 3 Pro Image for high-stakes production assets.
- Product mockups: describe the product, background surface, studio lighting setup, camera angle, and the specific feature that should be emphasized.
- Minimalist designs: state the subject placement and the empty negative space you want preserved.
- Sequential art: describe the panel count, art style, character, and scene clearly.
- Real-time or current events: use grounding with Google Search when the image depends on fresh facts.

For editing prompts:

- Add or remove elements by naming the source image subject, the exact change, and how the new element should integrate into style, lighting, and perspective.
- For local edits, specify what should change and explicitly say everything else should remain the same.
- For style transfer, ask the model to preserve composition while re-rendering in the target style.
- For multiple images, explicitly assign roles to each image, such as subject from image 1 and background from image 2.
- For high-fidelity edits, describe the details that must remain unchanged, such as a face, logo, or garment.
- For rough sketches, state which features must be preserved and which new materials or finish details should be added.

General best practices from the guide:

- Be hyper-specific.
- Provide the purpose and context of the image.
- Iterate conversationally instead of trying to get the final image in one prompt.
- Break complex scenes into step-by-step instructions.
- Prefer positive scene descriptions over short negative prompts.
- Use camera and cinematic language to control composition.

Important note when generating images about new / specific things: Include enough context and explain the things to generate to Gemini. The model is not magical and it cannot generate things it does not know about. It does not read your mind or conversation history; You must include all information about the object to generate. 

## Notes

- The script defaults to the Yunwu Gemini proxy endpoint at `https://yunwu.ai/v1beta`.
- The OpenRouter fallback endpoint is `https://openrouter.ai/api/v1/chat/completions`.
- For OpenRouter, the script uses the same Gemini model through `google/gemini-3.1-flash-image-preview`.
- The prompt must come from `stdin`.
- The script writes both success and failure as JSON to `stdout` so callers can handle everything in one pipeline.
