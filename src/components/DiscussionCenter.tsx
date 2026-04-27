import React, { useState, useEffect, useRef } from 'react';
import { discussionService } from '../services/discussionService';
import { Paperclip, Loader2, Check, CheckCheck, Mic, Square, Pause, Reply, X } from 'lucide-react';
import { supabase } from "../supabase";
// Helper to get "14:30" format
const formatTime = (isoString: string) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper to get "Today", "Yesterday", or the Date
const formatDateLabel = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); 
};

export default function DiscussionCenter() {
  const [inbox, setInbox] = useState<any[]>([]);
  const [groupedDiscussions, setGroupedDiscussions] = useState<Record<string, any[]>>({});
  
  // The Two-Pane Navigation States
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [activeDiscussion, setActiveDiscussion] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Negotiation Center";
    loadAndGroupInbox();
    
    // NEW: Get the current logged-in user so we know which side to put messages on!
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadAndGroupInbox = async () => {
    const data = await discussionService.getInbox();
    setInbox(data || []);

    // Group the raw list by Buyer ID (Since this is the Seller app)
    const grouped = (data || []).reduce((acc: any, chat: any) => {
      if (!acc[chat.buyer_id]) acc[chat.buyer_id] = [];
      acc[chat.buyer_id].push(chat);
      return acc;
    }, {});
    
    setGroupedDiscussions(grouped);
  };

  const openChat = async (discussion: any) => {
    setActiveDiscussion(discussion);
    const data = await discussionService.getMessages(discussion.id);
    setMessages(data || []);
  };
  // 1. The Tracker: Keeps track of what chat is currently open on your screen
  const activeChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeChatIdRef.current = activeDiscussion ? activeDiscussion.id : null;
  }, [activeDiscussion]);

  // Turn on Real-Time when entering a chat
  useEffect(() => {
    if (!activeDiscussion) return;

    // 1. When we open the chat, ONLY mark as read if the tab is actively visible!
    if (!document.hidden) {
      discussionService.markMessagesAsRead(activeDiscussion.id);
    }

    // 2. Listen for NEW messages and UPDATED statuses
    const unsubscribe = discussionService.subscribeToMessages(activeDiscussion.id, (payload) => {
      
      if (payload.eventType === 'INSERT') {
        setMessages((prev) => [...prev, payload.new]);
        
        // If they send a message, ONLY mark it read if we are actively staring at the screen!
        if (payload.new.sender_id !== currentUserId && !document.hidden) {
          discussionService.markMessagesAsRead(activeDiscussion.id);
        }
      } 
      else if (payload.eventType === 'UPDATE') {
        setMessages((prev) => prev.map((msg) => 
          msg.id === payload.new.id ? payload.new : msg
        ));
      }
    });

    // 3. NEW: If they were minimized, and they click back into the tab, mark as read instantly!
    const handleVisibilityChange = () => {
      if (!document.hidden && activeDiscussion) {
         discussionService.markMessagesAsRead(activeDiscussion.id);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => { 
      unsubscribe(); 
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeDiscussion, currentUserId]);
// 1. Just "hold" the file, do not send it yet!
  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }
    setAttachedFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1 || items[i].type === 'application/pdf') {
        const file = items[i].getAsFile();
        if (file) handleFileSelect(file);
      }
    }
  };

  // 2. The unified Send Function (handles text + files)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || !activeDiscussion || isUploading) return;
    
    setIsUploading(true);
    let finalFileUrl = null;

    // A. If there is a staged file, upload it FIRST
    if (attachedFile) {
      finalFileUrl = await discussionService.uploadFile(attachedFile, activeDiscussion.id);
      if (!finalFileUrl) {
        alert("Failed to upload file.");
        setIsUploading(false);
        return;
      }
    }

    // B. Figure out the text (if they just sent a file, generate text for it)
    let finalContent = inputText.trim();
    if (!finalContent && attachedFile) {
      finalContent = `Attached File: ${attachedFile.name}`;
    }

    // C. Send to database (Update this block!)
    await discussionService.sendMessage(
      activeDiscussion.id, 
      finalContent, 
      'text', 
      finalFileUrl,
      replyingTo ? replyingTo.id : null // Pass the ID if we are replying
    );

    // D. Clear the input bar
    setInputText("");
    setAttachedFile(null);
    setAudioPreviewUrl(null);
    setReplyingTo(null); // Clear the reply preview
    setIsUploading(false);
  };
  // 1. Start the Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      // When we hit stop, hold the audio in the preview box! Do not send it yet!
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
        
        // Put the file in the staging area and create a playable URL for it
        setAttachedFile(audioFile);
        setAudioPreviewUrl(URL.createObjectURL(audioBlob));
        
        // Turn off the red recording light
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Could not access microphone. Please allow microphone permissions in your browser.");
    }
  };
// Pause the recording temporarily
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Resume a paused recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };
  // 2. Stop the Recording (This triggers the upload)
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false); // <--- Reset pause state
    }
  };
// 2. The Smart Global Notification Engine
  useEffect(() => {
    if (!currentUserId) return;

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const globalChannel = supabase
      .channel('global-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
          const newMessage = payload.new;

          // Rule 1: If I sent this message myself, ignore it entirely!
          if (newMessage.sender_id === currentUserId) return;

          // Rule 2: Check the user's current status
          const isAppHidden = document.hidden; 
          const isDifferentChat = newMessage.discussion_id !== activeChatIdRef.current; 

          // Rule 3: ALWAYS play the sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => console.log("Browser requires user interaction first."));

          // Rule 4: Show the custom pop-up
          if (isAppHidden || isDifferentChat) {
             if (Notification.permission === "granted") {
               
               // ---> NEW: Quickly fetch the actual Business Name of the sender! <---
               const { data: profile } = await supabase
                 .from('profiles')
                 .select('business_name')
                 .eq('user_id', newMessage.sender_id)
                 .single();

               const senderName = profile?.business_name || "New Message";
               const messageText = newMessage.content || "📎 Sent an attachment";

               // ---> NEW: Build the branded notification <---
               new Notification(senderName, { 
                 body: messageText,
                 icon: '/logo.svg' // Make sure you have a logo file here!
               });
             }
          }
      })
      .subscribe();

    return () => { supabase.removeChannel(globalChannel); };
  }, [currentUserId]);
  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-800">
      
      {/* ========================================== */}
      {/* LEFT PANE: BUYER LIST                      */}
      {/* ========================================== */}
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col h-full shadow-sm z-10">
        <div className="p-6 border-b border-slate-200 bg-slate-900">
          <h2 className="font-bold text-xl text-white">Active Buyers</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {Object.keys(groupedDiscussions).length === 0 ? (
            <p className="text-center text-slate-400 mt-10 font-medium">No active inquiries.</p>
          ) : (
            Object.keys(groupedDiscussions).map((buyId) => (
              <button
                key={buyId}
                onClick={() => {
                  setSelectedBuyerId(buyId);
                  setActiveDiscussion(null); // Reset back to State A (Item List)
                }}
                className={`w-full text-left p-5 border-b border-slate-100 hover:bg-blue-50 transition-all ${
                  selectedBuyerId === buyId ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                }`}
              >
                <h3 className="font-bold text-slate-800 truncate pr-2">
  {groupedDiscussions[buyId][0]?.business_name}
</h3>
                <p className="text-sm text-slate-500 mt-1">{groupedDiscussions[buyId].length} Active Inquiries</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT PANE: WORKSPACE (STATE A & STATE B)  */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col h-full relative bg-slate-50">
        
        {!selectedBuyerId ? (
          // NO BUYER SELECTED
          <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">
            Select a buyer from the left to view their inquiries.
          </div>
        ) : !activeDiscussion ? (
          
          // STATE A: ITEM LIST FOR THIS BUYER
          <div className="flex-1 overflow-y-auto p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Inquiries from this Buyer</h2>
            <div className="grid gap-4">
              {groupedDiscussions[selectedBuyerId]?.map((chat) => (
                <div key={chat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center hover:shadow-md hover:border-blue-300 transition-all cursor-pointer" onClick={() => openChat(chat)}>
                  <div>
                    <p className="font-bold text-lg text-slate-900 line-clamp-2 pr-4" title={chat.reference_code}>
  {chat.reference_code}
</p>
<p className="text-sm text-slate-500 mt-1 font-medium">
  Started: {chat.created_at ? new Date(chat.created_at).toLocaleDateString() : 'Recently'}
</p>
                  </div>
                  <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors">
                    Open Chat
                  </button>
                </div>
              ))}
            </div>
          </div>
          
        ) : (
          
          // STATE B: PURE TEXT CHAT TIMELINE (NO BLUE BOXES)
          <div className="flex-1 flex flex-col h-full absolute inset-0 bg-white z-20">
            {/* Header with Back Button */}
            <div className="p-5 border-b border-slate-200 shadow-sm flex items-center gap-4 bg-white">
              <button 
                onClick={() => setActiveDiscussion(null)}
                className="text-slate-600 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors"
              >
                ⬅ Back to Inquiries
              </button>
              <div>
                <h3 className="font-bold text-slate-900">Transaction Chat</h3>
                <p className="text-sm text-slate-500 font-mono">REF: {activeDiscussion.offer_id}</p>
              </div>
            </div>

            {/* Messages - Standard Text Only */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.map((msg, index) => {
                // 1. CLEARLY SEPARATE THE FILE TYPES
                const isImage = msg.file_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
                const isAudio = msg.file_url?.match(/\.(webm|mp3|wav|ogg)$/i) != null;
                const isDocument = msg.file_url && !isImage && !isAudio; // Only show document if it's NOT image or audio!
                
                const isMe = msg.sender_id === currentUserId;
                const currentMsgDate = msg.created_at ? new Date(msg.created_at).toDateString() : null;
                const prevMsgDate = index > 0 && messages[index - 1].created_at ? new Date(messages[index - 1].created_at).toDateString() : null;
                const showDateSeparator = currentMsgDate !== prevMsgDate;
                const status = msg.status || 'sent'; 

                return (
                  <React.Fragment key={msg.id}>
                     {showDateSeparator && (
                        <div className="flex justify-center my-4">
                           <span className="bg-slate-200 text-slate-600 text-[11px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">{formatDateLabel(msg.created_at)}</span>
                        </div>
                     )}

                     {/* WRAPPED IN 'group' TO SHOW HOVER BUTTONS */}
    <div className={`group flex flex-col w-full ${isMe ? 'items-end' : 'items-start'} mb-1`}>
       <div className="flex items-center gap-2 max-w-[90%]">
          
          {/* REPLY BUTTON FOR MY MESSAGES (Shows on the left side of the blue bubble) */}
          {isMe && (
            <button onClick={() => setReplyingTo(msg)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-indigo-500 transition-all rounded-full hover:bg-slate-100 flex-shrink-0" title="Reply">
              <Reply className="w-4 h-4" />
            </button>
          )}

          {/* THE MAIN BUBBLE */}
          <div className={`p-3 rounded-2xl shadow-sm flex flex-col gap-1 w-full ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
             
             {/* --- THE QUOTED MESSAGE PREVIEW --- */}
             {msg.reply_to_id && (() => {
                const quotedMsg = messages.find(m => m.id === msg.reply_to_id);
                if (!quotedMsg) return null;
                return (
                  <div onClick={() => setReplyingTo(quotedMsg)} className={`border-l-4 p-2 rounded text-xs mb-1 truncate cursor-pointer transition-colors ${isMe ? 'bg-black/20 border-indigo-300 hover:bg-black/30' : 'bg-slate-100 border-indigo-500 hover:bg-slate-200'}`}>
                    <span className="font-bold opacity-90">{quotedMsg.sender_id === currentUserId ? 'You' : 'Them'}</span><br/>
                    <span className="opacity-80">{quotedMsg.content || '🎤 Voice Note / Attachment'}</span>
                  </div>
                )
             })()}
             
             {/* A. SHOW IMAGE */}
             {isImage && (
                <a href={msg.file_url} target="_blank" rel="noreferrer">
                  <img src={msg.file_url} alt="attachment" className="max-w-full rounded-lg max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity border border-slate-200" />
                </a>
             )}

             {/* B. SHOW AUDIO */}
             {isAudio && (
                <audio controls src={msg.file_url} className="max-w-[220px] sm:max-w-xs outline-none" />
             )}

             {/* C. SHOW DOCUMENT */}
             {isDocument && (
                <a href={msg.file_url} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-colors w-fit ${isMe ? 'bg-indigo-700 text-white' : 'bg-blue-50 text-blue-700'}`}>
                  <Paperclip className="w-5 h-5 flex-shrink-0" />
                  <span className="font-bold text-sm underline truncate max-w-[200px]">Download Document</span>
                </a>
             )}

             {/* D. SHOW TEXT */}
             {msg.content && msg.content !== '🎤 Voice Note' && (
                <p className={`font-medium whitespace-pre-wrap ${isMe ? 'text-white' : 'text-slate-800'}`}>
                  {msg.content}
                </p>
             )}

             {/* THE METADATA ROW (Time and Ticks) */}
             <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                <span>{formatTime(msg.created_at)}</span>
                {isMe && (
                   <span>
                      {status === 'read' ? <CheckCheck className="w-[14px] h-[14px] text-sky-300" /> :
                       status === 'delivered' ? <CheckCheck className="w-[14px] h-[14px]" /> :
                       <Check className="w-[14px] h-[14px]" />}
                   </span>
                )}
             </div>
          </div>

          {/* REPLY BUTTON FOR THEIR MESSAGES (Shows on the right side of the white bubble) */}
          {!isMe && (
            <button onClick={() => setReplyingTo(msg)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-indigo-500 transition-all rounded-full hover:bg-slate-100 flex-shrink-0" title="Reply">
              <Reply className="w-4 h-4 scale-x-[-1]" />
            </button>
          )}
          
       </div>
    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Clean Input Form with Upload & Preview */}
            <div className="p-5 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col gap-3">
              
              {/* THE PREVIEW STAGING AREA */}
              {(attachedFile || audioPreviewUrl) && (
                <div className="flex items-center gap-3 bg-indigo-50 px-4 py-3 rounded-xl w-fit border border-indigo-100">
                   
                   {/* If it's an audio recording, show a player! */}
                   {audioPreviewUrl ? (
                     <audio controls src={audioPreviewUrl} className="h-8 w-[250px] outline-none" />
                   ) : (
                   /* If it's a normal file, show the paperclip */
                     <>
                       <Paperclip className="w-5 h-5 text-indigo-700" />
                       <span className="font-bold text-sm text-indigo-700 max-w-xs truncate">{attachedFile?.name}</span>
                     </>
                   )}

                   {/* Trash Can / Delete Button */}
                   <button 
                     onClick={() => { setAttachedFile(null); setAudioPreviewUrl(null); }} 
                     className="text-indigo-400 hover:text-red-600 ml-2 font-bold p-1 transition-colors"
                     title="Discard"
                   >
                     ✕
                   </button>
                </div>
              )}
              {/* WHATSAPP-STYLE REPLY PREVIEW BOX */}
              {replyingTo && (
                 <div className="flex justify-between items-center bg-slate-100 border-l-4 border-indigo-500 p-3 mx-5 mt-3 rounded-tr-xl rounded-br-xl shadow-sm">
                    <div className="flex flex-col text-sm truncate pr-4">
                       <span className="font-bold text-indigo-600">
                         {replyingTo.sender_id === currentUserId ? 'Replying to yourself' : 'Replying to message'}
                       </span>
                       <span className="text-slate-600 truncate">{replyingTo.content || '🎤 Voice Note / Attachment'}</span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-700 p-1">
                       <X className="w-5 h-5" />
                    </button>
                 </div>
              )}

              <form onSubmit={handleSendMessage} className="flex gap-3 items-center w-full">
                
                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} className="hidden" />

                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isRecording} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50">
                  <Paperclip className="w-6 h-6" />
                </button>

                {/* DYNAMIC MIDDLE AREA: Text Input OR Recording Status */}
                {isRecording ? (
                  <div className={`flex-1 px-5 py-3 border-2 rounded-xl font-bold flex items-center gap-3 transition-colors ${
                     isPaused ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-red-200 bg-red-50 text-red-600 animate-pulse'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-red-600'}`}></div>
                    {isPaused ? "Recording Paused..." : "Recording Audio..."}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onPaste={handlePaste} 
                    placeholder="Type a message or paste an image (Ctrl+V)..."
                    className="flex-1 px-5 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-800 transition-colors"
                  />
                )}
                
                {/* DYNAMIC RIGHT BUTTONS */}
                {!inputText.trim() && !attachedFile ? (
                   isRecording ? (
                     <div className="flex gap-2">
                       {/* Show RESUME or PAUSE button */}
                       {isPaused ? (
                         <button type="button" onClick={resumeRecording} className="bg-amber-500 text-white p-3 rounded-xl hover:bg-amber-600 transition-colors" title="Resume Recording">
                           <Mic className="w-6 h-6" />
                         </button>
                       ) : (
                         <button type="button" onClick={pauseRecording} className="bg-slate-800 text-white p-3 rounded-xl hover:bg-slate-700 transition-colors" title="Pause Recording">
                           <Pause className="w-6 h-6 fill-current" />
                         </button>
                       )}
                       {/* ALWAYS show STOP button to finish */}
                       <button type="button" onClick={stopRecording} className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-colors" title="Finish & Preview">
                         <Square className="w-6 h-6 fill-current" />
                       </button>
                     </div>
                   ) : (
                     <button type="button" onClick={startRecording} disabled={isUploading} className="bg-slate-100 text-slate-600 p-3 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50" title="Start Voice Note">
                       <Mic className="w-6 h-6" />
                     </button>
                   )
                ) : (
                  <button type="submit" disabled={isUploading} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2">
                    {isUploading ? "Sending..." : "Send"}
                  </button>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}