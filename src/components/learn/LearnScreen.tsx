import React, { useState } from 'react';
import { useTranslation } from '../../localization/LanguageContext';
import { BookOpen, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  summary: string;
  imgUrl?: string;
  lookFor: string[];
  whatToDo: string[];
}

export const LearnScreen: React.FC = () => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string>('art-spoilage');

  const articles: ArticleItem[] = [
    {
      id: 'art-good-silage',
      title: 'What is Good Silage?',
      summary: 'Optimal lactic acid fermentation preserves energy and protein while inhibiting harmful bacteria.',
      imgUrl: '/assets/dairy_farm.jpg',
      lookFor: [
        'Pleasant sweet-sour / vinegar aroma (lactic acid predominance).',
        'Bright greenish-yellow to golden-brown color.',
        'Target pH between 3.8 and 4.2 for corn silage, and 4.0 to 4.5 for grass/sorghum.',
        'Cool temperature: silage face should feel ambient or cold to touch.'
      ],
      whatToDo: [
        'Feed uniformly across the herd ration to balance rumen fiber.',
        'Keep silo face cleanly cut with a silage shear or rake to prevent aeration.'
      ]
    },
    {
      id: 'art-spoilage',
      title: 'Identifying Spoilage & Fungal Mold',
      summary: 'Oxygen exposure triggers aerobic deterioration, yeast proliferation, and mycotoxin hazard.',
      imgUrl: '/assets/spoilage_reference.jpg',
      lookFor: [
        'Visible white, green, or grey velvety fungal patches.',
        'Silage heating up (>35°C or >5°C above ambient temperature).',
        'Pungent, rancid butter smell indicating butyric acid and clostridia.',
        'Dark black or slimy degraded consistency.'
      ],
      whatToDo: [
        'Discard hot or visibly moldy silage immediately. Never feed moldy crust to pregnant or lactating animals.',
        'Increase bunker feed-out rate to at least 15-20 cm face removal daily.',
        'Incorporate broad-spectrum mycotoxin binders in dairy rations if mild field spoilage is suspected.'
      ]
    },
    {
      id: 'art-sampling',
      title: 'How to Collect a Representative Sample',
      summary: 'Accurate screening depends directly on proper representative sample collection.',
      lookFor: [
        'Sample must represent the entire bunker face or feed batch, not just the top layer.'
      ],
      whatToDo: [
        'Collect 4 to 5 small handfuls from different points of the bunker face (upper, middle, lower).',
        'Do not sample directly from the exposed crust or outer wall edge.',
        'Mix the subsamples thoroughly in a clean bucket before filling the SilageSense cup.'
      ]
    },
    {
      id: 'art-ph-importance',
      title: 'Why pH is the Golden Rule of Silage',
      summary: 'pH is a direct indicator of whether beneficial lactic bacteria defeated spoilage organisms.',
      lookFor: [
        'A sharp drop in pH within the first 3 days after sealing preserves nutrients.'
      ],
      whatToDo: [
        'If pH is above 4.6 in maize silage, monitor cows for reduced dry matter intake.',
        'Clean the device pH probe after every test with clean distilled water to prevent protein coating.'
      ]
    },
    {
      id: 'art-lab-testing',
      title: 'When is Laboratory Testing Essential?',
      summary: 'SilageSense provides rapid on-farm screening. Know when to escalate to an accredited lab.',
      lookFor: [
        'Suspected Aflatoxin B1 or DON mycotoxins causing drops in herd milk yield or reproductive issues.',
        'Unexplained diarrhea, mastitis flare-ups, or feed refusal across the dairy herd.',
        'High-value rations needing exact wet chemistry ADF/NDF fiber and protein fractioning.'
      ],
      whatToDo: [
        'Collect a 500g sample in an airtight ziplock bag, chill on ice, and dispatch to an accredited dairy lab.',
        'Log the certified lab results into the SilageSense manual records for historical calibration tracking.'
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)' }}>
          {t.learnTitle}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {t.learnSubtitle}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {articles.map(art => {
          const isExpanded = expandedId === art.id;

          return (
            <div 
              key={art.id} 
              style={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid var(--border-light)', 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden' 
              }}
            >
              {art.imgUrl && (
                <div style={{ height: '140px', width: '100%', overflow: 'hidden' }}>
                  <img src={art.imgUrl} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div 
                style={{ padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => setExpandedId(isExpanded ? '' : art.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {art.title}
                  </h3>
                  {isExpanded ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {art.summary}
                </p>
              </div>

              {isExpanded && (
                <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', marginBottom: '4px' }}>
                      What to Look For:
                    </h4>
                    <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {art.lookFor.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', marginBottom: '4px' }}>
                      What to Do:
                    </h4>
                    <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {art.whatToDo.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
