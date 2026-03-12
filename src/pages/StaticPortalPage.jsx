import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaticPortalPage = ({ eyebrow, title, description, primaryAction, secondaryAction, sections = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            <div className="max-w-[1200px] mx-auto px-8 py-10 space-y-8">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
                    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900 px-8 py-10 text-white">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-blue-200">
                            <ShieldCheck size={14} />
                            <span>{eyebrow}</span>
                        </div>
                        <h1 className="mt-4 text-4xl font-black tracking-tight">{title}</h1>
                        <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-200">{description}</p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            {primaryAction && (
                                <button
                                    type="button"
                                    onClick={() => navigate(primaryAction.path)}
                                    className="rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-900 transition-all hover:scale-[1.02] hover:shadow-lg"
                                >
                                    {primaryAction.label}
                                </button>
                            )}
                            {secondaryAction && (
                                <button
                                    type="button"
                                    onClick={() => navigate(secondaryAction.path)}
                                    className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white/20"
                                >
                                    {secondaryAction.label}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-6 p-8 lg:grid-cols-3">
                        {sections.map((section) => (
                            <button
                                key={section.title}
                                type="button"
                                onClick={() => section.path && navigate(section.path)}
                                className={`rounded-2xl border border-slate-200 p-6 text-left transition-all ${section.path ? 'cursor-pointer hover:shadow-lg hover:scale-[1.01]' : 'cursor-default'}`}
                            >
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{section.kicker}</p>
                                <h2 className="mt-3 text-lg font-black text-slate-900">{section.title}</h2>
                                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{section.body}</p>
                                {section.path && (
                                    <div className="mt-5 flex items-center text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                                        <span>Open Module</span>
                                        <ArrowRight size={14} className="ml-2" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaticPortalPage;