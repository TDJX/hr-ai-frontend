'use client'

import { useState, useEffect, useRef } from 'react'
import { Room, RoomEvent, Track, RemoteTrack, LocalTrack } from 'livekit-client'
import { useTracks, RoomAudioRenderer, LiveKitRoom, useRoomContext } from '@livekit/components-react'
import { useInterviewToken } from '@/hooks/useResume'
import { useForceEndInterview } from '@/hooks/useSession'
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface InterviewSessionProps {
  resumeId: number
  sessionId?: number
  onEnd?: () => void
}

interface InterviewState {
  isConnected: boolean
  isRecording: boolean
  isMuted: boolean
  isSpeaking: boolean
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed'
  error?: string
}

export default function InterviewSession({ resumeId, onEnd }: InterviewSessionProps) {
  const { data: tokenData, isLoading, error } = useInterviewToken(resumeId, true)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Подключаемся к собеседованию
        </h2>
        <p className="text-gray-600 text-center max-w-md">
          Пожалуйста, подождите, мы подготавливаем для вас сессию
        </p>
      </div>
    )
  }

  if (error || !tokenData?.token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Ошибка подключения
        </h2>
        <p className="text-gray-600 text-center max-w-md mb-6">
          Не удалось подключиться к сессии собеседования
        </p>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Вернуться назад
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LiveKitRoom
        token={tokenData.token}
        serverUrl={tokenData.serverUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL!}
        audio={true}
        video={false}
        onConnected={() => console.log('Connected to LiveKit')}
        onDisconnected={() => console.log('Disconnected from LiveKit')}
        onError={(error) => {
          console.error('LiveKit error:', error)
        }}
      >
        <InterviewRoom resumeId={resumeId} onEnd={onEnd} sessionId={tokenData.session_id} />
      </LiveKitRoom>
    </div>
  )
}

function InterviewRoom({ resumeId, onEnd, sessionId }: InterviewSessionProps) {
  const room = useRoomContext()
  const tracks = useTracks([Track.Source.Microphone, Track.Source.ScreenShare], {
    onlySubscribed: false,
  })

  const forceEndMutation = useForceEndInterview()

  const [state, setState] = useState<InterviewState>({
    isConnected: false,
    isRecording: false,
    isMuted: false,
    isSpeaking: false,
    connectionState: 'connecting'
  })

  const [interviewStarted, setInterviewStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [aiSpeaking, setAiSpeaking] = useState(false)

  useEffect(() => {
    if (!room) return

    const handleConnected = () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        connectionState: 'connected'
      }))
      // Начинаем собеседование
      startInterview()
    }

    const handleDisconnected = () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionState: 'disconnected'
      }))
      if (onEnd) {
        onEnd()
      }
    }

    const handleDataReceived = (payload: Uint8Array, participant: any) => {
      try {
        const message = JSON.parse(new TextDecoder().decode(payload))
        handleServerMessage(message)
      } catch (error) {
        console.error('Error parsing server message:', error)
      }
    }

    room.on(RoomEvent.Connected, handleConnected)
    room.on(RoomEvent.DataReceived, handleDataReceived)

    return () => {
      room.off(RoomEvent.Connected, handleConnected)
      room.off(RoomEvent.DataReceived, handleDataReceived)
    }
  }, [room])

  const startInterview = async () => {
    if (!room) return

    try {
      // Отправляем сигнал серверу о начале собеседования
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify({
          type: 'start_interview',
          resumeId
        })),
        { reliable: true }
      )
      setInterviewStarted(true)
    } catch (error) {
      console.error('Error starting interview:', error)
    }
  }

  const handleServerMessage = (message: any) => {
    switch (message.type) {
      case 'question':
        setCurrentQuestion(message.text)
        setAiSpeaking(true)
        break
      case 'ai_speaking_start':
        setAiSpeaking(true)
        break
      case 'ai_speaking_end':
        setAiSpeaking(false)
        break
      case 'interview_started':
        break
      case 'interview_complete':
        // Собеседование завершено
        if (onEnd) onEnd()
        break
      default:
        console.log('Unknown message type:', message.type)
    }
  }

  const toggleMute = async () => {
    if (!room) return

    try {
      const audioTrack = room.localParticipant.getTrackPublication(Track.Source.Microphone)
      if (audioTrack) {
        if (state.isMuted) {
          await audioTrack.unmute()
        } else {
          await audioTrack.mute()
        }
        setState(prev => ({ ...prev, isMuted: !prev.isMuted }))
      }
    } catch (error) {
      console.error('Error toggling mute:', error)
    }
  }

  const endInterview = async () => {
    if (!room) return

    try {
      // Если есть sessionId, используем force-end API
      if (sessionId) {
        console.log('Starting force-end mutation for sessionId:', sessionId)
        await forceEndMutation.mutateAsync(sessionId)
        console.log('Force-end mutation completed successfully')
      }

      // Отправляем сигнал серверу о завершении собеседования
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify({
          type: 'end_interview',
          resumeId
        })),
        { reliable: true }
      )

      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionState: 'disconnected'
      }))

      // Отключение происходит только после успешного выполнения всех операций
      room.disconnect()
      console.log('About to call onEnd - this will cause redirect')
      // Временно отключаем редирект для проверки логов
      if (onEnd) onEnd()
    } catch (error) {
      console.error('Error ending interview:', error)
      // В случае ошибки всё равно отключаемся
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionState: 'disconnected'
      }))
      room.disconnect()
      if (onEnd) onEnd()
    }
  }

  const getConnectionStatusColor = () => {
    switch (state.connectionState) {
      case 'connected':
        return 'text-green-600'
      case 'connecting':
        return 'text-yellow-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <RoomAudioRenderer />

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Volume2 className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Собеседование со Стефани
          </h1>
          <p className={`text-sm ${getConnectionStatusColor()}`}>
            {state.connectionState === 'connected' && 'Подключено'}
            {state.connectionState === 'connecting' && 'Подключение...'}
            {state.connectionState === 'disconnected' && 'Отключено'}
            {state.connectionState === 'failed' && 'Ошибка подключения'}
          </p>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              {aiSpeaking && <Loader className="h-4 w-4 text-blue-600 animate-spin mr-2" />}
              <span className="text-sm font-medium text-blue-800">
                {aiSpeaking ? 'HR Агент говорит...' : 'Текущий вопрос:'}
              </span>
            </div>
            <p className="text-blue-900">{currentQuestion}</p>
          </div>
        )}

        {!interviewStarted && state.isConnected && (
          <div className="text-center text-gray-600 mb-6">
            Ожидаем начала собеседования...
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center space-x-6 mb-6">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              state.isMuted
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            {state.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          <button
            onClick={endInterview}
            className="p-4 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Для начала диалога поприветствуйте интервьюера</p>
          <p>В процессе говорите четко и ждите, пока агент закончит свой вопрос</p>
          <p>Собеседование завершится автоматически</p>
          <p>Экстренно завершить собеседование можно, нажав красную кнопку</p>
        </div>
      </div>
    </div>
  )
}
