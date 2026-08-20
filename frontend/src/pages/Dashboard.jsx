import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header.jsx';
import ControlBar from '../components/ControlBar.jsx';
import RepairTimeline from '../components/RepairTimeline.jsx';
import FailurePanel from '../components/FailurePanel.jsx';
import HealingPanel from '../components/HealingPanel.jsx';
import SelectorComparison from '../components/SelectorComparison.jsx';
import ExtractedDataGrid from '../components/ExtractedDataGrid.jsx';
import HistoryDrawer from '../components/HistoryDrawer.jsx';
import LiveLogs from '../components/LiveLogs.jsx';

export default function Dashboard() {
  const [scraper, setScraper] = useState(null);
  const [items, setItems] = useState([]);
  const [validation, setValidation] = useState(null);
  const [failureData, setFailureData] = useState(null);
  const [diagnosisData, setDiagnosisData] = useState(null);
  const [history, setHistory] = useState({ runs: [], healings: [] });
  const [logs, setLogs] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [timelineStage, setTimelineStage] = useState('idle');

  const addLog = (type, message) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ type, message, time }, ...prev.slice(0, 100)]);
  };

  // ── 1. Fetch initial scraper & history ─────────────────────────────────────
  const fetchScraperData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/scrapers');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        const currentScraper = data.data[0];
        setScraper(currentScraper);
        addLog('SYSTEM', `Loaded scraper: '${currentScraper.name}' (${currentScraper.targetDomVersion})`);

        // Fetch history
        fetchHistory(currentScraper._id);

        // Fetch latest results
        const resResults = await fetch(`http://localhost:3001/api/scrapers/${currentScraper._id}/results`);
        const dataResults = await resResults.json();
        if (dataResults.success && dataResults.data) {
          setItems(dataResults.data);
        }
      }
    } catch (err) {
      addLog('FAILURE', `Failed to connect to backend: ${err.message}`);
    }
  };

  const fetchHistory = async (scraperId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/scrapers/${scraperId}/history`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchScraperData();
  }, []);

  // ── 2. Run Scraper ─────────────────────────────────────────────────────────
  const handleRun = async () => {
    if (!scraper) return;
    setLoadingAction('run');
    addLog('SCRAPE', `Initiating scrape on ${scraper.targetDomVersion}...`);

    try {
      const res = await fetch(`http://localhost:3001/api/scrapers/${scraper._id}/run`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        const { runStatus, recordsExtracted, validation: val, failureDiagnosis, items: extractedItems } = data.data;

        setItems(extractedItems || []);
        setValidation(val);

        if (runStatus === 'success') {
          addLog('SCRAPE', `Scrape SUCCESS: Extracted ${recordsExtracted}/${scraper.expectedCount} items in ${data.data.durationMs}ms`);
          addLog('VALIDATION', `100% Schema checks passed (${val.passedChecks}/${val.totalChecks})`);
          setFailureData(null);
          setDiagnosisData(null);
          setTimelineStage('run_success');
          setScraper((prev) => ({ ...prev, status: 'healthy' }));
        } else {
          addLog('FAILURE', `Scrape FAILED: Only ${recordsExtracted}/${scraper.expectedCount} records extracted`);
          addLog('FAILURE', `Primary failed selector: '${failureDiagnosis.primaryFailure?.selector}'`);
          setFailureData({
            brokenSelectors: failureDiagnosis.brokenSelectors,
            expectedRecords: scraper.expectedCount,
            recordsFound: recordsExtracted,
            failureSummary: failureDiagnosis.summary,
          });
          setTimelineStage('broken');
          setScraper((prev) => ({ ...prev, status: 'broken' }));
        }

        fetchHistory(scraper._id);
      }
    } catch (err) {
      addLog('FAILURE', `Error executing scrape: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // ── 3. Break Scraper ───────────────────────────────────────────────────────
  const handleBreak = async () => {
    if (!scraper) return;
    setLoadingAction('break');
    addLog('SYSTEM', '⚡ Intentionally mutating website DOM layout (Simulating refactor)...');

    try {
      const res = await fetch(`http://localhost:3001/api/scrapers/${scraper._id}/break`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setScraper((prev) => ({
          ...prev,
          targetDomVersion: data.data.targetDomVersion,
          status: 'broken',
        }));
        addLog('SYSTEM', `DOM updated to '${data.data.targetDomVersion}'. Existing selectors are now invalid.`);

        // Trigger a run to immediately show the failure state
        handleRun();
      }
    } catch (err) {
      addLog('FAILURE', `Break action failed: ${err.message}`);
      setLoadingAction(null);
    }
  };

  // ── 4. Diagnose & Score Candidates ─────────────────────────────────────────
  const handleDiagnose = async (userHint = '') => {
    if (!scraper) return;
    setLoadingAction('diagnose');
    addLog('DIAGNOSE', `Analyzing DOM tree for failed selectors... (Hint: "${userHint || 'none'}")`);

    try {
      const res = await fetch(`http://localhost:3001/api/scrapers/${scraper._id}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userHint }),
      });
      const data = await res.json();

      if (data.success && data.data.proposedRepairs?.length > 0) {
        const primary = data.data.primaryRepair;
        addLog('DIAGNOSE', `Candidate identified: '${primary.candidateSelector}' with ${primary.confidence}% confidence (${primary.matches} matches)`);
        setDiagnosisData(data.data);
        setTimelineStage('diagnosed');
      } else {
        addLog('DIAGNOSE', data.message || 'No candidate repairs found.');
      }
    } catch (err) {
      addLog('FAILURE', `Diagnosis error: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // ── 5. Apply Heal ──────────────────────────────────────────────────────────
  const handleApplyHeal = async (repairs) => {
    if (!scraper) return;
    setLoadingAction('heal');
    addLog('HEAL', `Applying selector repair: ${repairs[0]?.oldSelector} ➔ ${repairs[0]?.newSelector}`);

    try {
      const res = await fetch(`http://localhost:3001/api/scrapers/${scraper._id}/heal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repairs }),
      });
      const data = await res.json();

      if (data.success) {
        const { scraperStatus, activeSelectors, previousSelectors, recordsExtracted, validation: val, items: healedItems } = data.data;

        setScraper((prev) => ({
          ...prev,
          status: scraperStatus,
          selectors: activeSelectors,
          previousSelectors,
          healingAttemptsCount: (prev.healingAttemptsCount || 0) + 1,
        }));

        setItems(healedItems || []);
        setValidation(val);
        setFailureData(null);
        setDiagnosisData(null);
        setTimelineStage('healed');

        addLog('HEAL', `✨ REPAIR APPLIED! Database schema updated.`);
        addLog('SCRAPE', `Auto-rescrape VERIFIED: ${recordsExtracted}/${scraper.expectedCount} records successfully extracted!`);
        addLog('DB', `Saved healing attempt audit log to MongoDB Atlas.`);

        fetchHistory(scraper._id);
      }
    } catch (err) {
      addLog('FAILURE', `Failed to apply heal: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // ── 6. Reset Baseline ──────────────────────────────────────────────────────
  const handleReset = async () => {
    if (!scraper) return;
    setLoadingAction('reset');
    addLog('SYSTEM', 'Resetting scraper to baseline V1 configuration...');

    try {
      const res = await fetch(`http://localhost:3001/api/scrapers/${scraper._id}/reset`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setScraper(data.data);
        setFailureData(null);
        setDiagnosisData(null);
        setTimelineStage('idle');
        addLog('SYSTEM', 'Scraper reset to baseline V1 successfully.');
        handleRun();
      }
    } catch (err) {
      addLog('FAILURE', `Reset failed: ${err.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen mesh-bg text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header scraper={scraper} loading={Boolean(loadingAction)} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Action Control Bar */}
        <ControlBar
          onRun={handleRun}
          onBreak={handleBreak}
          onDiagnose={() => handleDiagnose()}
          onReset={handleReset}
          loadingAction={loadingAction}
          scraperStatus={scraper?.status}
        />

        {/* Visual Lifecycle Timeline */}
        <RepairTimeline currentStage={timelineStage} status={scraper?.status} />

        {/* Dynamic Failure / Broken State Panel */}
        {failureData && scraper?.status === 'broken' && (
          <FailurePanel
            failureData={failureData}
            onDiagnose={handleDiagnose}
            loading={loadingAction === 'diagnose'}
          />
        )}

        {/* Self-Healing Diagnosis & Repair Candidate Diff */}
        {diagnosisData && (
          <HealingPanel
            diagnosisData={diagnosisData}
            onApplyHeal={handleApplyHeal}
            loading={loadingAction === 'heal'}
          />
        )}

        {/* 2-Column Grid: Selectors & Console */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SelectorComparison
            selectors={scraper?.selectors}
            previousSelectors={scraper?.previousSelectors}
          />
          <LiveLogs logs={logs} onClear={() => setLogs([])} />
        </div>

        {/* Extracted Hotel Cards */}
        <ExtractedDataGrid items={items} validation={validation} />

        {/* Historical Runs & Healing Attempts Audit Drawer */}
        <HistoryDrawer runs={history.runs} healings={history.healings} />

      </main>
    </div>
  );
}
