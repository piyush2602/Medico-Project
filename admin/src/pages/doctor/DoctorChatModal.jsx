import React, { useState, useEffect, useContext, useRef } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import io from 'socket.io-client'
import { AppContext } from '../../context/AppContext'

const DoctorChatModal = ({ appointment, onClose }) => {
    const { dToken, backendUrl } = useContext(DoctorContext)
    const { calculateAge } = useContext(AppContext) || { calculateAge: () => '' } // if not available
    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState('')
    const [socket, setSocket] = useState(null)
    const [uploading, setUploading] = useState(false)
    const chatEndRef = useRef(null)

    // Setup socket connection
    useEffect(() => {
        const newSocket = io(backendUrl)
        setSocket(newSocket)

        newSocket.on('connect', () => {
            newSocket.emit('join_room', { appointmentId: appointment._id })
        })

        newSocket.on('receive_message', (message) => {
            setMessages(prev => [...prev, message])
        })

        return () => newSocket.disconnect()
    }, [backendUrl, appointment._id])

    // Fetch chat history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await axios.post(
                    backendUrl + '/api/doctor/chat/history',
                    { appointmentId: appointment._id },
                    { headers: { dToken } }
                )
                if (data.success) {
                    setMessages(data.messages)
                } else {
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(error.message)
            }
        }
        fetchHistory()
    }, [appointment._id, backendUrl, dToken])

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (attachment = null) => {
        if (!inputText.trim() && !attachment) return

        const messageData = {
            appointmentId: appointment._id,
            sender: 'doctor',
            text: inputText,
            attachment: attachment || { url: '', type: '' }
        }

        // Optimistically add to UI
        const optimisticMessage = { ...messageData, timestamp: Date.now() }
        setMessages(prev => [...prev, optimisticMessage])
        setInputText('')

        // Send via socket (which also saves it to DB)
        socket?.emit('send_message', messageData)
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB")
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('attachment', file)
        formData.append('appointmentId', appointment._id)

        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/chat/upload',
                formData,
                { headers: { dToken } }
            )
            
            if (data.success) {
                // Send the message with attachment
                sendMessage(data.attachment)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setUploading(false)
            e.target.value = null // reset input
        }
    }

    const eraseChat = async () => {
        if (!window.confirm("Are you sure you want to completely erase this chat history? This cannot be undone.")) return;

        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/chat/erase',
                { appointmentId: appointment._id },
                { headers: { dToken } }
            )
            if (data.success) {
                setMessages([])
                toast.success("Chat erased successfully")
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[70vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img 
                            src={appointment.userData.image} 
                            alt="" 
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/30 bg-white"
                        />
                        <div className="text-white">
                            <h3 className="font-semibold text-lg leading-tight">{appointment.userData.name}</h3>
                            <p className="text-green-100 text-sm">Patient Chat</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={eraseChat}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-full transition-colors font-medium shadow-sm"
                            title="Erase Chat History"
                        >
                            Erase Chat
                        </button>
                        <button 
                            onClick={onClose} 
                            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                            No messages yet. Send a message to start the conversation.
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isDoc = msg.sender === 'doctor'
                            return (
                                <div key={i} className={`flex ${isDoc ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                                        isDoc ? 'bg-green-500 text-white rounded-tr-sm' : 'bg-blue-500 text-white rounded-tl-sm'
                                    }`}>
                                        {msg.attachment?.url && (
                                            <div className="mb-2">
                                                {msg.attachment.type === 'image' ? (
                                                    <a href={msg.attachment.url} target="_blank" rel="noreferrer">
                                                        <img src={msg.attachment.url} alt="Attachment" className="max-h-48 rounded-lg object-contain bg-black/5" />
                                                    </a>
                                                ) : (
                                                    <a 
                                                        href={msg.attachment.url} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className={`flex items-center gap-2 p-2 rounded-lg text-sm ${isDoc ? 'bg-white/20' : 'bg-white/20'}`}
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                        View PDF Document
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        {msg.text && <p className="text-[15px] whitespace-pre-wrap">{msg.text}</p>}
                                        <p className={`text-[10px] mt-1 text-right ${isDoc ? 'text-green-100' : 'text-blue-100'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex items-end gap-2">
                        {/* File Upload Button */}
                        <div className="relative">
                            <input 
                                type="file" 
                                id="file-upload" 
                                className="hidden" 
                                accept="image/jpeg, image/png, application/pdf"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            <label 
                                htmlFor="file-upload" 
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors cursor-pointer ${
                                    uploading ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-primary'
                                }`}
                                title="Attach Image or PDF (Max 5MB)"
                            >
                                {uploading ? (
                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                )}
                            </label>
                        </div>
                        
                        {/* Text Input */}
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        sendMessage()
                                    }
                                }}
                                placeholder="Type a message..."
                                className="w-full bg-transparent outline-none resize-none max-h-32 text-sm"
                                rows="1"
                                style={{ minHeight: '24px' }}
                                disabled={uploading}
                            />
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={() => sendMessage()}
                            disabled={!inputText.trim() || uploading}
                            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                inputText.trim() && !uploading
                                    ? 'bg-primary text-white hover:bg-primary/90' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <svg className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-400">Max attachment size: 5MB. Images & PDFs supported.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorChatModal
