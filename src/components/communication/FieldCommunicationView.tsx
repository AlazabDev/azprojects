import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { WhatsAppMessage, ProjectPhase, Project } from '../../types';
import { playAlertChime } from '../../utils/alertEngine';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  Mic, 
  Play, 
  Pause,
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
  Check,
  RefreshCw,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  ArrowUpRight,
  Unlink,
  Link2,
  Calendar,
  AlertCircle,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Maximize2,
  Download,
  Share2,
  CheckCircle2,
  X,
  Eye
} from 'lucide-react';

// Preset real-world construction field update scenarios
const FIELD_SIMULATION_PRESETS = [
  {
    title: 'فحص صب أعمدة وكمرات الخرسانة',
    senderName: 'م. سالم القحطاني (مهندس الموقع)',
    senderPhone: '+966 50 123 7788',
    messageText: 'تم بحمد الله استكمال صب أعمدة الدور الأول بالخرسانة المقاومة C35، وتم أخذ 6 مكعبات خرسانية لاختبار الكسر بعد 7 و28 يوماً. مرفق صورة الأعمدة أثناء الدمك.',
    mediaType: 'image/jpeg',
    mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=1000&auto=format&fit=crop&q=80',
    mediaName: 'صب_أعمدة_الدور_الأول_فحص.jpg',
    classifiedType: 'photo' as const,
    suggestedPhaseName: 'التنفيذ والبناء الميداني'
  },
  {
    title: 'اعتماد تشكيل مشربيات وأرابيسك CNC',
    senderName: 'ورشة العزب للأرابيسك والتطريز المعماري',
    senderPhone: '+966 11 445 6677',
    messageText: 'السلام عليكم مهندسنا، جهزنا العينة الأولى من قواطع المشربية الخشبية المزخرفة هندسياً بتقنية الـ CNC سماكة 25 مم مدهونة بدهان مقاوم للرطوبة. نرجو الاعتماد للشحن للموقع.',
    mediaType: 'image/jpeg',
    mediaUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
    mediaName: 'عينة_أرابيسك_مشربية_معتمدة.jpg',
    classifiedType: 'modification' as const,
    suggestedPhaseName: 'أعمال الأرابيسك والتشطيبات الفاخرة'
  },
  {
    title: 'تقرير فحص السلامة والوقاية من الحريق',
    senderName: 'م. طارق الخضير (استشاري السلامة والدفاع المدني)',
    senderPhone: '+966 55 112 3344',
    messageText: 'مرفق تقرير التفتيش الميداني الدوري لمخارج الطوارئ ومسارات الهروب ونظام الرش الآلي وفق كود البناء السعودي SBC 801. تم معالجة جميع الملاحظات بنجاح.',
    mediaType: 'application/pdf',
    mediaUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/examples/learning/helloworld.pdf',
    mediaName: 'تقرير_سلامة_الموقع_معتمد.pdf',
    classifiedType: 'report' as const,
    suggestedPhaseName: 'التراخيص والموافقات الرسمية'
  },
  {
    title: 'توريد رخام ستاتوريو إيطالي للموقع',
    senderName: 'مؤسسة الحرمين للرخام والجرانيت',
    senderPhone: '+966 54 998 1122',
    messageText: 'وصلت شاحنة الرخام الإيطالي الفاخر ستاتوريو نخب أول مقاس 120×240 سم إلى موقع الفيلا. تم فحص الألواح وتأكيد سلامتها من أي شروخ وجاهزة للتركيب الميكانيكي.',
    mediaType: 'image/jpeg',
    mediaUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1000&auto=format&fit=crop&q=80',
    mediaName: 'توريد_رخام_ستاتوريو_الموقع.jpg',
    classifiedType: 'photo' as const,
    suggestedPhaseName: 'التنفيذ والبناء الميداني'
  },
  {
    title: 'تسجيل صوتي: استلام أعمال عزل الأساسات',
    senderName: 'م. خالد الصالحي (المقاول التنفيذي)',
    senderPhone: '+966 50 441 9922',
    messageText: 'تسجيل صوتي ميداني: استلمنا طبقة العزل المائي للأساسات بسماكة 4 مم مع حماية البورد، والفحص بالماء لمدة 48 ساعة أثبت نجاح العزل بنسبة 100%.',
    mediaType: 'audio/mp3',
    mediaUrl: '',
    mediaName: 'تسجيل_صوتي_استلام_العزل.mp3',
    classifiedType: 'report' as const,
    suggestedPhaseName: 'البنية التحتية والأساسات'
  }
];

export const FieldCommunicationView: React.FC = () => {
  const { 
    whatsAppMessages, 
    addWhatsAppMessage, 
    assignWhatsAppMessage,
    linkWhatsAppMessageToPhase,
    unlinkWhatsAppMessageFromPhase,
    projects, 
    phases, 
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    setNavigationTab,
    triggerConfetti
  } = useApp();

  // Active selected message
  const [selectedMessageId, setSelectedMessageId] = useState<string>(whatsAppMessages[0]?.id || '');
  const selectedMessage = whatsAppMessages.find(m => m.id === selectedMessageId) || whatsAppMessages[0] || null;

  // View modes: 'stream' (Feed & Inspector) vs 'matrix' (Phase Kanban Grid)
  const [activeViewMode, setActiveViewMode] = useState<'stream' | 'matrix'>('stream');

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlinked' | 'linked' | 'media' | 'reports'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Auto-Stream simulation state
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastPingTime, setLastPingTime] = useState<string>('الآن');
  const autoStreamIntervalRef = useRef<any>(null);

  // Audio simulation playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Modals
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showPhaseLinkModal, setShowPhaseLinkModal] = useState(false);
  const [modalMessageTarget, setModalMessageTarget] = useState<WhatsAppMessage | null>(null);
  const [selectedPhaseToLink, setSelectedPhaseToLink] = useState<string>('');
  const [showImageZoom, setShowImageZoom] = useState(false);

  // Field Quick Reply state
  const [replyText, setReplyText] = useState('');
  const [replySentSuccess, setReplySentSuccess] = useState(false);

  // Manual simulation form
  const [simForm, setSimForm] = useState({
    senderName: FIELD_SIMULATION_PRESETS[0].senderName,
    senderPhone: FIELD_SIMULATION_PRESETS[0].senderPhone,
    messageText: FIELD_SIMULATION_PRESETS[0].messageText,
    mediaType: FIELD_SIMULATION_PRESETS[0].mediaType,
    mediaUrl: FIELD_SIMULATION_PRESETS[0].mediaUrl,
    mediaName: FIELD_SIMULATION_PRESETS[0].mediaName,
    classifiedType: FIELD_SIMULATION_PRESETS[0].classifiedType,
    targetProjectId: selectedProjectId || projects[0]?.id || '',
    targetPhaseId: ''
  });

  // Calculate stats
  const totalMessagesCount = whatsAppMessages.length;
  const linkedMessagesCount = whatsAppMessages.filter(m => !!m.assignedToPhaseId).length;
  const unlinkedMessagesCount = whatsAppMessages.filter(m => !m.assignedToPhaseId).length;
  const mediaMessagesCount = whatsAppMessages.filter(m => !!(m.mediaUrls && m.mediaUrls.length > 0)).length;
  const linkingPercentage = totalMessagesCount > 0 ? Math.round((linkedMessagesCount / totalMessagesCount) * 100) : 0;

  // Real-time ping simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLastPingTime(`${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Live Auto-Stream engine
  useEffect(() => {
    if (isLiveStreaming) {
      autoStreamIntervalRef.current = setInterval(() => {
        // Pick a random preset
        const randomPreset = FIELD_SIMULATION_PRESETS[Math.floor(Math.random() * FIELD_SIMULATION_PRESETS.length)];
        
        // Find a suitable project & phase match
        const targetProj = projects[Math.floor(Math.random() * projects.length)] || projects[0];
        const projPhases = phases.filter(p => p.projectId === targetProj.id);
        const matchedPhase = projPhases.find(p => p.name.includes(randomPreset.suggestedPhaseName)) || projPhases[0];

        addWhatsAppMessage({
          senderName: randomPreset.senderName,
          senderPhone: randomPreset.senderPhone,
          messageText: randomPreset.messageText,
          mediaType: randomPreset.mediaType,
          mediaUrls: randomPreset.mediaUrl ? [randomPreset.mediaUrl] : [],
          mediaName: randomPreset.mediaName,
          messageType: randomPreset.mediaType.includes('image') ? 'image' : (randomPreset.mediaType.includes('pdf') ? 'document' : 'text'),
          status: 'received',
          classifiedType: randomPreset.classifiedType,
          projectId: targetProj.id,
          projectName: targetProj.name
        });

        if (soundEnabled) {
          playAlertChime('normal');
        }
      }, 25000); // Trigger every 25s when auto-stream is enabled
    } else {
      if (autoStreamIntervalRef.current) {
        clearInterval(autoStreamIntervalRef.current);
      }
    }

    return () => {
      if (autoStreamIntervalRef.current) {
        clearInterval(autoStreamIntervalRef.current);
      }
    };
  }, [isLiveStreaming, soundEnabled, projects, phases, addWhatsAppMessage]);

  // Audio voice note simulation effect
  useEffect(() => {
    let audioTimer: any;
    if (isPlayingAudio) {
      audioTimer = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 5;
        });
      }, 200);
    }
    return () => clearInterval(audioTimer);
  }, [isPlayingAudio]);

  // Filtered messages
  const filteredMessages = useMemo(() => {
    return whatsAppMessages.filter(msg => {
      // Status filter
      if (statusFilter === 'unlinked' && msg.assignedToPhaseId) return false;
      if (statusFilter === 'linked' && !msg.assignedToPhaseId) return false;
      if (statusFilter === 'media' && (!msg.mediaUrls || msg.mediaUrls.length === 0)) return false;
      if (statusFilter === 'reports' && msg.classifiedType !== 'report') return false;

      // Project filter
      if (projectFilter !== 'all' && msg.projectId !== projectFilter) return false;

      // Phase filter
      if (phaseFilter !== 'all' && msg.assignedToPhaseId !== phaseFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSender = msg.senderName.toLowerCase().includes(query);
        const matchesPhone = msg.senderPhone.toLowerCase().includes(query);
        const matchesText = msg.messageText?.toLowerCase().includes(query);
        const matchesPhase = msg.assignedToPhaseName?.toLowerCase().includes(query);
        const matchesProject = msg.projectName?.toLowerCase().includes(query);
        const matchesMedia = msg.mediaName?.toLowerCase().includes(query);
        return matchesSender || matchesPhone || matchesText || matchesPhase || matchesProject || matchesMedia;
      }

      return true;
    });
  }, [whatsAppMessages, statusFilter, projectFilter, phaseFilter, searchQuery]);

  // Available phases for the active project filter
  const selectablePhases = useMemo(() => {
    if (projectFilter !== 'all') {
      return phases.filter(p => p.projectId === projectFilter);
    }
    return phases;
  }, [phases, projectFilter]);

  // Open phase link modal for a specific message
  const handleOpenPhaseLinkModal = (msg: WhatsAppMessage) => {
    setModalMessageTarget(msg);
    setSelectedPhaseToLink(msg.assignedToPhaseId || '');
    setShowPhaseLinkModal(true);
  };

  // Submit phase link
  const handleConfirmPhaseLink = (phaseId: string) => {
    if (!modalMessageTarget || !phaseId) return;

    linkWhatsAppMessageToPhase(modalMessageTarget.id, phaseId);
    setShowPhaseLinkModal(false);
    setModalMessageTarget(null);

    if (soundEnabled) {
      playAlertChime('high');
    }
  };

  // Direct fast-link from inline button
  const handleQuickLinkDirect = (msgId: string, phaseId: string) => {
    linkWhatsAppMessageToPhase(msgId, phaseId);
    if (soundEnabled) {
      playAlertChime('normal');
    }
  };

  // Unlink message from phase
  const handleUnlink = (msgId: string) => {
    unlinkWhatsAppMessageFromPhase(msgId);
  };

  // Submit manual simulation
  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find(p => p.id === simForm.targetProjectId);
    const phs = phases.find(p => p.id === simForm.targetPhaseId);

    addWhatsAppMessage({
      senderName: simForm.senderName,
      senderPhone: simForm.senderPhone,
      messageText: simForm.messageText,
      mediaType: simForm.mediaType,
      mediaUrls: simForm.mediaUrl ? [simForm.mediaUrl] : [],
      mediaName: simForm.mediaName,
      messageType: simForm.mediaType.includes('image') ? 'image' : (simForm.mediaType.includes('pdf') ? 'document' : 'text'),
      status: simForm.targetPhaseId ? 'assigned' : 'received',
      classifiedType: simForm.classifiedType,
      projectId: simForm.targetProjectId || undefined,
      projectName: proj?.name,
      assignedToPhaseId: simForm.targetPhaseId || undefined,
      assignedToPhaseName: phs?.name
    });

    if (soundEnabled) {
      playAlertChime('high');
    }

    setShowSimulateModal(false);
  };

  // Apply preset to simulation form
  const applyPreset = (preset: typeof FIELD_SIMULATION_PRESETS[0]) => {
    setSimForm(prev => ({
      ...prev,
      senderName: preset.senderName,
      senderPhone: preset.senderPhone,
      messageText: preset.messageText,
      mediaType: preset.mediaType,
      mediaUrl: preset.mediaUrl,
      mediaName: preset.mediaName,
      classifiedType: preset.classifiedType
    }));
  };

  // Quick reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    setReplySentSuccess(true);
    setTimeout(() => {
      setReplySentSuccess(false);
      setReplyText('');
    }, 2500);
  };

  // Find active phase object for selected message
  const activePhase = phases.find(p => p.id === selectedMessage?.assignedToPhaseId);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Top Architectural Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-green-950 text-white p-6 rounded-2xl border border-emerald-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-green-500/20">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    الاتصالات الميدانية ومراسلات واتساب اللحظية
                  </h1>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-500/20 text-green-300 border border-green-500/40 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                    Webhook مباشر نشط
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 mt-1 max-w-2xl leading-relaxed">
                  متابعة التحديثات والصور الميدانية الواردة من مهندسي الموقع والمقاولين لحظياً عبر واتساب، وربطها مباشرة بالمراحل التنفيذية المعمارية والإنشائية للمشاريع.
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Controls Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Auto-Stream toggle */}
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                isLiveStreaming 
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
              title="تفعيل البث اللحظي التلقائي لمحاكاة استقبال تحديثات الموقع المباشرة"
            >
              <Radio className={`w-4 h-4 ${isLiveStreaming ? 'animate-pulse text-slate-950' : 'text-emerald-400'}`} />
              <span>{isLiveStreaming ? 'البث اللحظي نشط' : 'تشغيل البث اللحظي'}</span>
            </button>

            {/* Sound alert toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs font-bold border transition ${
                soundEnabled 
                  ? 'bg-white/15 text-white border-white/20' 
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
              title={soundEnabled ? 'تنبيهات الصوت مفعلة' : 'تنبيهات الصوت معطلة'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Simulate message modal button */}
            <button
              onClick={() => setShowSimulateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>محاكاة رسالة / وسائط موقع</span>
            </button>
          </div>

        </div>

        {/* Live Status Sub-strip */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] text-emerald-200/80 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              بوابة واتساب: <strong className="text-white">API v22.0 Cloud</strong>
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              آخر استجابة: <strong className="text-white font-mono">{lastPingTime}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-emerald-100">
            <span>نسبة ربط المراسلات بالمراحل:</span>
            <div className="w-24 bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${linkingPercentage}%` }}
              />
            </div>
            <strong className="font-mono text-white">{linkingPercentage}%</strong>
          </div>
        </div>

      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Updates */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold">إجمالي الاتصالات الميدانية</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalMessagesCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold">تحديث موقع</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">تشمل الرسائل، الصور والتقارير</p>
        </div>

        {/* Unlinked Messages Alert */}
        <div 
          onClick={() => setStatusFilter('unlinked')}
          className={`cursor-pointer p-4 rounded-2xl border transition shadow-xs ${
            unlinkedMessagesCount > 0 
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 hover:border-amber-400' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400">بانتظار الربط بمرحلة</span>
            <Unlink className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{unlinkedMessagesCount}</span>
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">
              تتطلب توجيه
            </span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300/80 mt-1">انقر للتصفية السريعة والربط</p>
        </div>

        {/* Linked to Phase */}
        <div 
          onClick={() => setStatusFilter('linked')}
          className="cursor-pointer bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold">مربوطة بالمراحل التنفيذية</span>
            <Link2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">{linkedMessagesCount}</span>
            <span className="text-[10px] text-blue-600 font-bold">مرحلة موثقة</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">مدرجة في سجلات وضبط الجودة</p>
        </div>

        {/* Media & Photos */}
        <div 
          onClick={() => setStatusFilter('media')}
          className="cursor-pointer bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-bold">المرفقات والوسائط الهندسية</span>
            <ImageIcon className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">{mediaMessagesCount}</span>
            <span className="text-[10px] text-purple-600 font-bold">صور ووثائق</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">مزامنة تلقائية مع مستندات CAD</p>
        </div>

      </div>

      {/* View Switcher & Search / Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
            <button
              onClick={() => setActiveViewMode('stream')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeViewMode === 'stream'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>موجز المراسلات والمستعرض</span>
            </button>

            <button
              onClick={() => setActiveViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeViewMode === 'matrix'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>مصفوفة المراحل التنفيذية (Phase Matrix)</span>
            </button>
          </div>

          {/* Project & Phase Scope Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={projectFilter}
                onChange={(e) => {
                  setProjectFilter(e.target.value);
                  setPhaseFilter('all');
                }}
                className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none font-medium cursor-pointer"
              >
                <option value="all">كافة المشاريع</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Specific Phase Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none font-medium cursor-pointer max-w-[180px] truncate"
              >
                <option value="all">كافة المراحل التنفيذية</option>
                {selectablePhases.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'كافة الرسائل' },
              { id: 'unlinked', label: `بانتظار الربط (${unlinkedMessagesCount})`, highlight: unlinkedMessagesCount > 0 },
              { id: 'linked', label: `مربوطة بمراحل (${linkedMessagesCount})` },
              { id: 'media', label: `صور ومرفقات (${mediaMessagesCount})` },
              { id: 'reports', label: 'تقارير رسمية' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : tab.highlight
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في الرسائل، المهندسين والمراحل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs pr-9 pl-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Main Content Area based on View Mode */}
      {activeViewMode === 'stream' ? (
        /* STREAM & INSPECTOR VIEW (2 Columns) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 5 Cols: Message Feed */}
          <div className="lg:col-span-5 space-y-3">
            
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                قائمة التحديثات الميدانية ({filteredMessages.length})
              </span>
              <span className="text-[11px] text-slate-400">مرتبة حسب الأحدث</span>
            </div>

            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => {
                  const isSelected = selectedMessage?.id === msg.id;
                  const isLinked = !!msg.assignedToPhaseId;

                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessageId(msg.id)}
                      className={`group p-4 rounded-2xl border transition cursor-pointer relative ${
                        isSelected 
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500/20' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-xs'
                      }`}
                    >
                      {/* Top sender line */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xs">
                            {msg.senderName.slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                              {msg.senderName}
                            </h4>
                            <span className="text-[10px] font-mono text-slate-400" dir="ltr">
                              {msg.senderPhone}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(msg.receivedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Message Text Snippet */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        {msg.messageText || 'مرفق وسائط هندسية من الموقع'}
                      </p>

                      {/* Media indicators */}
                      {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 flex items-center gap-1 border border-blue-200 dark:border-blue-900">
                            {msg.mediaType?.includes('pdf') ? <FileText className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                            <span>{msg.mediaName || 'مرفق هندسي'}</span>
                          </span>
                        </div>
                      )}

                      {/* Phase Linking Tag / Action Bar */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60">
                        {isLinked ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <Layers className="w-3 h-3 text-emerald-600" />
                            <span className="truncate max-w-[190px]">{msg.assignedToPhaseName}</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPhaseLinkModal(msg);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/50 px-2 py-1 rounded-lg border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition"
                          >
                            <Link2 className="w-3 h-3 text-amber-600" />
                            <span>غير مربوط بمرحلة - اربط الآن</span>
                          </button>
                        )}

                        {/* Fast Link Trigger */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPhaseLinkModal(msg);
                          }}
                          className="text-[11px] text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1"
                        >
                          <span>{isLinked ? 'تعديل المرحلة' : 'ربط'}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                  لا توجد رسائل مطابقة لمعايير البحث والتصفية المحددة.
                </div>
              )}
            </div>

          </div>

          {/* Right 7 Cols: Detailed Message Inspector & Phase Linking Studio */}
          <div className="lg:col-span-7 space-y-4">
            
            {selectedMessage ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-5">
                
                {/* Header: Sender & WhatsApp Direct Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedMessage.senderName}
                      </h3>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800" dir="ltr">
                        {selectedMessage.senderPhone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      تاريخ الاستلام: {new Date(selectedMessage.receivedAt).toLocaleString('ar-SA')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Open WhatsApp Web */}
                    <a
                      href={`https://wa.me/${selectedMessage.senderPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح واتساب</span>
                    </a>
                  </div>
                </div>

                {/* THE CORE FOCUS: Project Phase Link Section */}
                <div className={`p-4 rounded-2xl border transition ${
                  selectedMessage.assignedToPhaseId 
                    ? 'bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        المرحلة الهندسية المرتبطة بهذه المراسلة:
                      </span>
                      
                      {selectedMessage.assignedToPhaseId ? (
                        <div className="space-y-1.5">
                          <h4 className="text-base font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{selectedMessage.assignedToPhaseName}</span>
                            <span className="text-xs font-normal text-slate-500">
                              (مشروع: {selectedMessage.projectName})
                            </span>
                          </h4>

                          {activePhase && (
                            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 pt-1">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                إنجاز المرحلة: <strong>{activePhase.progress}%</strong>
                              </span>
                              <span>•</span>
                              <span>الميزانية: <strong>{activePhase.budget.toLocaleString()} ر.س</strong></span>
                              <span>•</span>
                              <span>التسليم: <strong>{activePhase.endDate}</strong></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            هذه المراسلة غير مربوطة بمرحلة هندسية محددة حتى الآن
                          </p>
                          <p className="text-[11px] text-amber-700 dark:text-amber-400">
                            اربط الرسالة ومرفقاتها بمرحلة المشروع لإدراجها تلقائياً في سجلات الجودة، المخططات، وجدول الدفعات.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions for Linking / Unlinking */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {selectedMessage.assignedToPhaseId ? (
                        <>
                          <button
                            onClick={() => handleOpenPhaseLinkModal(selectedMessage)}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
                          >
                            تغيير المرحلة
                          </button>
                          
                          <button
                            onClick={() => handleUnlink(selectedMessage.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                            title="فك ارتباط الرسالة بالمرحلة"
                          >
                            <Unlink className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setNavigationTab('phases')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          >
                            <span>فتح صفحة المراحل</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleOpenPhaseLinkModal(selectedMessage)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 active:scale-95"
                        >
                          <Link2 className="w-4 h-4" />
                          <span>ربط بمرحلة المشروع الآن</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {/* Message Body */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    نص التحديث الوارد:
                  </span>
                  <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                    {selectedMessage.messageText}
                  </p>
                </div>

                {/* Media Inspector: Photos & Documents */}
                {selectedMessage.mediaUrls && selectedMessage.mediaUrls.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>المرفق الهندسي المستلم ({selectedMessage.mediaName || 'ملف الموقع'})</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowImageZoom(true)}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>تكبير وفحص</span>
                        </button>

                        <a
                          href={selectedMessage.mediaUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل</span>
                        </a>
                      </div>
                    </div>

                    {selectedMessage.mediaType?.includes('image') ? (
                      <div 
                        onClick={() => setShowImageZoom(true)}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-[360px] bg-slate-950 cursor-pointer group"
                      >
                        <img
                          src={selectedMessage.mediaUrls[0]}
                          alt="Site Attachment"
                          className="w-full h-full object-contain max-h-[360px] group-hover:scale-102 transition duration-300"
                        />
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>انقر للتكبير عالي الدقة</span>
                        </div>
                      </div>
                    ) : (
                      /* Document / PDF viewer preview card */
                      <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-black">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {selectedMessage.mediaName || 'تقرير هندسي رسمي PDF'}
                            </h5>
                            <span className="text-[10px] text-slate-400">صيغة معتمدة وقابلة للطباعة</span>
                          </div>
                        </div>

                        <a
                          href={selectedMessage.mediaUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>فتح وتحميل المستند</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Voice Note Simulation (If audio) */}
                {selectedMessage.mediaName?.includes('.mp3') && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                        <Mic className="w-4 h-4 text-purple-600" />
                        <span>تسجيل صوتي ميداني من موقع المشروع</span>
                      </span>
                      <span className="text-[10px] font-mono text-purple-700">0:45 دقيقة</span>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md hover:bg-purple-700 transition"
                      >
                        {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 mr-0.5" />}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-purple-200 dark:bg-purple-900 rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-600 h-full rounded-full transition-all"
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>{Math.round((audioProgress / 100) * 45)}s</span>
                          <span>45s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Auto-Classification & Intelligent Matching */}
                <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-bold text-blue-950 dark:text-blue-200">تحليل الذكاء الاصطناعي للميدان: </span>
                      <span className="text-blue-800 dark:text-blue-300">
                        {selectedMessage.classifiedType === 'photo' ? 'توثيق بصري لجودة الأعمال والصبات الخرسانية' : 'تقرير رسمي معتمد وملاحظات تنفيذ'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                    دقة 94%
                  </span>
                </div>

                {/* Field Quick Reply Action */}
                <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    إرسال رد مباشر وتوجيه عبر واتساب:
                  </span>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="اكتب التوجيه أو الرد للمهندس / المقاول في الموقع..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-emerald-500"
                    />

                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال</span>
                    </button>
                  </div>

                  {replySentSuccess && (
                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5" />
                      <span>تم إرسال الرد وتحديث سجل الاتصالات الميدانية بنجاح!</span>
                    </p>
                  )}
                </form>

              </div>
            ) : (
              <div className="p-16 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  اختر رسالة من القائمة لعرض تفاصيلها وربطها بالمراحل الهندسية
                </p>
                <p className="text-xs text-slate-400">
                  يمكنك أيضاً محاكاة وصول رسالة جديدة عبر الزر العلوي.
                </p>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* PHASE MATRIX KANBAN VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                مصفوفة توزيع التحديثات الميدانية حسب مراحل المشروع
              </h3>
              <p className="text-xs text-slate-400">
                عرض شامل للمراحل الهندسية والرسائل والوسائط المرتبطة بكل مرحلة لسهولة التوثيق والتسليم.
              </p>
            </div>
            
            <span className="text-xs font-semibold text-emerald-600">
              {selectablePhases.length} مراحل تنفيذية
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
            
            {/* Unlinked Column First */}
            <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-800 p-4 space-y-3 min-w-[280px]">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200 dark:border-amber-800/60">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">غير مربوطة بمرحلة</h4>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                  {whatsAppMessages.filter(m => !m.assignedToPhaseId).length}
                </span>
              </div>

              <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
                {whatsAppMessages.filter(m => !m.assignedToPhaseId).map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-900 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
                      <span>{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.receivedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {msg.messageText}
                    </p>

                    <button
                      onClick={() => handleOpenPhaseLinkModal(msg)}
                      className="w-full mt-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] transition flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>اختر مرحلة للربط</span>
                    </button>
                  </div>
                ))}

                {whatsAppMessages.filter(m => !m.assignedToPhaseId).length === 0 && (
                  <p className="text-xs text-center text-amber-700/60 py-6">
                    رائع! جميع المراسلات مربوطة بمراحل المشروع.
                  </p>
                )}
              </div>
            </div>

            {/* Columns for Each Phase */}
            {selectablePhases.map((phase) => {
              const phaseMessages = whatsAppMessages.filter(m => m.assignedToPhaseId === phase.id);
              const phaseProject = projects.find(p => p.id === phase.projectId);

              return (
                <div
                  key={phase.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 min-w-[280px] shadow-xs"
                >
                  {/* Phase Column Header */}
                  <div className="pb-2 border-b border-slate-100 dark:border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {phase.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {phaseMessages.length} رسالة
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 truncate">
                      مشروع: {phaseProject?.name}
                    </p>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>إنجاز المرحلة:</span>
                      <strong className="text-emerald-600 font-mono">{phase.progress}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${phase.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Message Cards inside this Phase */}
                  <div className="space-y-2.5 max-h-[540px] overflow-y-auto">
                    {phaseMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2 text-right hover:border-emerald-400 transition"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                          <span>{msg.senderName}</span>
                          <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                            {new Date(msg.receivedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {msg.messageText}
                        </p>

                        {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
                            <ImageIcon className="w-3 h-3" />
                            <span>مرفق وسائط متوفر</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <button
                            onClick={() => handleUnlink(msg.id)}
                            className="text-[10px] text-rose-500 hover:underline flex items-center gap-0.5"
                          >
                            <Unlink className="w-3 h-3" />
                            <span>فك الارتباط</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedMessageId(msg.id);
                              setActiveViewMode('stream');
                            }}
                            className="text-[10px] text-blue-600 hover:underline font-bold"
                          >
                            معاينة وفحص
                          </button>
                        </div>
                      </div>
                    ))}

                    {phaseMessages.length === 0 && (
                      <p className="text-xs text-center text-slate-400 py-6">
                        لا توجد رسائل موثقة لهذه المرحلة حتى الآن.
                      </p>
                    )}
                  </div>

                </div>
              );
            })}

          </div>
        </div>
      )}

      {/* MODAL 1: Phase Linking Selector Modal */}
      {showPhaseLinkModal && modalMessageTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl p-6 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ربط المراسلة بمرحلة مشروع محددة
                  </h3>
                  <p className="text-xs text-slate-400">
                    اختر المرحلة الهندسية المناسبة لتوثيق هذا التحديث وإدراجه في سجلات المشروع.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPhaseLinkModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target message card summary */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>{modalMessageTarget.senderName} ({modalMessageTarget.senderPhone})</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(modalMessageTarget.receivedAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {modalMessageTarget.messageText}
              </p>
            </div>

            {/* Select Phase List */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                المراحل الهندسية المتاحة (انقر للربط المباشر):
              </label>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {phases.map((phase) => {
                  const prj = projects.find(p => p.id === phase.projectId);
                  const isSelected = selectedPhaseToLink === phase.id;

                  return (
                    <div
                      key={phase.id}
                      onClick={() => setSelectedPhaseToLink(phase.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20' 
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {phase.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (مشروع: {prj?.name})
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>إنجاز: <strong>{phase.progress}%</strong></span>
                          <span>•</span>
                          <span>الميزانية: <strong>{phase.budget.toLocaleString()} ر.س</strong></span>
                          <span>•</span>
                          <span>التسليم: <strong>{phase.endDate}</strong></span>
                        </div>
                      </div>

                      <div className="shrink-0 mr-3">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowPhaseLinkModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                إلغاء
              </button>

              <button
                type="button"
                disabled={!selectedPhaseToLink}
                onClick={() => handleConfirmPhaseLink(selectedPhaseToLink)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>تأكيد ربط المراسلة بالمرحلة</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Simulate Incoming WhatsApp Update */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-950 text-green-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    محاكاة وصول تحديث ميداني عبر واتساب
                  </h3>
                  <p className="text-xs text-slate-400">
                    يمكنك اختيار سيناريو جاهز أو إدخال بيانات الرسالة والمرفق يدوياً.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSimulateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets Carousel */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                نماذج وسيناريوهات جاهزة للموقع (انقر للاختيار):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {FIELD_SIMULATION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-400 text-xs font-semibold whitespace-nowrap text-slate-800 dark:text-slate-200 transition"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Form */}
            <form onSubmit={handleSimulateSubmit} className="space-y-3.5 text-xs">
              
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
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نص التحديث الميداني</label>
                <textarea
                  rows={3}
                  required
                  value={simForm.messageText}
                  onChange={(e) => setSimForm({ ...simForm, messageText: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رابط صورة الموقع / المرفق</label>
                <input
                  type="url"
                  value={simForm.mediaUrl}
                  onChange={(e) => setSimForm({ ...simForm, mediaUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Optional direct phase link upon creation */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المشروع المستهدف</label>
                  <select
                    value={simForm.targetProjectId}
                    onChange={(e) => setSimForm({ ...simForm, targetProjectId: e.target.value, targetPhaseId: '' })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ربط بمرحلة فورية (اختياري)</label>
                  <select
                    value={simForm.targetPhaseId}
                    onChange={(e) => setSimForm({ ...simForm, targetPhaseId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">(اتركها غير مربوطة للمطابقة لاحقاً)</option>
                    {phases.filter(p => p.projectId === simForm.targetProjectId).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  إرسال التحديث للمنصة
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 3: Image Zoom Modal */}
      {showImageZoom && selectedMessage?.mediaUrls?.[0] && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setShowImageZoom(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setShowImageZoom(false)}
              className="absolute -top-10 left-0 p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedMessage.mediaUrls[0]}
              alt="Full view"
              className="max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-3 text-center text-white text-xs font-semibold">
              {selectedMessage.mediaName || 'معاينة المرفق الهندسي'} - {selectedMessage.senderName}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
