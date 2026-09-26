import React from 'react';
import { X, Building2, MapPin, Clock, ShieldCheck, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CampusHubModal = ({ onClose }) => {
  const { campusHubs } = useApp();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(22, 36, 28, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}
    onClick={onClose}
    >
      <div 
        className="card-white modal-animate" 
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '28px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#F1F5F2',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div className="icon-circle-badge" style={{ width: '32px', height: '32px' }}>
              <Building2 size={16} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-forest)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verified Locker Infrastructure
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem' }}>
            Campus Drop-Off & Pickup Stations
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fully contactless, electronically-locked drop boxes across university campuses. Drop off books in 30 seconds with automated QR verification.
          </p>
        </div>

        {/* List of Hubs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {campusHubs.map((hub) => (
            <div 
              key={hub.id}
              style={{
                border: '1px solid #E2ECE5',
                borderRadius: '16px',
                padding: '16px 20px',
                backgroundColor: '#FAFDFB',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary-forest)',
                      fontSize: '0.72rem',
                      fontWeight: '700'
                    }}>
                      {hub.campus}
                    </span>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: '700', margin: 0 }}>
                      {hub.name}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="var(--primary-forest)" />
                    <span>{hub.address} (PIN: {hub.pinCode})</span>
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#2D6A4F',
                    backgroundColor: '#EAF5EE',
                    padding: '4px 10px',
                    borderRadius: '9999px'
                  }}>
                    <Lock size={11} />
                    {hub.lockersAvailable} Available
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px dashed #E0EAE2',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  <span>{hub.hours}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-forest)', fontWeight: '600' }}>
                  <ShieldCheck size={12} />
                  <span>RFID & QR Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '12px' }} onClick={onClose}>
            Close Locker Directory
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampusHubModal;
