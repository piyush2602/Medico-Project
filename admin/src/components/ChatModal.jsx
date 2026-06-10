import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { DoctorContext } from '../context/DoctorContext';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const ChatModal = ({ appointment, onClose }) => {
    const { backendUrl, dToken } = useContext(DoctorContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    const appointmentId = appointment?._id;
    const patientName = appointment?.userData?.name;
    const isOpen = !!appointment;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isOpen) return;

        // Fetch chat history
        const fetchHistory = async () => {
            try {
                const { data } = await axios.post(`${backendUrl}/api/doctor/chat/history`, { appointmentId }, {
                    headers: { dToken }
                });
                if (data.success) {
                    setMessages(data.messages);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error(error);
                toast.error(error.message);
            }
        };

        fetchHistory();

        // Initialize Socket
        socketRef.current = io(backendUrl);
        socketRef.current.emit('join_room', { appointmentId });

        socketRef.current.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [isOpen, appointmentId, backendUrl, dToken]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachment) return;

        let attachmentData = { url: '', type: '' };

        if (attachment) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('attachment', attachment);
            formData.append('appointmentId', appointmentId);
            try {
                const { data } = await axios.post(`${backendUrl}/api/doctor/chat/upload`, formData, {
                    headers: { dToken, 'Content-Type': 'multipart/form-data' }
                });
                if (data.success) {
                    attachmentData = data.attachment;
                } else {
                    toast.error(data.message);
                    setIsUploading(false);
                    return;
                }
            } catch (error) {
                toast.error('Failed to upload attachment');
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
            setAttachment(null);
        }

        const msgData = {
            appointmentId,
            sender: 'doctor',
            text: newMessage,
            attachment: attachmentData
        };

        socketRef.current.emit('send_message', msgData);

        // Optimistic update
        setMessages((prev) => [...prev, { ...msgData, timestamp: Date.now() }]);
        setNewMessage('');
    };

    const eraseChat = async () => {
        if(!window.confirm("Are you sure you want to erase this chat?")) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/doctor/chat/erase`, { appointmentId }, { headers: { dToken }});
            if(data.success) {
                setMessages([]);
                toast.success('Chat erased');
            } else {
                toast.error(data.message);
            }
        } catch(error) {
            toast.error('Failed to erase chat');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                            {patientName?.[0] || 'P'}
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">{patientName}</h2>
                            <p className="text-xs text-green-100">Patient Chat</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={eraseChat} title="Erase Chat" className="p-2 hover:bg-white/20 rounded-full transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <p>No messages yet.</p>
                            <p className="text-sm">Start the conversation with your patient.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isDoctor = msg.sender === 'doctor';
                            return (
                                <div key={idx} className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${isDoctor ? 'bg-green-500 text-white rounded-br-sm' : 'bg-blue-500 text-white rounded-bl-sm'}`}>
                                        {msg.attachment?.url && (
                                            <div className="mb-2">
                                                {msg.attachment.type === 'image' ? (
                                                    <img src={msg.attachment.url} alt="attachment" className="rounded-lg max-h-48 object-cover" />
                                                ) : (
                                                    <a href={msg.attachment.url} target="_blank" rel="noreferrer" className="underline text-sm break-all">
                                                        📎 View PDF Document
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                                        <p className={`text-[10px] mt-1 text-right ${isDoctor ? 'text-green-100' : 'text-blue-100'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    {attachment && (
                        <div className="mb-3 flex items-center justify-between bg-green-50 p-2 rounded-lg border border-green-100 text-sm text-green-700">
                            <span className="truncate max-w-[200px]">{attachment.name}</span>
                            <button onClick={() => setAttachment(null)} className="text-red-500 hover:text-red-700">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <label className="cursor-pointer p-2 text-gray-400 hover:text-green-500 transition rounded-full hover:bg-gray-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={(e) => setAttachment(e.target.files[0])}
                                disabled={isUploading}
                            />
                        </label>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition disabled:opacity-50"
                            disabled={isUploading}
                        />
                        <button
                            type="submit"
                            disabled={isUploading || (!newMessage.trim() && !attachment)}
                            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {isUploading ? (
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
