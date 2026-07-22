import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, AlertCircle, Heart, Moon, Zap, Pill, ActivitySquare, FileText, Stethoscope, FlaskConical, FileDown, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface CheckInSummary {
  id: number;
  timestamp: string;
  summary: string;
  mood: string;
  symptoms: string[];
  medications_taken: string[];
  sleep_quality: string;
  energy_level: string;
  concerns: string[];
  ai_insights: string[];
  overall_score: string;
}

interface PrescriptionSummary {
  id: number;
  timestamp: string;
  prescription_date: string;
  doctor_name: string;
  doctor_qualification: string;
  hospital: string;
  patient_name: string;
  patient_age: string;
  patient_gender: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    special_instructions: string;
  }>;
  diagnosis: string;
  symptoms: string;
  advice: string;
  follow_up: string;
  prescription_summary: string;
}

interface ReportSummary {
  id: number;
  timestamp: string;
  report_date: string;
  report_time: string;
  metrics: Array<{
    test_name: string;
    category: string;
    value: string;
    unit: string;
    reference_range: string;
    interpretation: string;
  }>;
  analyzed_metrics: Array<{
    test_name: string;
    status: string;
    value: string;
    unit: string;
    reference_range: string;
    interpretation: string;
  }>;
  overall_health_risk_index: number;
  severity: string;
  critical_flags: string[];
  lab_summary_overview: string;
  key_findings: Array<{
    metric: string;
    value: string;
    interpretation: string;
  }>;
  overall_risk: string;
  recommendations: string[];
  critical_alerts: string[];
}

export default function Summaries() {
  const [checkIns, setCheckIns] = useState<CheckInSummary[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionSummary[]>([]);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("checkins");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchLatestOverallReport = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/latest-overall-report`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.pdf_file_path) {
          setReportId(result.id);
          // Convert backend file path to URL
          const pdfUrl = `${BACKEND_URL}/${result.pdf_file_path}`;
          setPdfPath(pdfUrl);
        }
      } else if (response.status !== 404) {
        // Only log non-404 errors (404 means no report exists yet, which is fine)
        const errorData = await response.json();
        console.error("Error fetching latest overall report:", errorData);
      }
    } catch (error) {
      console.error("Error fetching latest overall report:", error);
    }
  };

  const fetchAllData = async () => {
    try {
      const [checkInsRes, prescriptionsRes, reportsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/checkins/summaries?limit=20`),
        fetch(`${BACKEND_URL}/api/prescriptions/summaries?limit=20`),
        fetch(`${BACKEND_URL}/api/reports/summaries?limit=20`)
      ]);

      const [checkInsData, prescriptionsData, reportsData] = await Promise.all([
        checkInsRes.json(),
        prescriptionsRes.json(),
        reportsRes.json()
      ]);

      if (checkInsData.success) setCheckIns(checkInsData.checkins);
      if (prescriptionsData.success) setPrescriptions(prescriptionsData.prescriptions);
      if (reportsData.success) setReports(reportsData.reports);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchLatestOverallReport();
  }, []);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMoodColor = (mood: string) => {
    const moodLower = mood?.toLowerCase() || '';
    if (moodLower.includes('great') || moodLower.includes('excellent') || moodLower.includes('happy')) {
      return 'default';
    } else if (moodLower.includes('okay') || moodLower.includes('neutral') || moodLower.includes('fair')) {
      return 'secondary';
    } else if (moodLower.includes('tired') || moodLower.includes('stressed') || moodLower.includes('anxious')) {
      return 'destructive';
    }
    return 'outline';
  };

  const getScoreColor = (score: string | number) => {
    const scoreNum = typeof score === 'string' ? parseInt(score) : score;
    if (scoreNum >= 80) return 'text-success';
    if (scoreNum >= 60) return 'text-warning';
    return 'text-critical';
  };

  const getSeverityColor = (severity: string) => {
    const sev = severity?.toLowerCase() || '';
    if (sev.includes('low') || sev.includes('normal')) return 'default';
    if (sev.includes('moderate') || sev.includes('medium')) return 'secondary';
    return 'destructive';
  };

  const handleGenerateOverallReport = async () => {
    setIsGeneratingReport(true);
    setPdfPath(null);
    setReportId(null);

    try {
      const response = await fetch(`${BACKEND_URL}/generate-overall-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        setReportId(result.id);
        // Convert backend file path to URL
        // The backend stores paths like "uploads/overall_reports/OverallReport_xxx.pdf"
        // We need to convert it to a URL the frontend can access
        const pdfUrl = `${BACKEND_URL}/${result.pdf_file_path}`;
        setPdfPath(pdfUrl);
        toast.success('Overall report generated successfully!');
        // Refresh the latest report in case we want to show updated info
        await fetchLatestOverallReport();
      } else {
        throw new Error(result.message || 'Report generation failed');
      }
    } catch (error: any) {
      console.error('Error generating overall report:', error);
      toast.error(error.message || 'Failed to generate overall report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-body text-muted-foreground">Loading your health summaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b border-border bg-card px-5 py-4">
        <Button
          onClick={handleGenerateOverallReport}
          disabled={isGeneratingReport}
          className="flex w-full items-center justify-center gap-2"
        >
          {isGeneratingReport ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating report...
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Prepare overall report
            </>
          )}
        </Button>
        {pdfPath && (
          <a
            href={pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 text-caption text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            View generated PDF report
          </a>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
        <div className="border-b border-border bg-card px-3">
          <TabsList className="bg-transparent">
            <TabsTrigger value="checkins" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Check-ins ({checkIns.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Prescriptions ({prescriptions.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Lab reports ({reports.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="checkins" className="p-5 mt-0">
            {checkIns.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <Heart className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 text-subtitle">No check-ins yet</h3>
                  <p className="text-caption text-muted-foreground">
                    Start your first daily check-in to see summaries here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {checkIns.map((checkIn, index) => (
                  <motion.div
                    key={checkIn.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.25 }}
                  >
                    <Card className="p-5 transition-smooth hover:shadow-md">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h3 className="text-subtitle text-foreground">{formatDate(checkIn.timestamp)}</h3>
                          </div>
                          {checkIn.overall_score && (
                            <p className={`mt-1 text-caption font-medium ${getScoreColor(checkIn.overall_score)}`}>
                              Health score: {checkIn.overall_score}
                            </p>
                          )}
                        </div>
                        {checkIn.mood && (
                          <Badge variant={getMoodColor(checkIn.mood)} className="capitalize">
                            {checkIn.mood}
                          </Badge>
                        )}
                      </div>

                      {checkIn.summary && (
                        <div className="mb-3 rounded-lg bg-muted/50 p-3">
                          <p className="text-body leading-relaxed text-foreground">{checkIn.summary}</p>
                        </div>
                      )}

                      <div className="mb-3 grid grid-cols-2 gap-3">
                        {checkIn.sleep_quality && (
                          <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 p-3">
                            <Moon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                            <div>
                              <p className="text-caption font-medium text-foreground">Sleep</p>
                              <p className="text-caption text-muted-foreground">{checkIn.sleep_quality}</p>
                            </div>
                          </div>
                        )}
                        {checkIn.energy_level && (
                          <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 p-3">
                            <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                            <div>
                              <p className="text-caption font-medium text-foreground">Energy</p>
                              <p className="text-caption text-muted-foreground">{checkIn.energy_level}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {checkIn.symptoms && checkIn.symptoms.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-foreground">
                            <ActivitySquare className="h-4 w-4 text-critical" />
                            Symptoms reported
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {checkIn.symptoms.map((symptom, idx) => (
                              <Badge key={idx} variant="outline" className="bg-critical/10">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {checkIn.medications_taken && checkIn.medications_taken.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-foreground">
                            <Pill className="h-4 w-4 text-success" />
                            Medications taken
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {checkIn.medications_taken.map((med, idx) => (
                              <Badge key={idx} variant="outline" className="bg-success/10">
                                {med}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {checkIn.ai_insights && checkIn.ai_insights.length > 0 && (
                        <div className="rounded-lg bg-primary/10 p-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-primary">
                            <TrendingUp className="h-4 w-4" />
                            AI insights & recommendations
                          </h4>
                          <ul className="space-y-1">
                            {checkIn.ai_insights.map((insight, idx) => (
                              <li key={idx} className="text-body text-foreground">
                                • {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="p-5 mt-0">
            {prescriptions.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <Stethoscope className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 text-subtitle">No prescriptions yet</h3>
                  <p className="text-caption text-muted-foreground">
                    Upload your first prescription to see summaries here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription, index) => (
                  <motion.div
                    key={prescription.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.25 }}
                  >
                    <Card className="p-5 transition-smooth hover:shadow-md">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="text-subtitle text-foreground">
                              {prescription.prescription_date || formatDate(prescription.timestamp)}
                            </h3>
                          </div>
                          {prescription.doctor_name && (
                            <p className="mt-1 text-caption text-muted-foreground">
                              Dr. {prescription.doctor_name}{" "}
                              {prescription.doctor_qualification && `(${prescription.doctor_qualification})`}
                            </p>
                          )}
                          {prescription.hospital && (
                            <p className="text-caption text-muted-foreground">{prescription.hospital}</p>
                          )}
                        </div>
                        {prescription.patient_name && (
                          <div className="text-right">
                            <Badge variant="outline">{prescription.patient_name}</Badge>
                            {(prescription.patient_age || prescription.patient_gender) && (
                              <p className="mt-1 text-caption text-muted-foreground">
                                {prescription.patient_age && `${prescription.patient_age}yr`}
                                {prescription.patient_age && prescription.patient_gender && " • "}
                                {prescription.patient_gender}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {prescription.prescription_summary && (
                        <div className="mb-3 rounded-lg bg-muted/50 p-3">
                          <p className="text-body leading-relaxed text-foreground">
                            {prescription.prescription_summary}
                          </p>
                        </div>
                      )}

                      {prescription.symptoms && (
                        <div className="mb-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-foreground">
                            <ActivitySquare className="h-4 w-4 text-orange-500" />
                            Symptoms
                          </h4>
                          <p className="text-body text-muted-foreground">{prescription.symptoms}</p>
                        </div>
                      )}

                      {prescription.diagnosis && (
                        <div className="mb-3 rounded-lg bg-blue-500/10 p-3">
                          <h4 className="mb-2 text-caption font-medium text-blue-600">Diagnosis</h4>
                          <p className="text-body text-foreground">{prescription.diagnosis}</p>
                        </div>
                      )}

                      {prescription.medicines && prescription.medicines.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-foreground">
                            <Pill className="h-4 w-4 text-success" />
                            Prescribed medications
                          </h4>
                          <div className="space-y-2">
                            {prescription.medicines.map((med, idx) => (
                              <div key={idx} className="flex items-start gap-2 rounded-lg bg-success/10 p-3">
                                <div className="flex-1">
                                  <p className="text-body font-medium text-foreground">{med.name}</p>
                                  <p className="mt-1 text-caption text-muted-foreground">
                                    {med.dosage && `${med.dosage}`}
                                    {med.frequency && ` • ${med.frequency}`}
                                    {med.duration && ` • ${med.duration}`}
                                  </p>
                                  {med.special_instructions && (
                                    <p className="mt-1 text-caption italic text-muted-foreground">
                                      {med.special_instructions}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {prescription.advice && (
                        <div className="mb-3 rounded-lg bg-purple-500/10 p-3">
                          <h4 className="mb-2 text-caption font-medium text-purple-600">Advice</h4>
                          <p className="text-body text-foreground">{prescription.advice}</p>
                        </div>
                      )}

                      {prescription.follow_up && (
                        <div className="rounded-lg bg-yellow-500/10 p-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-yellow-600">
                            <Calendar className="h-4 w-4" />
                            Follow-up
                          </h4>
                          <p className="text-body text-foreground">{prescription.follow_up}</p>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="p-5 mt-0">
            {reports.length === 0 ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                  <FlaskConical className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-2 text-subtitle">No lab reports yet</h3>
                  <p className="text-caption text-muted-foreground">
                    Upload your first lab report to see summaries here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 6) * 0.05, duration: 0.25 }}
                  >
                    <Card className="p-5 transition-smooth hover:shadow-md">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-primary" />
                            <h3 className="text-subtitle text-foreground">
                              {report.report_date || formatDate(report.timestamp)}
                              {report.report_time && ` at ${report.report_time}`}
                            </h3>
                          </div>
                          {report.overall_health_risk_index !== null && (
                            <p
                              className={`mt-1 text-caption font-medium ${getScoreColor(
                                100 - report.overall_health_risk_index
                              )}`}
                            >
                              Health risk index: {report.overall_health_risk_index}
                            </p>
                          )}
                        </div>
                        {report.severity && (
                          <Badge variant={getSeverityColor(report.severity)} className="capitalize">
                            {report.severity}
                          </Badge>
                        )}
                      </div>

                      {report.lab_summary_overview && (
                        <div className="mb-3 rounded-lg bg-muted/50 p-3">
                          <p className="text-body leading-relaxed text-foreground">{report.lab_summary_overview}</p>
                        </div>
                      )}

                      {report.critical_alerts && report.critical_alerts.length > 0 && (
                        <div className="mb-3 rounded-lg border border-critical/20 bg-critical/10 p-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-critical">
                            <AlertCircle className="h-4 w-4" />
                            Critical alerts
                          </h4>
                          <ul className="space-y-1">
                            {report.critical_alerts.map((alert, idx) => (
                              <li key={idx} className="text-body text-critical">
                                • {alert}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.analyzed_metrics && report.analyzed_metrics.length > 0 && (
                        <div className="mb-3">
                          <h4 className="mb-2 text-caption font-medium text-foreground">Test results</h4>
                          <div className="space-y-2">
                            {report.analyzed_metrics.slice(0, 100).map((metric, idx) => (
                              <div key={idx} className="flex items-center justify-between rounded bg-blue-500/10 p-2">
                                <div className="flex-1">
                                  <p className="text-body font-medium text-foreground">{metric.test_name}</p>
                                  <p className="text-caption text-muted-foreground">{metric.reference_range}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-body font-medium">
                                    {metric.value} {metric.unit}
                                  </p>
                                  <Badge
                                    variant={metric.status?.toLowerCase().includes("abnormal") ? "destructive" : "outline"}
                                    className="text-caption"
                                  >
                                    {metric.status || "Normal"}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {report.analyzed_metrics.length > 100 && (
                              <p className="pt-2 text-center text-caption text-muted-foreground">
                                +{report.analyzed_metrics.length - 100} more tests
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {report.recommendations && report.recommendations.length > 0 && (
                        <div className="rounded-lg bg-primary/10 p-3">
                          <h4 className="mb-2 flex items-center gap-2 text-caption font-medium text-primary">
                            <TrendingUp className="h-4 w-4" />
                            Recommendations
                          </h4>
                          <ul className="space-y-1">
                            {report.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-body text-foreground">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}