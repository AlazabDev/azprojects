import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WhatsAppMessage } from '../../types';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Image, 
  FileText, 
  Mic, 
  CheckCheck, 
  Layers, 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Sparkles,
  PhoneCall,
  UserCheck,
  Check
} from 'lucide-react';

export const WhatsAppHub: React.FC = () => {
  const { 
    whatsAppMessages, 
    addWhatsAppMessage, 
    assignWhatsAppMessage, 
    projects, 
    phases, 
    selectedProject,
    currentUser 
  } = useApp();

  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(whatsAppMessages[0] || null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Target project and phase for assignment
  const [targetProjectId, setTargetProjectId] = useState(selectedProject?.id || projects[0]?.id || '');
  const [targetPhaseId, setTargetPhaseId] = useState('');

  // Simulation form
  const [simForm, setSimForm] = useState({
    senderName: 'م. فهد القحطاني (مهندس الموقع)',
    senderPhone: '+966 55 123 4567',
    messageText: 'تم الانتهاء من فحص واختبار صبة الأعمدة الخرسانية، مرفق صورة الموقع لتوثيق التسليم.',
    mediaType: 'image/jpeg',
    mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=900&auto=format&fit=crop&q=80',
    mediaName: 'فحص_أعمدة_الموقع.jpg',
    classifiedType: 'photo' as const
  });

  const availablePhases = phases.filter(p => p.projectId === targetProjectId);

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWhatsAppMessage({
      senderName: simForm.senderName,
      senderPhone: simForm.senderPhone,
      messageText: simForm.messageText,
      mediaType: simForm.mediaType,
      mediaUrls: simForm.mediaUrl ? [simForm.mediaUrl] : [],
      mediaName: simForm.mediaName,
      status: 'received',
      classifiedType: simForm.classifiedType,
      confidenceScore: 0.94
    });

    setShowSimulateModal(false);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    assignWhatsAppMessage(selectedMessage.id, targetProjectId, targetPhaseId || undefined);
    setShowAssignModal(false);
  };

  const filteredMessages = whatsAppMessages.filter(m => 
    m.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.messageText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.senderPhone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-green-900 via-slate-900 to-emerald-950 text-white p-6 rounded-2xl border border-green-800/60 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">مركز وسائط ومراسلات واتساب الموحد (WhatsApp Hub)</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                  Webhook مباشر
                </span>
              </div>
              <p className="text-xs text-green-200">
                استقبال صور الموقع، الفواتير والمخططات تلقائياً من واتساب وتصنيفها وتوجيهها للمشاريع الهندسية
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>محاكاة رسالة / وسائط واردة</span>
          </button>
        </div>

      </div>

      {/* Main 2-Column WhatsApp Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Col: Messages Feed List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs flex flex-col min-h-[580px]">
          
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">صندوق الوارد ({filteredMessages.length})</span>
              <span className="text-[10px] text-green-600 font-bold">● متصل بالخادم</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث في الرسائل والمرسلين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs pr-8 pl-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-700/50 overflow-y-auto max-h-[500px]">
            {filteredMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;

              return (
                <div
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-3.5 cursor-pointer transition text-right space-y-1.5 ${
                    isSelected 
                      ? 'bg-green-50/70 dark:bg-green-950/30 border-r-4 border-green-600' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{msg.senderName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.receivedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {msg.messageText || 'مرفق وسائط هندسية'}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400" dir="ltr">{msg.senderPhone}</span>
                    
                    {msg.status === 'assigned' ? (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>تم التوجيه للمشروع</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                        بانتظار التوجيه
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right 2 Cols: Message Details & Instant Project Router */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedMessage ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
              
              {/* Message Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedMessage.senderName}</h3>
                    <span className="text-xs font-mono text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950 px-2 py-0.5 rounded" dir="ltr">
                      {selectedMessage.senderPhone}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تاريخ الاستلام: {new Date(selectedMessage.receivedAt).toLocaleString('ar-SA')}
                  </p>
                </div>

                {/* Route / Assign Action */}
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <Layers className="w-4 h-4" />
                  <span>توجيه وإدراج في مستندات المشروع</span>
                </button>
              </div>

              {/* Message Content */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">نص الرسالة الواردة:</span>
                <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                  {selectedMessage.messageText}
                </p>
              </div>

              {/* Media Preview (Photo / Document) */}
              {selectedMessage.mediaUrls && selectedMessage.mediaUrls.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-blue-600" />
                    <span>المرفق المستلم من الموقع ({selectedMessage.mediaName || 'صورة'})</span>
                  </span>

                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[380px] bg-black">
                    <img
                      src={selectedMessage.mediaUrls[0]}
                      alt="Site attachment"
                      className="w-full h-full object-contain max-h-[380px]"
                    />
                  </div>
                </div>
              )}

              {/* AI Auto Classification Tag */}
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-blue-950 dark:text-blue-200">التصنيف الذكي التلقائي: </span>
                    <span className="text-blue-800 dark:text-blue-300">
                      {selectedMessage.classifiedType === 'photo' ? 'صورة توثيق ميداني لموقع المشروع' : 'مستند / فاتورة مورد'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-600">دقة 94%</span>
              </div>

              {/* If already assigned */}
              {selectedMessage.status === 'assigned' && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    تم توجيه هذا الملف بنجاح إلى مشروع <strong>{selectedMessage.projectName}</strong>
                    {selectedMessage.assignedToPhaseName && ` - مرحلة (${selectedMessage.assignedToPhaseName})`}
                  </span>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
              اختر رسالة من القائمة لعرض تفاصيلها ومرفقاتها.
            </div>
          )}

        </div>

      </div>

      {/* Assign Message Modal */}
      {showAssignModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">توجيه مرفق واتساب إلى المشروع</h3>
            
            <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المشروع المستهدف *</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white cursor-pointer"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المرحلة الهندسية المرتبطة</label>
                <select
                  value={targetPhaseId}
                  onChange={(e) => setTargetPhaseId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="">(عام للمشروع)</option>
                  {availablePhases.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[11px] text-slate-500">
                سيتم إدراج المرفق تلقائياً في مكتبة مستندات ومخططات المشروع وإشعار فريق العمل.
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700"
                >
                  تأكيد التوجيه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulate Incoming WhatsApp Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">محاكاة رسالة واتساب واردة للموقع</h3>
            
            <form onSubmit={handleSimulateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المرسل</label>
                  <input
                    type="text"
                    required
                    value={simForm.senderName}
                    onChange={(e) => setSimForm({ ...simForm, senderName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف (+966)</label>
                  <input
                    type="text"
                    required
                    value={simForm.senderPhone}
                    onChange={(e) => setSimForm({ ...simForm, senderPhone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نص الرسالة</label>
                <textarea
                  rows={2}
                  value={simForm.messageText}
                  onChange={(e) => setSimForm({ ...simForm, messageText: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رابط صورة الموقع / المرفق</label>
                <input
                  type="url"
                  value={simForm.mediaUrl}
                  onChange={(e) => setSimForm({ ...simForm, mediaUrl: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700"
                >
                  إرسال المحاكاة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
