// Quick test component to verify all builder components work correctly
import React from 'react'
import { BuilderWorkflow } from '@/components/builder/workflow'

export default function TestBuilder() {
  return (
    <div className="min-h-screen bg-background">
      <BuilderWorkflow />
    </div>
  )
}