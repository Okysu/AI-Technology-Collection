import React from 'react'
import Link from 'next/link'
import { SiDiscord, SiGithub, SiX } from 'react-icons/si'
import { Button } from './ui/button'

const Footer: React.FC = () => {
  return (
    <footer className="w-fit p-1 md:p-2 fixed bottom-0 right-0">
      <div className="flex justify-end">
        <span className="text-muted-foreground/50 text-sm">
          基于开源项目
          <a
            className="font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            href="https://git.new/morphic"
            target="_blank"
          >
            Morphic
          </a>
          构建
        </span>
      </div>
    </footer>
  )
}

export default Footer
