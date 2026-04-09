import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { Calendar, ExternalLink, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const statusConfig = {
  'Scheduled': { color: 'bg-blue-50 text-blue-600', icon: Clock },
  'Invite Sent': { color: 'bg-indigo-50 text-indigo-600', icon: Clock },
  'Tentative': { color: 'bg-yellow-50 text-yellow-700', icon: AlertCircle },
  'Rescheduled': { color: 'bg-orange-50 text-orange-600', icon: AlertCircle },
  'Cancelled': { color: 'bg-red-50 text-red-600', icon: XCircle },
  'Completed': { color: 'bg-green-50 text-green-700', icon: CheckCircle2 },
};

export default function MeetingsPage() {
  const { selectedProject } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/meetings`)
      .then(setMeetings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-secondary text-center py-20">No project selected.</div>;
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
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
      <div data-testid={`meeting-${meeting.id}`} className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-charcoal text-sm">{meeting.name}</h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
            <Icon size={12} /> {meeting.status || 'Scheduled'}
          </span>
        </div>
        {meeting.date_time && (
          <div className="flex items-center gap-2 text-sm text-secondary mb-3">
            <Calendar size={14} />
            <span>{new Date(meeting.date_time.start).toLocaleString()}</span>
          </div>
        )}
        {meeting.meeting_link && (
          <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover font-medium mb-3"
            data-testid={`meeting-link-${meeting.id}`}
          >
            <ExternalLink size={14} /> Join Meeting
          </a>
        )}
        {meeting.meeting_summary && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs font-semibold text-secondary mb-1 uppercase">Summary</div>
            <p className="text-sm text-body">{meeting.meeting_summary}</p>
          </div>
        )}
        {meeting.notes && (
          <div className="mt-2">
            <div className="text-xs font-semibold text-secondary mb-1 uppercase">Notes</div>
            <p className="text-sm text-body">{meeting.notes}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div data-testid="meetings-page" className="space-y-8">
      <h1 className="text-2xl font-bold text-charcoal">Meetings</h1>

      {meetings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-border text-center">
          <Calendar size={40} className="mx-auto text-secondary/40 mb-3" />
          <p className="text-secondary">No meetings scheduled for this project.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-charcoal mb-3">Upcoming</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map(m => <MeetingCard key={m.id} meeting={m} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-charcoal mb-3">Past Meetings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {past.map(m => <MeetingCard key={m.id} meeting={m} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
