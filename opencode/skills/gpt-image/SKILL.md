---
name: gpt-image
description: Generate or edit images with gpt-image-2. Use when the user wants image generation or image editing via Yunwu first, with Right Code as fallback.
---

## GPT Image

Use this skill for `gpt-image-2` image generation and editing.

The agent should not rely on bundled code. Construct the request on demand with `curl`, Python, JavaScript, or another shell-friendly client.

### Source docs

- OpenAI image generation guide: <https://developers.openai.com/api/docs/guides/image-generation>
- OpenAI image generation reference: <https://developers.openai.com/api/reference/resources/images/methods/generate/>
- OpenAI `gpt-image-2` model page: <https://developers.openai.com/api/docs/models/gpt-image-2>
- OpenAI prompting guide: <https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide>
- Right Code draw overview: <https://docs.right.codes/docs/rc_extension/draw/>
- Right Code image generation page: <https://docs.right.codes/docs/rc_extension/draw/images-generations.html>

### Backends

#### Yunwu (default and preferred)

- Base URL: `https://yunwu.ai/v1`
- API key env var: `YUNWU_API_KEY`
- Model: `gpt-image-2`
- Use this backend first unless the user explicitly asks otherwise.

#### Right Code (fallback)

- Base URL: `https://www.right.codes/draw`
- API key env var: `RC_API_KEY`
- Model: `gpt-image-2`
- Use this only if Yunwu fails or is unavailable.
- Assume text-only generation here; do not rely on image upload or editing support.

### Call shape

Use the OpenAI Images API shape when the backend supports it:

- Text-to-image: `POST /images/generations`
- Edit image: `POST /images/edits`
- Model: `gpt-image-2`
- Prompt: plain natural language, from the current request only
- Default quality: `high`

Right Code documents a simpler draw endpoint:

- `POST /v1/images/generations`
- Fields: `model`, `prompt`, optional `image`, optional `size`, optional `response_format`
- Response: `data[0].url`

### Example: Yunwu text-to-image

```bash
curl -sS "https://yunwu.ai/v1/images/generations" \
  -H "Authorization: Bearer $YUNWU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "A studio product photo of a black ceramic mug on a warm oak table",
    "size": "1024x1024",
    "quality": "high"
  }'
```

### Example: Right Code text-to-image

```bash
curl -sS "https://www.right.codes/draw/v1/images/generations" \
  -H "Authorization: Bearer $RC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "A studio product photo of a black ceramic mug on a warm oak table",
    "size": "1024x1024",
    "quality": "high",
    "response_format": "url"
  }'
```

### Caveats

- Prefer Yunwu first; Right Code is a fallback.
- `gpt-image-2` does not support transparent backgrounds.
- Do not send `input_fidelity` for `gpt-image-2`.
- Use `quality: high` by default unless the user explicitly wants a faster draft.
- Keep sizes within the documented constraints: both edges divisible by 16, aspect ratio no wider than `3:1`, and treat outputs above `2560x1440` as experimental.
- Right Code returns image URLs in `data[0].url`; do not assume base64 there.
- Right Code should be treated as text-to-image only in this skill.
- If you need edits, use Yunwu and verify the backend accepts the OpenAI multipart edit shape before using local files.
- If the request includes reference images, route the work to Yunwu and be explicit about which image is the subject, palette, background, or composition reference.

### Prompting

- Describe the scene in natural language.
- State the subject, style, lighting, framing, and intended use.
- For text in images, specify the exact text and where it should appear.
- For edits, say what must stay unchanged and what must change.
