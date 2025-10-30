import OpenAI from 'openai'

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env.OPENAI_API_KEY')
}

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// GPT-5 model configurations
export const GPT5_MODELS = {
  COMPLEX: 'gpt-5',
  MINI: 'gpt-5-mini',
  NANO: 'gpt-5-nano',
  PRO: 'gpt-5-pro',
} as const

export type GPT5Model = typeof GPT5_MODELS[keyof typeof GPT5_MODELS]

// Default model settings
export const DEFAULT_MODEL = GPT5_MODELS.COMPLEX
export const DEFAULT_REASONING_EFFORT = 'medium'
export const DEFAULT_VERBOSITY = 'medium'
export const DEFAULT_MAX_TOKENS = 4000
export const DEFAULT_TEMPERATURE = 0.7

// Model parameters interface
export interface ModelParameters {
  model?: GPT5Model
  reasoningEffort?: 'minimal' | 'low' | 'medium' | 'high'
  verbosity?: 'low' | 'medium' | 'high'
  maxTokens?: number
  temperature?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stop?: string | string[]
  user?: string
  seed?: number
}

// Response interface
export interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Core OpenAI client methods
export class GPT5Client {
  private client: OpenAI

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    })
  }

  /**
   * Generate chat completion with GPT-5
   */
  async chatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    parameters: ModelParameters = {}
  ): Promise<OpenAIResponse> {
    const {
      model = DEFAULT_MODEL,
      reasoningEffort = DEFAULT_REASONING_EFFORT,
      verbosity = DEFAULT_VERBOSITY,
      maxTokens = DEFAULT_MAX_TOKENS,
      temperature = DEFAULT_TEMPERATURE,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      stop,
      user,
      seed,
    } = parameters

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        reasoning_effort: reasoningEffort,
        text: {
          verbosity,
        },
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        stop,
        user,
        seed,
      })

      return response as OpenAIResponse
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw error
    }
  }

  /**
   * Generate content using the newer Responses API
   */
  async generateResponse(
    prompt: string,
    systemPrompt?: string,
    parameters: ModelParameters = {}
  ): Promise<string> {
    const {
      model = DEFAULT_MODEL,
      reasoningEffort = DEFAULT_REASONING_EFFORT,
      verbosity = DEFAULT_VERBOSITY,
      maxTokens = DEFAULT_MAX_TOKENS,
      temperature = DEFAULT_TEMPERATURE,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      stop,
      user,
    } = parameters

    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt },
    ]

    const response = await this.client.chat.completions.create({
      model,
      messages,
      reasoning_effort: reasoningEffort,
      text: {
        verbosity,
      },
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      frequency_penalty,
      presence_penalty,
      stop,
      user,
    })

    return response.choices[0]?.message?.content || ''
  }

  /**
   * Generate JSON response with structured output
   */
  async generateJSONResponse<T = any>(
    prompt: string,
    systemPrompt?: string,
    parameters: ModelParameters = {}
  ): Promise<T> {
    const response = await this.generateResponse(
      prompt,
      `${systemPrompt || ''}\n\nRespond with valid JSON only.`,
      parameters
    )

    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('JSON Parse Error:', error)
      throw new Error('Failed to parse JSON response from OpenAI')
    }
  }
}

// Specialized AI Site Builder functionality
export class AISiteBuilder {
  private gpt5: GPT5Client

  constructor() {
    this.gpt5 = new GPT5Client()
  }

  /**
   * Generate sitemap from company description
   */
  async generateSitemap(
    companyDescription: string,
    targetAudience?: string,
    features?: string[]
  ): Promise<{
    title: string
    description: string
    pages: Array<{
      name: string
      path: string
      description: string
      priority: 'high' | 'medium' | 'low'
      keywords: string[]
    }>
    metadata: {
      totalPages: number
      primaryKeywords: string[]
      targetAudience: string
    }
  }> {
    const prompt = `
Create a comprehensive sitemap for a website based on the following information:

Company: ${companyDescription}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${features ? `Key Features: ${features.join(', ')}` : ''}

Please generate:
1. A website title and description
2. A structured list of pages with paths, descriptions, and priorities
3. SEO-relevant keywords for each page
4. Overall site metadata

Format the response as a JSON object with the structure:
{
  "title": "Website Title",
  "description": "Website Description",
  "pages": [
    {
      "name": "Page Name",
      "path": "/page-path",
      "description": "Page Description",
      "priority": "high|medium|low",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  "metadata": {
    "totalPages": 10,
    "primaryKeywords": ["keyword1", "keyword2", "keyword3"],
    "targetAudience": "description"
  }
}
`

    const response = await this.gpt5.generateJSONResponse(prompt, undefined, {
      model: GPT5_MODELS.COMPLEX,
      reasoningEffort: 'medium',
      verbosity: 'medium',
      maxTokens: 2000,
    })

    return response
  }

  /**
   * Generate wireframe from sitemap
   */
  async generateWireframe(
    sitemap: {
      title: string
      pages: Array<{
        name: string
        path: string
        description: string
      }>
    },
    style: 'modern' | 'classic' | 'minimal' | 'corporate' = 'modern'
  ): Promise<{
    pages: Array<{
      name: string
      path: string
      layout: {
        header: {
          elements: string[]
          navigation: string[]
          logo: boolean
        }
        main: {
          sections: string[]
          callToAction: string[]
          content: string
        }
        sidebar: {
          elements: string[]
          widgets: string[]
        }
        footer: {
          links: string[]
          social: boolean
          contact: boolean
        }
      }
      components: string[]
      colorScheme: string
      typography: string
    }>
    styleGuide: {
      primaryColors: string[]
      secondaryColors: string[]
      fonts: string[]
      spacing: string
      borderRadius: string
    }
  }> {
    const prompt = `
Generate detailed wireframes for the following sitemap:

Sitemap: ${JSON.stringify(sitemap, null, 2)}

Style: ${style}

Please create:
1. Detailed wireframe specifications for each page
2. Layout components (header, main, sidebar, footer)
3. Content sections and call-to-actions
4. UI components to be used
5. Basic style guide with colors and typography

Format as JSON with the structure:
{
  "pages": [
    {
      "name": "Page Name",
      "path": "/page-path",
      "layout": {
        "header": {
          "elements": ["element1", "element2"],
          "navigation": ["nav1", "nav2"],
          "logo": true
        },
        "main": {
          "sections": ["section1", "section2"],
          "callToAction": ["cta1", "cta2"],
          "content": "content description"
        },
        "sidebar": {
          "elements": ["element1", "element2"],
          "widgets": ["widget1", "widget2"]
        },
        "footer": {
          "links": ["link1", "link2"],
          "social": true,
          "contact": true
        }
      },
      "components": ["component1", "component2"],
      "colorScheme": "#hex1, #hex2, #hex3",
      "typography": "font family and styles"
    }
  ],
  "styleGuide": {
    "primaryColors": ["#hex1", "#hex2"],
    "secondaryColors": ["#hex3", "#hex4"],
    "fonts": ["font1", "font2"],
    "spacing": "spacing scale",
    "borderRadius": "radius scale"
  }
}
`

    const response = await this.gpt5.generateJSONResponse(prompt, undefined, {
      model: GPT5_MODELS.COMPLEX,
      reasoningEffort: 'medium',
      verbosity: 'high',
      maxTokens: 3000,
    })

    return response
  }

  /**
   * Generate AI copywriting
   */
  async generateCopywriting(
    prompt: string,
    tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'creative' = 'professional',
    length: 'short' | 'medium' | 'long' = 'medium',
    audience?: string
  ): Promise<{
    headline: string
    subheadline: string
    body: string[]
    callToAction: string[]
    metaDescription: string
    keywords: string[]
  }> {
    const systemPrompt = `
You are an expert copywriter specializing in website content. 
Write compelling, conversion-focused copy that engages the target audience.

Tone: ${tone}
Length: ${length}
${audience ? `Target Audience: ${audience}` : ''}

Generate:
1. Attention-grabbing headline
2. Compelling subheadline
3. Body content in multiple paragraphs
4. Call-to-action variations
5. SEO-optimized meta description
6. Relevant keywords
`

    const response = await this.gpt5.generateJSONResponse(prompt, systemPrompt, {
      model: GPT5_MODELS.MINI,
      reasoningEffort: 'low',
      verbosity: 'medium',
      maxTokens: 1500,
      temperature: 0.8,
    })

    return response
  }

  /**
   * Generate style guide from wireframe
   */
  async generateStyleGuide(
    wireframe: {
      styleGuide: {
        primaryColors: string[]
        secondaryColors: string[]
        fonts: string[]
      }
      pages: Array<{
        components: string[]
        colorScheme: string
        typography: string
      }>
    }
  ): Promise<{
    colors: {
      primary: Record<string, string>
      secondary: Record<string, string>
      neutral: Record<string, string>
      accent: Record<string, string>
    }
    typography: {
      headings: Record<string, string>
      body: Record<string, string>
      buttons: Record<string, string>
      links: Record<string, string>
    }
    spacing: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      xxl: string
    }
    components: {
      buttons: Array<{
        name: string
        variants: string[]
        properties: Record<string, string>
      }>
      forms: Array<{
        name: string
        variants: string[]
        properties: Record<string, string>
      }>
      navigation: Array<{
        name: string
        variants: string[]
        properties: Record<string, string>
      }>
    }
    grid: {
      columns: number
      gutter: string
      container: string
    }
    breakpoints: {
      sm: string
      md: string
      lg: string
      xl: string
      xxl: string
    }
  }> {
    const prompt = `
Create a comprehensive style guide based on the following wireframe specifications:

Wireframe: ${JSON.stringify(wireframe, null, 2)}

Generate:
1. Complete color palette with variations (primary, secondary, neutral, accent)
2. Typography system (headings, body, buttons, links)
3. Spacing scale (xs, sm, md, lg, xl, xxl)
4. Component specifications (buttons, forms, navigation)
5. Grid system details
6. Responsive breakpoints

Format as detailed JSON object.
`

    const response = await this.gpt5.generateJSONResponse(prompt, undefined, {
      model: GPT5_MODELS.COMPLEX,
      reasoningEffort: 'medium',
      verbosity: 'high',
      maxTokens: 2500,
    })

    return response
  }
}

// Export singleton instances
export const gpt5Client = new GPT5Client()
export const aiSiteBuilder = new AISiteBuilder()

// Utility functions
export const aiUtils = {
  /**
   * Check if OpenAI API is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await gpt5Client.chatCompletion([
        { role: 'user', content: 'Hello' }
      ])
      return true
    } catch (error) {
      console.error('OpenAI API not available:', error)
      return false
    }
  },

  /**
   * Estimate token count for a string
   */
  estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4)
  },

  /**
   * Calculate estimated cost for API call
   */
  estimateCost(
    inputTokens: number,
    outputTokens: number,
    model: GPT5Model = DEFAULT_MODEL
  ): number {
    const pricing = {
      [GPT5_MODELS.COMPLEX]: { input: 1.25, output: 10 },
      [GPT5_MODELS.MINI]: { input: 0.25, output: 2 },
      [GPT5_MODELS.NANO]: { input: 0.05, output: 0.4 },
      [GPT5_MODELS.PRO]: { input: 15, output: 120 },
    }

    const modelPricing = pricing[model]
    const inputCost = (inputTokens / 1000000) * modelPricing.input
    const outputCost = (outputTokens / 1000000) * modelPricing.output
    
    return inputCost + outputCost
  },

  /**
   * Retry API call with exponential backoff
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxAttempts) {
          throw lastError
        }

        const delay = baseDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  },
}