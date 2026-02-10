import { useState } from 'react';
import ApiKeyInput from './components/ApiKeyInput';
import FileUploader from './components/FileUploader';
import EditableTable from './components/EditableTable';
import ExportButton from './components/ExportButton';
import { parseExcelFile } from './utils/excelParser';
import { translateWithAI } from './utils/openRouterTranslator';
import { mapOrderData } from './utils/dataMapper';

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    if (!file) {
      setStatus('Please upload an Excel file first.');
      return;
    }
    if (!apiKey.trim()) {
      setStatus('Please enter your OpenRouter API key.');
      return;
    }

    setProcessing(true);
    setRows([]);

    try {
      setStatus('Reading file...');
      const rawOrders = await parseExcelFile(file);

      if (rawOrders.length === 0) {
        setStatus('No orders found in the file.');
        setProcessing(false);
        return;
      }

      setStatus(`Translating ${rawOrders.length} orders with AI...`);
      const aiResults = await translateWithAI(rawOrders, apiKey, model);

      setStatus('Generating output...');
      const mapped = mapOrderData(rawOrders, aiResults);

      setRows(mapped);
      setStatus(`Done! ${mapped.length} orders converted. Review and edit below, then export.`);
    } catch (err) {
      setStatus('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="h-7 w-7 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h1 className="text-xl font-bold text-gray-900">Order Converter</h1>
          </div>
          <ApiKeyInput
            apiKey={apiKey}
            setApiKey={setApiKey}
            model={model}
            setModel={setModel}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Upload Section */}
        <section>
          <FileUploader onFileSelect={setFile} disabled={processing} />
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleProcess}
              disabled={processing || !file}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-colors cursor-pointer ${
                processing || !file
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {processing && (
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {processing ? 'Processing...' : 'Process'}
            </button>
            {status && (
              <p
                className={`text-sm ${
                  status.startsWith('Error') ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {status}
              </p>
            )}
          </div>
        </section>

        {/* Preview Table */}
        {rows.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Preview ({rows.length} orders)
              </h2>
              <ExportButton rows={rows} />
            </div>
            <EditableTable rows={rows} setRows={setRows} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
