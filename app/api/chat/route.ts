import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { SYSTEM_PROMPT, containsUrgentKeyword } from '@/lib/ai/system-prompt'
import { TOOL_DEFINITIONS, dispatchTool } from '@/lib/ai/tool-registry'
import { createNurseAlert } from '@/lib/tools/createNurseAlert'
import { createServiceClient } from '@/lib/supabase/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Zod's .uuid() enforces strict RFC 4122 version/variant bits.
// Our demo seed uses non-compliant UUIDs (version 0, variant 0), so we use
// a lenient format regex instead. Tighten this in production.
const uuidLike = z.string().regex(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
)

const RequestSchema = z.object({
  patientId: uuidLike,
  sessionId: uuidLike,
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(2000),
    })
  ).max(50),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      console.error('[/api/chat] Validation error:', JSON.stringify(parsed.error.flatten(), null, 2))
      console.error('[/api/chat] Received body:', JSON.stringify({ patientId: body?.patientId, sessionId: body?.sessionId, messageCount: body?.messages?.length }, null, 2))
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 })
    }

    const { patientId, sessionId, messages } = parsed.data

    // --- Pre-screen for urgent keywords before hitting OpenAI ---
    const latestUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
    if (containsUrgentKeyword(latestUserMessage)) {
      await createNurseAlert(
        patientId,
        'critical',
        `Patient message triggered urgent keyword detection: "${latestUserMessage.slice(0, 200)}"`
      )
    }

    // --- Build OpenAI message list ---
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ]

    const toolsUsed: string[] = []

    // --- Agentic loop: up to 5 tool call rounds ---
    for (let round = 0; round < 5; round++) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto',
        max_tokens: 600,
        temperature: 0.4,
      })

      const choice = completion.choices[0]
      const assistantMessage = choice.message

      // Add assistant message to history
      openaiMessages.push(assistantMessage)

      // If no tool calls — we have the final response
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        const responseText = assistantMessage.content ?? "I'm here to help. Is there anything you need?"

        // Persist assistant message to chat_messages
        const supabase = createServiceClient()
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          sender: 'assistant',
          content: responseText,
          tool_name: toolsUsed.length > 0 ? toolsUsed.join(',') : null,
        })

        return NextResponse.json({
          message: responseText,
          toolsUsed,
        })
      }

      // Execute each tool call
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type !== 'function') continue
        const toolName = toolCall.function.name
        toolsUsed.push(toolName)

        let args: Record<string, unknown> = {}
        try {
          args = JSON.parse(toolCall.function.arguments)
        } catch {
          args = {}
        }

        const toolResult = await dispatchTool(toolName, args, patientId)

        // Add tool result back into the message chain
        openaiMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        })
      }
    }

    // Fallback if loop exhausted
    return NextResponse.json({
      message: "I've taken care of that for you. Is there anything else I can help with?",
      toolsUsed,
    })
  } catch (err) {
    console.error('[/api/chat] Error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or press the nurse call button.' },
      { status: 500 }
    )
  }
}
