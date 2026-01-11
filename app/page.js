'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const questions = [
  {
    section: "Understanding the Interest",
    icon: "🎯",
    items: [
      "What made you decide to meet with the recruiter in the first place?",
      "How long have you been thinking about this?",
      "What specifically appeals to you about the Marines versus other branches (Army, Navy, Air Force, Coast Guard)?",
      "What do you think you'd gain from serving that you couldn't get on another path?",
      "Is there anything about your current situation or future plans that you're trying to get away from or avoid?"
    ]
  },
  {
    section: "Comparing Paths: Marines vs. Trades",
    icon: "⚖️",
    items: [
      "What are the pros and cons of enlisting versus starting your apprenticeship this summer?",
      "If you pursue the trades now, what do you think you'd miss out on? What about the reverse?",
      "How do you see your life at age 25 if you enlist? How about if you start your electrical or HVAC apprenticeship instead?",
      "Which path do you think gets you closer to owning your own business, and why?",
      "Have you considered that you could do your apprenticeship now and enlist later, or serve and then pursue the trades after—does the order matter to you?",
      "What would it take for you to feel successful at 30? Which path is more likely to get you there?"
    ]
  },
  {
    section: "MOS (Military Occupation) & Expectations",
    icon: "📋",
    items: [
      "What job (MOS) are you hoping to get in the Marines?",
      "Why that one—what draws you to it?",
      "The Marines assign your MOS based on their needs, your ASVAB scores, and availability. Knowing you may not get your first choice, what's your backup, and would you still enlist if you got something very different?",
      "Describe what you think daily life looks like in your desired MOS after boot camp and training school are finished.",
      "Have you researched which MOSs translate to civilian careers and which don't?"
    ]
  },
  {
    section: "The Hard Realities",
    icon: "⚔️",
    items: [
      "During boot camp, you'll have little to no contact with family, friends, or Bella for approximately 13 weeks. How do you think that will affect you and your relationships?",
      "After training, you could be deployed for months at a time with very limited communication. Describe how you'd handle that—both practically and emotionally.",
      "Marines are often first into combat. Describe what you know about what that actually means and how you've thought about that possibility.",
      "What's the hardest thing you've ever done physically and mentally, and how did you respond when you wanted to quit?",
      "How do you handle authority, especially when you disagree with a decision or think it's unfair?"
    ]
  },
  {
    section: "Relationships & Outside Factors",
    icon: "👥",
    items: [
      "How does Bella feel about this decision?",
      "Be honest with yourself: if Bella weren't leaving for Kentucky, would this still be on your radar?",
      "Our family is planning to move to Florida or Tennessee in the next few years. How does that factor into your thinking, if at all?"
    ]
  },
  {
    section: "Commitment, Contract & Timeline",
    icon: "📅",
    items: [
      "You have a meeting at your trade school this week. What are you hoping to learn from that, and how will it factor into your decision?",
      "After that meeting, how do you plan to weigh what you hear against what the recruiter told you?",
      "When do you feel you need to make this decision by? Why that timeframe?",
      "Is the recruiter suggesting a specific timeline or ship date? If so, what is it and why?",
      "Do you feel any pressure to decide quickly? Where is that pressure coming from?",
      "When would boot camp start if you enlist?",
      "What do you think is a reasonable amount of time to make a decision this significant?",
      "Are you willing to take more time to research, talk to former Marines, and compare paths before committing—even if the recruiter suggests otherwise?",
      "In your own words, explain what you'd be signing up for—length of active duty, reserve obligations (IRR), and what happens if you change your mind after you've enlisted.",
      "What happens if you get injured during service and can't continue? What's your plan?"
    ]
  },
  {
    section: "Financial Considerations",
    icon: "💰",
    items: [
      "Have you compared the financial paths—starting apprentice wages and journeyman pay over four years versus military pay, housing, benefits, and the GI Bill? What do you see as the trade-offs?",
      "How do you plan to handle money while you're in—saving, sending home, or other goals?"
    ]
  },
  {
    section: "Marine Culture & Outside Perspectives",
    icon: "🦅",
    items: [
      "Beyond the job, what do you know about Marine culture, values, and identity? What about that appeals to you or concerns you?",
      "Have you talked to any current or former Marines who aren't recruiters? If not, are you willing to before making a final decision?"
    ]
  }
];

const totalQuestions = questions.reduce((acc, section) => acc + section.items.length, 0);

export default function DrewQuestionnaire() {
  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: answersData } = await supabase
          .from('drew_answers')
          .select('question_key, answer');
        
        if (answersData && answersData.length > 0) {
          const loadedAnswers = {};
          answersData.forEach(row => {
            loadedAnswers[row.question_key] = row.answer;
          });
          setAnswers(loadedAnswers);
          setShowIntro(false);
        }

        const { data: progressData } = await supabase
          .from('drew_progress')
          .select('*')
          .eq('id', 1)
          .single();

        if (progressData?.submitted_at) {
          setSubmitted(true);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const saveAnswer = useCallback(async (key, value) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('drew_answers')
        .upsert({ 
          question_key: key, 
          answer: value,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'question_key' 
        });

      if (error) throw error;
      setLastSaved(new Date());

      const answeredCount = Object.values({ ...answers, [key]: value }).filter(a => a && a.trim().length > 0).length;
      await checkNotifications(answeredCount);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  }, [answers]);

  const checkNotifications = async (answeredCount) => {
    try {
      const { data: progress } = await supabase
        .from('drew_progress')
        .select('*')
        .eq('id', 1)
        .single();

      if (!progress.notified_start && answeredCount >= 1) {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'started' })
        });
        await supabase
          .from('drew_progress')
          .update({ started_at: new Date().toISOString(), notified_start: true })
          .eq('id', 1);
      }

      if (!progress.notified_50 && answeredCount >= Math.floor(totalQuestions / 2)) {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'halfway' })
        });
        await supabase
          .from('drew_progress')
          .update({ reached_50: true, notified_50: true })
          .eq('id', 1);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const handleAnswer = (questionIndex, value) => {
    const key = `${currentSection}-${questionIndex}`;
    setAnswers(prev => ({ ...prev, [key]: value }));
    
    clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
      saveAnswer(key, value);
    }, 1000);
  };

  const getAnswer = (questionIndex) => {
    const key = `${currentSection}-${questionIndex}`;
    return answers[key] || '';
  };

  const answeredCount = Object.values(answers).filter(a => a && a.trim().length > 0).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const handleSubmit = async () => {
    if (!confirm('Are you ready to submit your answers to Mom and Dad? This will send them everything you have written.')) {
      return;
    }

    setSubmitting(true);
    try {
      const compiledAnswers = [];
      let globalIndex = 0;
      questions.forEach((section, sectionIdx) => {
        const sectionAnswers = {
          section: section.section,
          icon: section.icon,
          questions: []
        };
        section.items.forEach((question, qIdx) => {
          globalIndex++;
          const key = `${sectionIdx}-${qIdx}`;
          sectionAnswers.questions.push({
            number: globalIndex,
            question: question,
            answer: answers[key] || '[No answer provided]'
          });
        });
        compiledAnswers.push(sectionAnswers);
      });

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: compiledAnswers, answeredCount, totalQuestions })
      });

      if (!response.ok) throw new Error('Submit failed');

      await supabase
        .from('drew_progress')
        .update({ submitted_at: new Date().toISOString(), notified_submit: true })
        .eq('id', 1);

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('There was an error submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const goToSection = (idx) => {
    setCurrentSection(idx);
  };

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={styles.submittedScreen}>
        <div style={styles.checkmark}>✓</div>
        <h2 style={styles.submittedTitle}>SUBMITTED</h2>
        <p style={styles.submittedText}>
          Your answers have been sent to Mom and Dad. They are proud of you for taking the time to think this through carefully.
        </p>
        <p style={styles.submittedTextSmall}>Semper Fidelis</p>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div style={styles.introScreen}>
        <div style={styles.emblem}>
          <span style={styles.emblemIcon}>🦅</span>
        </div>
        <h1 style={styles.introTitle}>DREW MASTRINO</h1>
        <p style={styles.introSubtitle}>DECISION REFLECTION</p>
        <div style={styles.divider}></div>
        <p style={styles.introText}>
          This is an important decision that deserves careful thought. The following questions 
          are designed to help you think through all aspects of your choice—not to talk you 
          into or out of anything, but to make sure your decision is grounded and clear.
        </p>
        <p style={styles.introText}>
          Take your time. Be honest with yourself. Your answers save automatically 
          so you can come back and continue whenever you are ready.
        </p>
        <p style={styles.introTextSmall}>
          When you are finished, you can submit your responses to Mom and Dad.
        </p>
        <button style={styles.beginButton} onClick={() => setShowIntro(false)}>
          BEGIN REFLECTION
        </button>
        <p style={styles.footerMotto}>Semper Fidelis - Always Faithful</p>
      </div>
    );
  }

  const section = questions[currentSection];

  return (
    <div style={styles.appContainer}>
      <div style={styles.stickyHeader}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.headerIcon}>🦅</span>
            <span style={styles.headerTitle}>DREW MASTRINO</span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.saveStatus}>
              {saving ? 'Saving...' : lastSaved ? 'Saved' : ''}
            </span>
            <span style={styles.progressText}>{answeredCount}/{totalQuestions}</span>
          </div>
        </header>

        <div style={styles.progressBarContainer}>
          <div style={{...styles.progressBar, width: progress + '%'}}></div>
        </div>

        <nav style={styles.sectionNav}>
          {questions.map((s, idx) => {
            const sectionAnswered = s.items.filter((_, qIdx) => {
              const key = idx + '-' + qIdx;
              return answers[key] && answers[key].trim().length > 0;
            }).length;
            const sectionComplete = sectionAnswered === s.items.length;

            return (
              <button
                key={idx}
                style={{
                  ...styles.sectionTab,
                  ...(idx === currentSection ? styles.sectionTabActive : {}),
                  ...(sectionComplete ? styles.sectionTabComplete : {})
                }}
                onClick={() => goToSection(idx)}
              >
                <span style={styles.tabIcon}>{s.icon}</span>
                <span style={styles.tabNumber}>{sectionAnswered}/{s.items.length}</span>
              </button>
            );
          })}
        </nav>

        <div style={styles.sectionHeader}>
          <span style={styles.sectionIcon}>{section.icon}</span>
          <h2 style={styles.sectionTitle}>{section.section}</h2>
        </div>
      </div>

      <main style={styles.main}>
        <div style={styles.questionsContainer}>
          {section.items.map((question, idx) => {
            const globalIdx = questions.slice(0, currentSection).reduce((acc, s) => acc + s.items.length, 0) + idx + 1;
            const hasAnswer = getAnswer(idx).trim().length > 0;

            return (
              <div key={idx} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <span style={styles.questionNumber}>Q{globalIdx}</span>
                  {hasAnswer && <span style={styles.answeredBadge}>✓ Answered</span>}
                </div>
                <p style={styles.questionText}>{question}</p>
                <textarea
                  style={styles.answerInput}
                  placeholder="Type your answer here..."
                  value={getAnswer(idx)}
                  onChange={(e) => handleAnswer(idx, e.target.value)}
                  rows={5}
                />
              </div>
            );
          })}
        </div>

        <div style={styles.navigation}>
          <button
            style={{...styles.navButton, ...(currentSection === 0 ? styles.navButtonDisabled : {})}}
            disabled={currentSection === 0}
            onClick={() => goToSection(currentSection - 1)}
          >
            ← Previous
          </button>

          {currentSection === questions.length - 1 ? (
            <button
              style={styles.submitButton}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit to Mom & Dad →'}
            </button>
          ) : (
            <button
              style={styles.navButton}
              onClick={() => goToSection(currentSection + 1)}
            >
              Next →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
  },
  loadingText: {
    color: '#888',
    fontSize: '16px',
  },
  introScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
  },
  emblem: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #CD1126 0%, #8B0000 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
    boxShadow: '0 8px 32px rgba(205, 17, 38, 0.4)',
    border: '4px solid #D4AF37',
  },
  emblemIcon: {
    fontSize: '60px',
  },
  introTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '36px',
    fontWeight: '700',
    letterSpacing: '8px',
    color: '#D4AF37',
    marginBottom: '8px',
  },
  introSubtitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '14px',
    letterSpacing: '6px',
    color: '#888',
    marginBottom: '30px',
  },
  divider: {
    width: '60px',
    height: '3px',
    background: 'linear-gradient(90deg, transparent, #CD1126, transparent)',
    marginBottom: '30px',
  },
  introText: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#ccc',
    marginBottom: '20px',
    maxWidth: '500px',
  },
  introTextSmall: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '40px',
  },
  beginButton: {
    fontFamily: 'Cinzel, serif',
    background: 'linear-gradient(135deg, #CD1126 0%, #8B0000 100%)',
    color: '#fff',
    border: 'none',
    padding: '18px 56px',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '4px',
    cursor: 'pointer',
    borderRadius: '4px',
    boxShadow: '0 4px 20px rgba(205, 17, 38, 0.4)',
  },
  footerMotto: {
    marginTop: '60px',
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    letterSpacing: '3px',
    color: '#444',
  },
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0a0a',
  },
  stickyHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#0a0a0a',
    borderBottom: '2px solid #333',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: 'rgba(0,0,0,0.4)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
    fontSize: '28px',
  },
  headerTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '18px',
    fontWeight: '600',
    letterSpacing: '4px',
    color: '#D4AF37',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  saveStatus: {
    fontSize: '12px',
    color: '#888',
  },
  progressText: {
    fontFamily: 'Cinzel, serif',
    fontSize: '14px',
    color: '#ccc',
    letterSpacing: '1px',
  },
  progressBarContainer: {
    height: '4px',
    background: '#333',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #CD1126, #D4AF37)',
    transition: 'width 0.4s ease',
  },
  sectionNav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.2)',
    overflowX: 'auto',
  },
  sectionTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 14px',
    background: 'transparent',
    border: '1px solid #444',
    borderRadius: '8px',
    cursor: 'pointer',
    minWidth: '54px',
    color: '#fff',
    flexShrink: 0,
  },
  sectionTabActive: {
    background: 'linear-gradient(135deg, #CD1126 0%, #8B0000 100%)',
    borderColor: '#CD1126',
    boxShadow: '0 2px 12px rgba(205, 17, 38, 0.3)',
  },
  sectionTabComplete: {
    borderColor: '#D4AF37',
  },
  tabIcon: {
    fontSize: '18px',
  },
  tabNumber: {
    fontSize: '10px',
    color: '#888',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    background: '#1a1a1a',
  },
  sectionIcon: {
    fontSize: '28px',
  },
  sectionTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '20px',
    fontWeight: '600',
    letterSpacing: '2px',
    color: '#D4AF37',
  },
  main: {
    flex: 1,
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  questionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  questionCard: {
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #333',
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  questionNumber: {
    fontFamily: 'Cinzel, serif',
    fontSize: '12px',
    fontWeight: '600',
    color: '#CD1126',
    letterSpacing: '2px',
  },
  answeredBadge: {
    fontSize: '11px',
    color: '#4CAF50',
    background: 'rgba(76, 175, 80, 0.15)',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  questionText: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: '#ccc',
    marginBottom: '16px',
  },
  answerInput: {
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '16px',
    color: '#fff',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.6',
    minHeight: '120px',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #333',
  },
  navButton: {
    fontFamily: 'Cinzel, serif',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid #444',
    color: '#fff',
    padding: '14px 28px',
    fontSize: '13px',
    letterSpacing: '2px',
    cursor: 'pointer',
    borderRadius: '6px',
  },
  navButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  submitButton: {
    fontFamily: 'Cinzel, serif',
    background: 'linear-gradient(135deg, #CD1126 0%, #8B0000 100%)',
    border: 'none',
    color: '#fff',
    padding: '14px 32px',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '2px',
    cursor: 'pointer',
    borderRadius: '6px',
    boxShadow: '0 4px 20px rgba(205, 17, 38, 0.3)',
  },
  submittedScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
    background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
  },
  checkmark: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: '#fff',
    marginBottom: '32px',
    boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
  },
  submittedTitle: {
    fontFamily: 'Cinzel, serif',
    fontSize: '32px',
    fontWeight: '600',
    letterSpacing: '6px',
    color: '#D4AF37',
    marginBottom: '20px',
  },
  submittedText: {
    fontSize: '16px',
    color: '#ccc',
    maxWidth: '450px',
    lineHeight: '1.8',
    marginBottom: '24px',
  },
  submittedTextSmall: {
    fontFamily: 'Cinzel, serif',
    fontSize: '14px',
    letterSpacing: '3px',
    color: '#888',
  },
};
