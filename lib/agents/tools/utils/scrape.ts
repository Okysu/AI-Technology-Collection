import { getEmbeddingModel } from '@/lib/utils'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { VectorDB } from 'imvectordb'

export async function scrape(url: string, prompt: string): Promise<string> {
  try {
    const content = await fetchAndExtractContent(url)
    const documents = splitText(content, 1500, 150)
    
    const embeddingFunction = new OpenAIEmbeddingFunction()
    const db = new VectorDB()

    const [embeddings, queryEmbedding] = await Promise.all([
      embeddingFunction.generate(documents),
      embeddingFunction.generate([prompt])
    ])

    await addDocumentsToDb(db, url, documents, embeddings)
    
    const results = await db.query(queryEmbedding[0], 2)
    const relevantResults = formatRelevantResults(results)
    
    await db.terminate()
    return relevantResults
  } catch (error) {
    throw new Error(`Failed to scrape ${url}: ${(error as Error).message}`)
  }
}

async function fetchAndExtractContent(url: string): Promise<string> {
  const { data: html } = await axios.get(url)
  const $ = cheerio.load(html)
  $("script, style, svg").remove()
  const mainContent = $("main").text() || $("body").text()
  return mainContent.trim().replace(/\s+/g, ' ')
}

function splitText(text: string, chunkSize: number, overlap: number): string[] {
  if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
    throw new Error('Invalid chunkSize or overlap')
  }
  
  return Array.from({ length: Math.ceil(text.length / (chunkSize - overlap)) }, (_, i) => {
    const start = i * (chunkSize - overlap)
    const end = Math.min(start + chunkSize, text.length)
    return text.slice(start, end)
  })
}

async function addDocumentsToDb(db: VectorDB, url: string, documents: string[], embeddings: number[][]): Promise<void> {
  await Promise.all(documents.map((doc, i) => 
    db.add({
      id: `${url}-${i}`,
      embedding: embeddings[i],
      metadata: { text: doc }
    })
  ))
}

function formatRelevantResults(results: any[]): string {
  return results
    .filter(item => item.similarity >= 0.6)
    .map(item => `Content: ${item.document.metadata.text}\nScore: ${item.similarity}`)
    .join('\n\n')
}

class OpenAIEmbeddingFunction {
  private model: ReturnType<typeof getEmbeddingModel>
  
  constructor() {
    this.model = getEmbeddingModel()
  }

  public async generate(texts: string[]): Promise<number[][]> {
    const { embeddings } = await this.model.doEmbed({ values: texts })
    return embeddings
  }
}