import { useRef, useState } from 'react'
import type { CaptureImage, ViewType } from '@/types'
import { CAPTURE_GUIDES, VIEW_LABELS } from '@/types'
import { fileToDataUrl, useCameraStream } from './useCameraStream'

interface Props {
  view: ViewType
  value: CaptureImage | null
  onChange: (image: CaptureImage | null) => void
}

export default function PhotoCapture({ view, value, onChange }: Props) {
  const [mode, setMode] = useState<'idle' | 'camera'>('idle')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { videoRef, isActive, error, start, stop, capture } = useCameraStream()

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    commitImage(dataUrl)
    e.target.value = ''
  }

  async function handleOpenCamera() {
    setMode('camera')
    await start()
  }

  function handleCaptureShot() {
    const dataUrl = capture()
    if (dataUrl) {
      commitImage(dataUrl)
      stop()
      setMode('idle')
    }
  }

  function commitImage(dataUrl: string) {
    onChange({ view, dataUrl, capturedAt: new Date().toISOString() })
  }

  function handleRetake() {
    onChange(null)
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-studio-900">{VIEW_LABELS[view]} 촬영</h3>
        {value && (
          <button onClick={handleRetake} className="text-sm font-medium text-studio-500 hover:text-studio-700">
            삭제 · 다시 촬영
          </button>
        )}
      </div>

      {!value && (
        <ul className="mb-4 space-y-1 text-sm text-studio-600">
          {CAPTURE_GUIDES[view].map((g) => (
            <li key={g} className="flex gap-2">
              <span className="text-studio-400">·</span>
              {g}
            </li>
          ))}
        </ul>
      )}

      {value ? (
        <img
          src={value.dataUrl}
          alt={`${VIEW_LABELS[view]} 촬영 사진`}
          className="mx-auto max-h-96 w-full rounded-lg border border-studio-200 object-contain"
        />
      ) : mode === 'camera' ? (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg border border-studio-200 bg-studio-950">
            <video ref={videoRef} playsInline muted className="mx-auto max-h-96 w-full object-contain" />
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/30" />
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/20" />
            </div>
          </div>
          {error && <p className="text-sm text-alert-red">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleCaptureShot} disabled={!isActive} className="btn-primary flex-1">
              촬영하기
            </button>
            <button
              onClick={() => {
                stop()
                setMode('idle')
              }}
              className="btn-secondary"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button onClick={handleOpenCamera} className="btn-primary flex-1">
            카메라로 촬영
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex-1">
            사진 업로드
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>
      )}
    </div>
  )
}
