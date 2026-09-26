import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const ConditionBadge = ({ grade = 'Good', score, size = 'normal', showScore = false }) => {
  let gradeClass = 'badge-grade-good';
  let icon = <CheckCircle2 size={size === 'sm' ? 12 : 14} />;
  let label = grade;

  if (grade.toLowerCase().includes('like new') || grade.toLowerCase().includes('new')) {
    gradeClass = 'badge-grade-like-new';
    icon = <Sparkles size={size === 'sm' ? 12 : 14} />;
    label = 'Like New';
  } else if (grade.toLowerCase().includes('good')) {
    gradeClass = 'badge-grade-good';
    icon = <ShieldCheck size={size === 'sm' ? 12 : 14} />;
    label = 'Good';
  } else if (grade.toLowerCase().includes('fair')) {
    gradeClass = 'badge-grade-fair';
    icon = <CheckCircle2 size={size === 'sm' ? 12 : 14} />;
    label = 'Fair';
  } else if (grade.toLowerCase().includes('worn')) {
    gradeClass = 'badge-grade-worn';
    icon = <AlertCircle size={size === 'sm' ? 12 : 14} />;
    label = 'Worn';
  }

  const paddingStyle = size === 'sm' 
    ? { padding: '3px 9px', fontSize: '0.74rem' } 
    : size === 'lg' 
    ? { padding: '8px 18px', fontSize: '0.9rem', fontWeight: '700' }
    : { padding: '5px 12px', fontSize: '0.8rem' };

  return (
    <span 
      className={`badge-pill ${gradeClass}`} 
      style={paddingStyle}
      title={score ? `AI Assessment Score: ${score}/100` : `Condition: ${label}`}
    >
      {icon}
      <span>{label}</span>
      {showScore && score && (
        <span style={{ opacity: 0.8, fontWeight: '700', marginLeft: '2px' }}>
          ({score}%)
        </span>
      )}
    </span>
  );
};

export default ConditionBadge;
