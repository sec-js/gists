#!/usr/bin/env bun

import { readFile, stat } from "node:fs/promises"
import path from "node:path"

const DEFAULT_BACKEND = "yunwu"
const YUNWU_MODEL = "gemini-3.1-flash-image-preview"
const OPENROUTER_MODEL = "google/gemini-3.1-flash-image-preview"
const DEFAULT_RESOLUTION = "1K"
const DEFAULT_ASPECT_RATIO = "1:1"
const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const MAX_INPUT_IMAGES = 14
const YUNWU_BASE_URL = "https://yunwu.ai/v1beta"
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

const VALID_RESOLUTIONS = new Set(["512", "1K", "2K", "4K"])
const VALID_ASPECT_RATIOS = new Set([
  "1:1",
  "1:4",
  "1:8",
  "2:3",
  "3:2",
  "3:4",
  "4:1",
  "4:3",
  "4:5",
  "5:4",
  "8:1",
  "9:16",
  "16:9",
  "21:9",
])

type Backend = "yunwu" | "openrouter"

type Options = {
  backend: Backend
  images: string[]
  resolution: string
  aspectRatio: string
}

type LoadedImage = {
  mimeType: string
  data: string
}

function usage() {
  return [
    "Usage: bun run generate.ts [--backend <yunwu|openrouter>] [--image <path> ...] [--resolution <512|1K|2K|4K>] [--aspect-ratio <ratio>]",
    "",
    "Reads the prompt from stdin and prints raw JSON to stdout.",
    "",
    "Examples:",
    "  printf 'A nano banana dessert on a marble table\n' | bun run generate.ts > result.json",
    "  printf 'Add a llama beside the person\n' | bun run generate.ts --image ./photo.jpg > result.json",
    "  printf 'Use OpenRouter only if Yunwu failed\n' | bun run generate.ts --backend openrouter > result.json",
    "  printf 'Blend these styles\n' | bun run generate.ts --image ./a.png --image ./b.png --resolution 2K > result.json",
  ].join("\n")
}

function emitJson(value: unknown, exitCode = 0): never {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
  process.exit(exitCode)
}

function fail(message: string, extra?: Record<string, unknown>): never {
  emitJson(
    {
      error: {
        message,
        ...extra,
      },
    },
    1,
  )
}

function parseArgs(argv: string[]): Options {
  const options: Options = {
    backend: DEFAULT_BACKEND,
    images: [],
    resolution: DEFAULT_RESOLUTION,
    aspectRatio: DEFAULT_ASPECT_RATIO,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === "--help") {
      emitJson({ help: usage() })
    }

    if (arg === "--image") {
      const value = argv[i + 1]
      if (!value) fail("Missing value for --image")
      options.images.push(value)
      i += 1
      continue
    }

    if (arg === "--backend") {
      const value = argv[i + 1]
      if (!value) fail("Missing value for --backend")
      if (value !== "yunwu" && value !== "openrouter") {
        fail("Invalid backend", {
          received: value,
          allowed: ["yunwu", "openrouter"],
        })
      }
      options.backend = value
      i += 1
      continue
    }

    if (arg === "--resolution") {
      const value = argv[i + 1]
      if (!value) fail("Missing value for --resolution")
      if (!VALID_RESOLUTIONS.has(value)) {
        fail("Invalid resolution", {
          received: value,
          allowed: Array.from(VALID_RESOLUTIONS),
        })
      }
      options.resolution = value
      i += 1
      continue
    }

    if (arg === "--aspect-ratio") {
      const value = argv[i + 1]
      if (!value) fail("Missing value for --aspect-ratio")
      if (!VALID_ASPECT_RATIOS.has(value)) {
        fail("Invalid aspect ratio", {
          received: value,
          allowed: Array.from(VALID_ASPECT_RATIOS),
        })
      }
      options.aspectRatio = value
      i += 1
      continue
    }

    fail("Unknown argument", { argument: arg })
  }

  if (options.images.length > MAX_INPUT_IMAGES) {
    fail("Too many input images", {
      max: MAX_INPUT_IMAGES,
      received: options.images.length,
    })
  }

  return options
}

function detectMimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase()

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".png":
      return "image/png"
    case ".webp":
      return "image/webp"
    case ".gif":
      return "image/gif"
    default:
      fail("Unsupported image type", {
        path: filePath,
        extension: ext || null,
        allowed: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
      })
  }
}

async function readPrompt() {
  const chunks: Uint8Array[] = []
  for await (const chunk of Bun.stdin.stream()) {
    chunks.push(chunk)
  }

  const prompt = Buffer.concat(chunks).toString("utf8").trim()
  if (!prompt) fail("Prompt is required on stdin")
  return prompt
}

async function loadImagePart(filePath: string) {
  let fileStat
  try {
    fileStat = await stat(filePath)
  } catch (error) {
    fail("Failed to read image metadata", {
      path: filePath,
      cause: error instanceof Error ? error.message : String(error),
    })
  }

  if (!fileStat.isFile()) {
    fail("Image path is not a file", { path: filePath })
  }

  if (fileStat.size > MAX_IMAGE_BYTES) {
    fail("Input image exceeds 4 MB limit", {
      path: filePath,
      bytes: fileStat.size,
      maxBytes: MAX_IMAGE_BYTES,
    })
  }

  const mimeType = detectMimeType(filePath)

  try {
    const bytes = await readFile(filePath)
    return {
      mimeType,
      data: bytes.toString("base64"),
    }
  } catch (error) {
    fail("Failed to read image file", {
      path: filePath,
      cause: error instanceof Error ? error.message : String(error),
    })
  }
}

function getApiKey(options: Options) {
  if (options.backend === "yunwu") {
    const apiKey = process.env.YUNWU_API_KEY
    if (!apiKey) {
      fail("YUNWU_API_KEY is not set")
    }
    return apiKey
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    fail("OPENROUTER_API_KEY is not set")
  }
  return apiKey
}

function toYunwuImagePart(image: LoadedImage) {
  return {
    inline_data: {
      mime_type: image.mimeType,
      data: image.data,
    },
  }
}

function toOpenRouterImagePart(image: LoadedImage) {
  return {
    type: "image_url",
    image_url: {
      url: `data:${image.mimeType};base64,${image.data}`,
    },
  }
}

function mapOpenRouterResolution(resolution: string) {
  if (resolution === "512") {
    return "0.5K"
  }

  return resolution
}

function buildRequest(options: Options, prompt: string, images: LoadedImage[]) {
  if (options.backend === "yunwu") {
    return {
      url: `${YUNWU_BASE_URL}/models/${encodeURIComponent(YUNWU_MODEL)}:generateContent?key=${encodeURIComponent(getApiKey(options))}`,
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        contents: [
          {
            role: "user",
            parts: [...images.map((image) => toYunwuImagePart(image)), { text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
          imageConfig: {
            aspectRatio: options.aspectRatio,
            imageSize: options.resolution,
          },
        },
      },
    }
  }

  return {
    url: `${OPENROUTER_BASE_URL}/chat/completions`,
    headers: {
      Authorization: `Bearer ${getApiKey(options)}`,
      "Content-Type": "application/json",
    },
    body: {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }, ...images.map((image) => toOpenRouterImagePart(image))],
        },
      ],
      modalities: ["image", "text"],
      image_config: {
        aspect_ratio: options.aspectRatio,
        image_size: mapOpenRouterResolution(options.resolution),
      },
    },
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const prompt = await readPrompt()
  const images = await Promise.all(options.images.map((filePath) => loadImagePart(filePath)))
  const request = buildRequest(options, prompt, images)

  let response: Response
  try {
    response = await fetch(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(request.body),
    })
  } catch (error) {
    fail("Request failed", {
      backend: options.backend,
      cause: error instanceof Error ? error.message : String(error),
    })
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch (error) {
    fail("Failed to parse JSON response", {
      backend: options.backend,
      status: response.status,
      cause: error instanceof Error ? error.message : String(error),
    })
  }

  if (!response.ok) {
    emitJson(
      {
        error: {
          message: "Model request failed",
          backend: options.backend,
          status: response.status,
          response: payload,
        },
      },
      1,
    )
  }

  emitJson(payload)
}

await main()
