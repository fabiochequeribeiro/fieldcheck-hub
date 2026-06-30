import { CheckCircle2, Clock3, Rocket, Sparkles } from 'lucide-react';

export function ProductKpi({ icon: Icon, label, value, tone = 'blue' }) {
  return (
    <article className={`ideas-kpi ${tone}`}>
      <div>{Icon ? <Icon size={20} /> : null}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

export function ProductTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="product-tab-bar">
      {tabs.map(({ id, label, icon: Icon, count }) => (
        <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => onChange(id)}>
          <Icon size={17} />
          <span>{label}</span>
          {Number.isFinite(count) ? <b>{count}</b> : null}
        </button>
      ))}
    </div>
  );
}

export function ProductFlow({ status, flow }) {
  const currentIndex = Math.max(0, flow.indexOf(status));
  return (
    <div className="product-flow">
      {flow.map((step, index) => (
        <span key={step} className={index < currentIndex ? 'done' : index === currentIndex ? 'active' : ''}>
          {index < currentIndex ? <CheckCircle2 size={13} /> : index === currentIndex ? <Rocket size={13} /> : <Clock3 size={13} />}
          {step}
        </span>
      ))}
    </div>
  );
}

export function ProductTimeline({ events = [] }) {
  return (
    <div className="lab-timeline">
      <div className="lab-timeline-title"><Sparkles size={15} /> Historico</div>
      {events.map((event, index) => (
        <div key={`${event.title}-${event.date}-${index}`} className="lab-timeline-row">
          <time>{event.date}</time>
          <i />
          <div><strong>{event.title}</strong><span>{event.description}</span></div>
        </div>
      ))}
    </div>
  );
}
