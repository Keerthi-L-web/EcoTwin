import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { formatCO2 } from '../../../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['reportData'],
    queryFn: () => api.get('/reports/data').then((r) => r.data),
  });

  const generatePDF = () => {
    if (!data) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(16, 185, 129);
    doc.text('EcoTwin AI Report', 14, 25);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated for: ${data.user?.name}`, 14, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

    // Footprint Summary
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Carbon Footprint Summary', 14, 58);

    autoTable(doc, {
      startY: 62,
      head: [['Period', 'CO2 Emissions']],
      body: [
        ['Daily', `${data.footprint?.daily ?? 0} kg`],
        ['Weekly', `${data.footprint?.weekly ?? 0} kg`],
        ['Monthly', `${data.footprint?.monthly ?? 0} kg`],
        ['Yearly (est.)', `${data.footprint?.yearly ?? 0} kg`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });

    // By Category
    const catY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Emissions by Category', 14, catY);

    autoTable(doc, {
      startY: catY + 4,
      head: [['Category', 'CO2 (kg)']],
      body: Object.entries(data.byCategory ?? {}).map(([k, v]) => [
        k.charAt(0).toUpperCase() + k.slice(1),
        `${(v as number).toFixed(2)} kg`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });

    // Achievements
    const achY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text('Achievements', 14, achY);

    if (data.achievements?.length > 0) {
      autoTable(doc, {
        startY: achY + 4,
        head: [['Badge', 'Name']],
        body: data.achievements.map((a: { icon: string; name: string }) => [a.icon, a.name]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
      });
    } else {
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text('No achievements earned yet.', 14, achY + 8);
    }

    doc.save('ecotwin-report.pdf');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-50">Reports</h1>
          <p className="text-surface-200/70 mt-1">View and download your sustainability report</p>
        </div>
        <Button onClick={generatePDF} disabled={isLoading || !data}>
          📄 Download PDF
        </Button>
      </section>

      {isLoading ? (
        <p className="text-center py-12 text-surface-200/40">Loading report data...</p>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Footprint Summary</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {[
                  { label: 'Daily', value: data.footprint?.daily },
                  { label: 'Weekly', value: data.footprint?.weekly },
                  { label: 'Monthly', value: data.footprint?.monthly },
                  { label: 'Yearly (est.)', value: data.footprint?.yearly },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <dt className="text-surface-200/70">{item.label}</dt>
                    <dd className="font-semibold text-eco-400">{formatCO2(item.value ?? 0)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Predictions</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-surface-200/70">Next Month</dt>
                  <dd className="font-semibold text-accent-sky">{formatCO2(data.predictions?.nextMonth ?? 0)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-surface-200/70">End of Year</dt>
                  <dd className="font-semibold text-accent-amber">{formatCO2(data.predictions?.endOfYear ?? 0)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-surface-200/70">Trend</dt>
                  <dd className={`font-semibold ${
                    data.predictions?.trend === 'low' ? 'text-eco-400' :
                    data.predictions?.trend === 'moderate' ? 'text-accent-amber' : 'text-accent-rose'
                  }`}>{data.predictions?.trend}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
            <CardContent>
              {data.achievements?.length > 0 ? (
                <ul className="space-y-2">
                  {data.achievements.map((a: { name: string; icon: string }, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span aria-hidden="true">{a.icon}</span>
                      <span className="text-sm">{a.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-surface-200/40">No achievements yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Challenges</CardTitle></CardHeader>
            <CardContent>
              {data.challenges?.length > 0 ? (
                <ul className="space-y-2">
                  {data.challenges.map((c: { name: string; status: string; progress: number }, i: number) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span>{c.name}</span>
                      <span className={c.status === 'completed' ? 'text-eco-400' : 'text-accent-amber'}>
                        {c.status === 'completed' ? '✓ Done' : `${c.progress}%`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-surface-200/40">No challenges</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
