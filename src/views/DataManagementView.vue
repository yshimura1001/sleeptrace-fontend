<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Download, Upload, AlertCircle, CheckCircle2, FileJson } from 'lucide-vue-next'
import { authFetch } from '@/utils/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const csvColumns = [
  { name: '日付', desc: '睡眠日', format: 'YYYY/MM/DD', ex: '2026/01/23' },
  { name: '睡眠スコア', desc: '睡眠スコア', format: '0-100', ex: '85' },
  { name: '就寝時間', desc: '就寝時間', format: 'HH:MM', ex: '23:30' },
  { name: '起床時間', desc: '起床時間', format: 'HH:MM', ex: '07:00' },
  { name: '目が覚めた回数', desc: '中途覚醒回数', format: '整数', ex: '1' },
  { name: '深い睡眠の持続性', desc: '深い睡眠の持続性', format: '0-100', ex: '80' },
  { name: '深い睡眠割合', desc: '深い睡眠割合', format: '0-100 (%)', ex: '20' },
  { name: '浅い睡眠割合', desc: '浅い睡眠割合', format: '0-100 (%)', ex: '60' },
  { name: 'レム睡眠割合', desc: 'レム睡眠割合', format: '0-100 (%)', ex: '20' },
]

const fileInput = ref<HTMLInputElement | null>(null)
const importStatus = ref<{ type: 'success' | 'error'; message: string; details?: string[] } | null>(null)
const isImporting = ref(false)

const handleExport = async () => {
    try {
        const res = await authFetch('http://localhost:8787/api/csv/export')
        if (!res.ok) throw new Error('Export failed')
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sleep_logs_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    } catch (e) {
        console.error('Export failed', e)
        alert('エクスポートに失敗しました')
    }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  isImporting.value = true
  importStatus.value = null

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await authFetch('http://localhost:8787/api/csv/import', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'インポートに失敗しました')
    }

    const result = await res.json()
    importStatus.value = {
      type: 'success',
      message: result.message,
      details: result.details
    }
  } catch (e) {
    importStatus.value = {
      type: 'error',
      message: e instanceof Error ? e.message : 'インポートに失敗しました'
    }
  } finally {
    isImporting.value = false
    // Reset input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}
</script>

<template>
  <div class="container mx-auto py-8 max-w-4xl">
    <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight mb-2">データ管理</h1>
        <p class="text-muted-foreground">睡眠ログデータのインポートとエクスポートができます。</p>
    </div>

    <div class="mb-8">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
             <FileJson class="h-5 w-5" />
             CSVフォーマット仕様
          </CardTitle>
          <CardDescription>
            インポートに使用するCSVファイルの列構成は以下の通りです。
            <br>
            ※ ヘッダー行は必須ではありませんが、存在する場合は無視されます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead class="w-[100px]">項目</TableHead>
                   <TableHead v-for="col in csvColumns" :key="col.name" class="min-w-[120px] whitespace-nowrap">
                      {{ col.name }}
                   </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell class="font-medium bg-muted/50">形式</TableCell>
                  <TableCell v-for="col in csvColumns" :key="col.name" class="text-xs text-muted-foreground whitespace-nowrap">
                    {{ col.format }}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium bg-muted/50">例</TableCell>
                  <TableCell v-for="col in csvColumns" :key="col.name" class="text-xs font-mono whitespace-nowrap">
                    {{ col.ex }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV インポート</CardTitle>
          <CardDescription>
            CSVファイルをアップロードしてデータを追加します。
            <br>
            ※ 日付が重複するデータはスキップされます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-4">
             <Button :disabled="isImporting" @click="triggerFileInput" class="w-full sm:w-auto">
                <Upload class="mr-2 h-4 w-4" />
                {{ isImporting ? 'インポート中...' : 'CSVファイルをアップロード' }}
            </Button>
            <input
                ref="fileInput"
                type="file"
                accept=".csv"
                class="hidden"
                @change="handleImport"
            />
          </div>

          <div v-if="importStatus" class="mt-4">
             <Alert :variant="importStatus.type === 'error' ? 'destructive' : 'default'">
                <AlertCircle v-if="importStatus.type === 'error'" class="h-4 w-4" />
                <CheckCircle2 v-else class="h-4 w-4" />
                <AlertTitle>{{ importStatus.type === 'error' ? 'エラー' : '完了' }}</AlertTitle>
                <AlertDescription>
                    {{ importStatus.message }}
                    <div v-if="importStatus.details && importStatus.details.length > 0" class="mt-2 text-xs opacity-90 max-h-32 overflow-y-auto p-2 bg-background/10 rounded">
                        <div v-for="(detail, i) in importStatus.details" :key="i">
                            - {{ detail }}
                        </div>
                    </div>
                </AlertDescription>
             </Alert>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV エクスポート</CardTitle>
          <CardDescription>
            現在の睡眠ログデータをCSV形式でダウンロードします。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" @click="handleExport" class="w-full sm:w-auto">
            <Download class="mr-2 h-4 w-4" />
            CSVをダウンロード
          </Button>
        </CardContent>
      </Card>
    </div>


  </div>
</template>
