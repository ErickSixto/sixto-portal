import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { Calendar, ExternalLink, Clock, CheckCircle2, XCircle, AlertCircle, Users } from 'lucide-react';

const statusConfig = {
  'Scheduled': { color: 'bg-blue-500/15 text-blue-400', icon: Clock },
  'Invite Sent': { color: 'bg-indigo-500/15 text-indigo-400', icon: Clock },
  'Tentative': { color: 'bg-accent/15 text-accent', icon: AlertCircle },
  'Rescheduled': { color: 'bg-orange-500/15 text-orange-400', icon: AlertCircle },
  'Cancelled': { color: 'bg-red-500/15 text-red-400', icon: XCircle },
  'Completed': { color: 'bg-green-500/15 text-green-400', icon: CheckCircle2 },
};

export default function MeetingsPage() {
  const { selectedProject } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/meetings`)
      .then(setMeetings).catch(console.error).finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-warm-500 text-center py-20 text-sm">No project selected.</div>;
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const now = new Date().toISOString();
  const upcoming = meetings.filter(m => {
    const dt = m.date_time?.start;
    return dt && dt >= now && m.status !== 'Cancelled' && m.status !== 'Completed';
  });
  const past = meetings.filter(m => !upcoming.includes(m));

  const MeetingCard = ({ meeting }) => {
    const cfg = statusConfig[meeting.status] || statusConfig['Scheduled'];
    const Icon = cfg.icon;
    return (
      <div data-testid={`meeting-${meeting.id}`} className="bg-dark-700 rounded-xl border border-dark-500/40 p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-warm-100">{meeting.name}</h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${cfg.color}`}>
            <Icon size={10} /> {meeting.status || 'Scheduled'}
          </span>
        </div>
        <div className="space-y-1.5 mb-3">
          {meeting.date_time && (
            <div className="flex items-center gap-1.5 text-xs text-warm-400">
              <Calendar size={12} />
              {new Date(meeting.date_time.start).toLocaleString()}
            </div>
          )}
          {meeting.participant && (
            <div className="flex items-center gap-1.5 text-xs text-warm-400">
              <Users size={12} />
              {meeting.participant}
            </div>
          )}
        </div>
        {meeting.meeting_link && (
          <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-light font-medium mb-3"
            data-testid={`meeting-link-${meeting.id}`}
          >
            <ExternalLink size={12} /> Join Meeting
          </a>
        )}
        {meeting.meeting_summary && (
          <div className="mt-3 pt-3 border-t border-dark-500/30">
            <div className="text-[10px] font-semibold text-warm-500 uppercase tracking-wider mb-1">Summary</div>
            <p className="text-xs text-warm-300 leading-relaxed">{meeting.meeting_summary}</p>
          </div>
        )}
        {meeting.notes && (
          <div className="mt-2">
            <div className="text-[10px] font-semibold text-warm-500 uppercase tracking-wider mb-1">Notes</div>
            <p className="text-xs text-warm-400">{meeting.notes}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div data-testid="meetings-page" className="space-y-6">
      <h1 className="text-xl font-bold text-warm-50">Meetings</h1>
      {meetings.length === 0 ? (
        <div className="bg-dark-700 rounded-xl p-12 border border-dark-500/50 text-center">
          <Calendar size={32} className="mx-auto text-warm-600 mb-2" />
          <p className="text-warm-500 text-sm">No meetings scheduled.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-warm-100 mb-2">Upcoming</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {upcoming.map(m => <MeetingCard key={m.id} meeting={m} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-warm-100 mb-2">Past</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {past.map(m => <MeetingCard key={m.id} meeting={m} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
