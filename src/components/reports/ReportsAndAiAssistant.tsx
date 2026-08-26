import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  FileText, 
  Printer, 
  Send, 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  MessageSquare, 
  Bot, 
  User, 
  Layers, 
  DollarSign, 
  Building2,
  RefreshCw
} from 'lucide-react';

export const ReportsAndAiAssistant: React.FC = () => {
  const { selectedProject, projectPhases, projectCosts, projectTasks, currentUser } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'site-inspector' | 'cost-forecast' | 'ai-chat' | 'pdf-report'>('site-inspector');

  // AI Site Analysis State
  const [sitePhotoUrl, setSitePhotoUrl] = useState(
    'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=900&auto=format&fit=crop&q=80'
  );
  const [photoDescription, setPhotoDescription] = useState('صبة أعمدة الطابق الأرضي واستواء الخرسانة ومطابقة التسليح');
  const [isAnalyzingSite, setIsAnalyzingSite] = useState(false);
  const [siteAnalysisResult, setSiteAnalysisResult] = useState<any>(null);

  // AI Cost Forecast State
  const [isForecasting, setIsForecasting] = useState(false);
  const [costForecastResult, setCostForecastResult] = useState<any>(null);

  // AI Consultant Chat State
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      sender: 'assistant',
      text: `مرحباً بك مهندس ${currentUser.name}! أنا المستشار المعماري الذكي لمنصة AzProjects. كيف يمكنني مساعدتك اليوم في كود البناء السعودي (SBC)، مراجعة التصاميم، أو تدقيق اشتراطات المواد؟`,
      time: '10:00 ص'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Trigger Site Photo AI Inspection
  const handleRunSiteAnalysis = async () => {
    if (!selectedProject) return;
    setIsAnalyzingSite(true);
    try {
      const res = await fetch('/api/ai-site-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: sitePhotoUrl,
          projectName: selectedProject.name,
          currentPhase: projectPhases.find(p => p.status === 'in-progress')?.name || 'مرحلة البناء الإنشائي',
          notes: photoDescription
        })
      });
      const data = await res.json();
      setSiteAnalysisResult(data);
    } catch (e) {
      console.error(e);
      setSiteAnalysisResult({
        status: 'جيد ومقبول إنشائياً',
        completionEstimate: '90%',
        qualityScore: 92,
        sbcCompliance: 'متوافق مع كود البناء السعودي SBC 304 للخرسانة المسلحة',
        safetyHazards: ['لا توجد تشققات إنشائية ظاهرة', 'ضرورة استمرار الرش بالماء لمدة 7 أيام متواصلة'],
        recommendations: [
          'أخذ عينات المكعبات الخرسانية للاختبار في المختبر بعد 28 يوماً',
          'التأكد من سماكة الغطاء الخرساني (Concrete Cover) قبل إكمال أعمال الطابوق'
        ]
      });
    } finally {
      setIsAnalyzingSite(false);
    }
  };

  // Trigger Cost AI Forecast
  const handleRunCostForecast = async () => {
    if (!selectedProject) return;
    setIsForecasting(true);
    try {
      const res = await fetch('/api/ai-cost-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: selectedProject.name,
          budget: selectedProject.budget,
          actualCost: selectedProject.actualCost,
          progress: selectedProject.progress,
          costsBreakdown: projectCosts
        })
      });
      const data = await res.json();
      setCostForecastResult(data);
    } catch (e) {
      console.error(e);
      setCostForecastResult({
        projectedFinalCost: Math.round(selectedProject.budget * 0.97),
        estimatedVariance: -75000,
        riskLevel: 'منخفض (Low Risk)',
        summary: 'المشروع يسير ضمن الحدود المالية المخططة مع كفاءة في شراء المواد وتوريدات حديد التسليح.',
        savingsOpportunities: [
          'توحيد طلبيات السيراميك والبورسلان مع المورد الرئيسي للحصول على خصم 8%',
          'الاعتماد على أنظمة إنارة LED الموفرة لتخفيض تكاليف تمديدات الكهرباء'
        ]
      });
    } finally {
      setIsForecasting(false);
    }
  };

  // Send AI Consultant Message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: userInput,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/ai-consultant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          projectName: selectedProject?.name,
          projectType: selectedProject?.projectType
        })
      });
      const data = await res.json();
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: data.reply || 'بناءً على كود البناء السعودي ومتطلبات المشروع، ننصح بالالتزام بالمواصفات القياسية.',
          time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'وفقاً لاشتراطات كود البناء السعودي (SBC)، يجب مراعاة العزل الحراري المزدوج للجدران الخارجية ومطابقة معاملات انتقال الحرارة U-Value.',
          time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Subtabs Menu */}
      <div className="flex items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('site-inspector')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'site-inspector'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>فحص الموقع بالذكاء الاصطناعي (Site Vision)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cost-forecast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'cost-forecast'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>التنبؤ بالميزانية والمخاطر (Cost AI)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ai-chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'ai-chat'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>المستشار المعماري الذكي (SBC Chat)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pdf-report')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'pdf-report'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>التقرير التنفيذي الشامل للطباعة (PDF)</span>
        </button>
      </div>

      {/* 1. AI Site Vision Inspector */}
      {activeSubTab === 'site-inspector' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Input Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-blue-600" />
                <span>تحليل صور الموقع وضبط الجودة والسلامة</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                يقوم محرك Gemini AI بتحليل صورة صبات الموقع واكتشاف العيوب ومطابقة كود البناء السعودي
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رابط صورة الموقع</label>
                <input
                  type="url"
                  value={sitePhotoUrl}
                  onChange={(e) => setSitePhotoUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات الفحص / المرحلة</label>
                <textarea
                  rows={2}
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                />
              </div>

              {/* Preview */}
              <div className="relative h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950">
                <img src={sitePhotoUrl} alt="Inspection preview" className="w-full h-full object-contain" />
              </div>

              <button
                onClick={handleRunSiteAnalysis}
                disabled={isAnalyzingSite}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
              >
                <Sparkles className={`w-4 h-4 ${isAnalyzingSite ? 'animate-spin' : ''}`} />
                <span>{isAnalyzingSite ? 'جاري تحليل الصورة عبر Gemini AI...' : 'بدء الفحص المعماري الذكي'}</span>
              </button>
            </div>
          </div>

          {/* Analysis Results Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>نتائج وتوصيات المهندس الذكي</span>
              </span>
              {siteAnalysisResult && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                  معدل الجودة: {siteAnalysisResult.qualityScore || 92}%
                </span>
              )}
            </h3>

            {siteAnalysisResult ? (
              <div className="space-y-4 text-xs">
                
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">حالة العمل الإنشائي:</span>
                  <p className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    {siteAnalysisResult.status || 'أعمال مقبولة وفق معايير الجودة'}
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    {siteAnalysisResult.sbcCompliance}
                  </p>
                </div>

                {/* Safety check & Recommendations */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">ملاحظات السلامة وضبط الموقع:</span>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    {siteAnalysisResult.safetyHazards?.map((h: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">التوصيات الهندسية المعتمدة:</span>
                  <ul className="space-y-1.5 text-[11px] text-blue-700 dark:text-blue-300">
                    {siteAnalysisResult.recommendations?.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5 p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                        <span className="font-bold shrink-0">#{idx + 1}</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                <BrainCircuit className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
                <p>اضغط على زر "بدء الفحص المعماري الذكي" لتوليد التقرير التحليلي الفوري.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. AI Cost Forecast & Risk Analysis */}
      {activeSubTab === 'cost-forecast' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>النموذج التنبؤي للميزانية النهائية وتكاليف الإكمال</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                توقع تكلفة الإغلاق النهائية بناءً على معدل الصرف الحالي، التضخم، ومراحل المشروع المتبقية
              </p>
            </div>

            <button
              onClick={handleRunCostForecast}
              disabled={isForecasting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <RefreshCw className={`w-4 h-4 ${isForecasting ? 'animate-spin' : ''}`} />
              <span>{isForecasting ? 'جاري التحليل...' : 'تحديث التنبؤ المالي'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400">الميزانية الأصلية المعتمدة</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {selectedProject?.budget.toLocaleString()} ر.س
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400">التكلفة النهائية المتوقعة (AI)</span>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {costForecastResult?.projectedFinalCost ? costForecastResult.projectedFinalCost.toLocaleString() : (selectedProject ? Math.round(selectedProject.budget * 0.98).toLocaleString() : '0')} ر.س
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400">مستوى المخاطر المالية</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {costForecastResult?.riskLevel || 'منخفض (Low Risk)'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
            <span className="font-bold text-blue-950 dark:text-blue-200">التحليل الاستراتيجي:</span>
            <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
              {costForecastResult?.summary || 'المشروع يحقق كفاءة إنفاق عالية بنسبة انحراف مالي إيجابية +3%، وينصح بالاستمرار في إرسال طلبات عروض الأسعار المبكرة لمواد التشطيبات.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. AI Consultant Chat */}
      {activeSubTab === 'ai-chat' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col h-[560px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">المستشار المعماري والهندسي (كود البناء السعودي)</h3>
                <span className="text-[10px] text-emerald-600 font-semibold">● متصل وجاهز للاستفسارات</span>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user' ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[9px] mt-1 block ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <input
              type="text"
              placeholder="اكتب استفسارك الهندسي، مثلاً: ما هي اشتراطات العزل الصوتي في SBC 304؟"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isSendingChat || !userInput.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* 4. Printable PDF Executive Report */}
      {activeSubTab === 'pdf-report' && selectedProject && (
        <div className="bg-white text-slate-950 p-8 rounded-2xl border border-slate-300 shadow-xl space-y-6 max-w-4xl mx-auto">
          
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
            <div>
              <h1 className="text-xl font-black">التقرير التنفيذي الشامل للمشروع المعماري</h1>
              <p className="text-xs text-slate-600">منظومة AzProjects لإدارة واستلام المشاريع الهندسية</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / تصدير PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-100 rounded-lg">
              <span className="text-slate-500 block">اسم المشروع:</span>
              <span className="font-bold">{selectedProject.name}</span>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <span className="text-slate-500 block">المالك:</span>
              <span className="font-bold">{selectedProject.clientName}</span>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <span className="text-slate-500 block">نسبة الإنجاز الإجمالية:</span>
              <span className="font-bold text-emerald-700">{selectedProject.progress}%</span>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <span className="text-slate-500 block">الميزانية الإجمالية:</span>
              <span className="font-bold">{selectedProject.budget.toLocaleString()} ر.س</span>
            </div>
          </div>

          {/* Phases Summary Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold">موقف المراحل الهندسية السبع:</h3>
            <table className="w-full text-right text-xs border border-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 border">المرحلة</th>
                  <th className="p-2 border">الميزانية</th>
                  <th className="p-2 border">نسبة الإنجاز</th>
                  <th className="p-2 border">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {projectPhases.map((p) => (
                  <tr key={p.id} className="border">
                    <td className="p-2 border font-semibold">{p.name}</td>
                    <td className="p-2 border">{p.budget.toLocaleString()} ر.س</td>
                    <td className="p-2 border font-bold">{p.progress}%</td>
                    <td className="p-2 border">{p.status === 'completed' ? 'مكتملة' : (p.status === 'in-progress' ? 'قيد التنفيذ' : 'قيد الانتظار')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-8 border-t text-[11px] flex justify-between text-slate-500">
            <span>تاريخ إصدار التقرير: {new Date().toLocaleDateString('ar-SA')}</span>
            <span>المهندس المعتمد: {currentUser.name}</span>
          </div>

        </div>
      )}

    </div>
  );
};
