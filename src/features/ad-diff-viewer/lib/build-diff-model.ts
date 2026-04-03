export interface DescriptionDiffModel {
  sourceText: string
  suggestion: string
}

export type DiffChunkKind = "unchanged" | "added" | "removed"

export interface DiffChunk {
  kind: DiffChunkKind
  value: string
}

export interface DiffViewerModel {
  sourceChunks: DiffChunk[]
  suggestionChunks: DiffChunk[]
}

const TOKEN_PATTERN = /\s+|[^\s]+/g

function tokenizeText(text: string): string[] {
  const tokens = text.match(TOKEN_PATTERN)

  return tokens ?? []
}

function getRowValue(row: Uint16Array, index: number): number {
  return row[index] ?? 0
}

function buildLcsLengths(
  sourceTokens: string[],
  suggestionTokens: string[]
): Uint16Array[] {
  const sourceLength = sourceTokens.length
  const suggestionLength = suggestionTokens.length
  const lcsLengths = Array.from(
    { length: sourceLength + 1 },
    () => new Uint16Array(suggestionLength + 1)
  )

  for (let sourceIndex = sourceLength - 1; sourceIndex >= 0; sourceIndex -= 1) {
    const currentRow = lcsLengths[sourceIndex]
    const nextRow = lcsLengths[sourceIndex + 1]

    if (currentRow === undefined || nextRow === undefined) {
      continue
    }

    for (
      let suggestionIndex = suggestionLength - 1;
      suggestionIndex >= 0;
      suggestionIndex -= 1
    ) {
      const sourceToken = sourceTokens[sourceIndex]
      const suggestionToken = suggestionTokens[suggestionIndex]

      if (sourceToken === undefined || suggestionToken === undefined) {
        continue
      }

      if (sourceToken === suggestionToken) {
        currentRow[suggestionIndex] =
          getRowValue(nextRow, suggestionIndex + 1) + 1
        continue
      }

      currentRow[suggestionIndex] = Math.max(
        getRowValue(nextRow, suggestionIndex),
        getRowValue(currentRow, suggestionIndex + 1)
      )
    }
  }

  return lcsLengths
}

function mergeAdjacentChunks(chunks: DiffChunk[]): DiffChunk[] {
  const mergedChunks: DiffChunk[] = []

  for (const chunk of chunks) {
    const previousChunk = mergedChunks[mergedChunks.length - 1]

    if (previousChunk?.kind === chunk.kind) {
      previousChunk.value += chunk.value
      continue
    }

    mergedChunks.push({
      kind: chunk.kind,
      value: chunk.value
    })
  }

  return mergedChunks
}

function buildDiffChunks(
  sourceTokens: string[],
  suggestionTokens: string[]
): DiffChunk[] {
  const lcsLengths = buildLcsLengths(sourceTokens, suggestionTokens)
  const sourceLength = sourceTokens.length
  const suggestionLength = suggestionTokens.length

  const chunks: DiffChunk[] = []
  let sourceIndex = 0
  let suggestionIndex = 0

  while (sourceIndex < sourceLength && suggestionIndex < suggestionLength) {
    const sourceToken = sourceTokens[sourceIndex]
    const suggestionToken = suggestionTokens[suggestionIndex]

    if (sourceToken === undefined || suggestionToken === undefined) {
      break
    }

    if (sourceToken === suggestionToken) {
      chunks.push({
        kind: "unchanged",
        value: sourceToken
      })
      sourceIndex += 1
      suggestionIndex += 1
      continue
    }

    const currentRow = lcsLengths[sourceIndex]
    const nextRow = lcsLengths[sourceIndex + 1]

    if (currentRow === undefined || nextRow === undefined) {
      break
    }

    if (
      getRowValue(nextRow, suggestionIndex) >=
      getRowValue(currentRow, suggestionIndex + 1)
    ) {
      chunks.push({
        kind: "removed",
        value: sourceToken
      })
      sourceIndex += 1
      continue
    }

    chunks.push({
      kind: "added",
      value: suggestionToken
    })
    suggestionIndex += 1
  }

  while (sourceIndex < sourceLength) {
    const sourceToken = sourceTokens[sourceIndex]

    if (sourceToken === undefined) {
      break
    }

    chunks.push({
      kind: "removed",
      value: sourceToken
    })
    sourceIndex += 1
  }

  while (suggestionIndex < suggestionLength) {
    const suggestionToken = suggestionTokens[suggestionIndex]

    if (suggestionToken === undefined) {
      break
    }

    chunks.push({
      kind: "added",
      value: suggestionToken
    })
    suggestionIndex += 1
  }

  return mergeAdjacentChunks(chunks)
}

export function buildDiffViewerModel({
  sourceText,
  suggestion
}: DescriptionDiffModel): DiffViewerModel {
  const diffChunks = buildDiffChunks(
    tokenizeText(sourceText),
    tokenizeText(suggestion)
  )

  return {
    sourceChunks: diffChunks.filter(chunk => chunk.kind !== "added"),
    suggestionChunks: diffChunks.filter(chunk => chunk.kind !== "removed")
  }
}
