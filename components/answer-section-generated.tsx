'use client'

import { Section } from './section'
import { BotMessage } from './message'

export type AnswerSectionProps = {
  result: string
}

export function AnswerSectionGenerated({ result }: AnswerSectionProps) {
  return (
    <div>
      <Section title="回答">
        <BotMessage content={result} />
      </Section>
    </div>
  )
}
