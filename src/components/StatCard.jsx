import React from 'react';

const StatCard = ({ icon: Icon, label, value, subtext, trend, dark = false }) => {
  return (
    <div className={dark ? 'card-dark' : 'card-white'} style={{
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div className={`icon-circle-badge ${dark ? 'dark' : ''}`}>
          {Icon && <Icon size={22} />}
        </div>
        {trend && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: dark ? 'rgba(78, 122, 90, 0.4)' : '#E8EFE9',
            color: dark ? '#A3D9B1' : 'var(--primary-forest)'
          }}>
            {trend}
          </span>
        )}
      </div>

      <div style={{
        fontSize: '2rem',
        fontWeight: '800',
        fontFamily: 'var(--font-serif)',
        color: dark ? '#FAF6EC' : 'var(--text-main)',
        lineHeight: '1.2',
        marginBottom: '6px'
      }}>
        {value}
      </div>

      <div style={{
        fontSize: '0.9rem',
        fontWeight: '600',
        color: dark ? '#C4D4C8' : 'var(--text-main)',
        marginBottom: '4px'
      }}>
        {label}
      </div>

      {subtext && (
        <div style={{
          fontSize: '0.78rem',
          color: dark ? 'rgba(250, 246, 236, 0.6)' : 'var(--text-muted)'
        }}>
          {subtext}
        </div>
      )}
    </div>
  );
};

export default StatCard;
