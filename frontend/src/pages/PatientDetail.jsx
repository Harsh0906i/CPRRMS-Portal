import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchPatientById } from '../features/patientSlice';
import { addTreatment, editTreatment, removeTreatment } from '../features/treatmentSlice';
import { uploadReportFile, uploadNewVersion, fetchReportHistory, removeReport, clearHistory } from '../features/reportSlice';
import { addReceipt } from '../features/receiptSlice';
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  FileText,
  CreditCard,
  Plus,
  History,
  Trash2,
  Download,
  Upload,
  Edit,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function PatientDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { currentPatient, loading, error } = useSelector(state => state.patients);
  const { history: reportVersions } = useSelector(state => state.reports);

  // Tab state
  const [activeTab, setActiveTab] = useState('clinical');

  // Modals state
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Treatment Form State
  const [treatmentForm, setTreatmentForm] = useState({
    treatmentType: 'Chemotherapy',
    startDate: '',
    endDate: '',
    status: 'Active',
    cycleNumber: 1,
    dosage: '',
    treatingDoctor: '',
    notes: '',
    followUpDate: ''
  });
  const [editingTreatmentId, setEditingTreatmentId] = useState(null);

  // Report Form State
  const [reportForm, setReportForm] = useState({
    reportName: '',
    reportType: 'Pathology',
    file: null
  });
  const [parentReportId, setParentReportId] = useState(null); // For versioning

  // Receipt Form State
  const [receiptForm, setReceiptForm] = useState({
    amount: '',
    paymentMode: 'Cash',
    description: ''
  });

  useEffect(() => {
    dispatch(fetchPatientById(id));
  }, [id, dispatch]);

  const refreshPatient = () => {
    dispatch(fetchPatientById(id));
  };

  // --- TREATMENT SUBMISSIONS ---
  const handleTreatmentSubmit = e => {
    e.preventDefault();
    const payload = { ...treatmentForm, patientId: id };
    
    if (editingTreatmentId) {
      dispatch(editTreatment({ id: editingTreatmentId, treatmentData: payload })).then(() => {
        refreshPatient();
        closeTreatmentModal();
      });
    } else {
      dispatch(addTreatment(payload)).then(() => {
        refreshPatient();
        closeTreatmentModal();
      });
    }
  };

  const openEditTreatment = t => {
    setEditingTreatmentId(t._id);
    setTreatmentForm({
      treatmentType: t.treatmentType,
      startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '',
      endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : '',
      status: t.status,
      cycleNumber: t.cycleNumber || 1,
      dosage: t.dosage || '',
      treatingDoctor: t.treatingDoctor,
      notes: t.notes || '',
      followUpDate: t.followUpDate ? new Date(t.followUpDate).toISOString().split('T')[0] : ''
    });
    setShowTreatmentModal(true);
  };

  const handleDeleteTreatment = tId => {
    if (window.confirm('Delete this treatment record?')) {
      dispatch(removeTreatment(tId)).then(() => refreshPatient());
    }
  };

  const closeTreatmentModal = () => {
    setShowTreatmentModal(false);
    setEditingTreatmentId(null);
    setTreatmentForm({
      treatmentType: 'Chemotherapy',
      startDate: '',
      endDate: '',
      status: 'Active',
      cycleNumber: 1,
      dosage: '',
      treatingDoctor: '',
      notes: '',
      followUpDate: ''
    });
  };

  // --- REPORT SUBMISSIONS ---
  const handleReportSubmit = e => {
    e.preventDefault();
    if (!reportForm.file) return;

    const formData = new FormData();
    formData.append('file', reportForm.file);
    formData.append('patientId', id);
    formData.append('reportName', reportForm.reportName);
    formData.append('reportType', reportForm.reportType);

    if (parentReportId) {
      dispatch(uploadNewVersion({ id: parentReportId, formData })).then(() => {
        refreshPatient();
        closeReportModal();
      });
    } else {
      dispatch(uploadReportFile(formData)).then(() => {
        refreshPatient();
        closeReportModal();
      });
    }
  };

  const handleDeleteReport = rId => {
    if (window.confirm('Delete this medical report?')) {
      dispatch(removeReport(rId)).then(() => refreshPatient());
    }
  };

  const openVersionUpload = rId => {
    setParentReportId(rId);
    setShowReportModal(true);
  };

  const openHistoryView = rId => {
    dispatch(fetchReportHistory(rId));
    setShowHistoryModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setParentReportId(null);
    setReportForm({ reportName: '', reportType: 'Pathology', file: null });
  };

  // --- RECEIPT SUBMISSIONS ---
  const handleReceiptSubmit = e => {
    e.preventDefault();
    const payload = {
      ...receiptForm,
      amount: parseFloat(receiptForm.amount),
      patientId: id
    };

    dispatch(addReceipt(payload)).then(() => {
      refreshPatient();
      setShowReceiptModal(false);
      setReceiptForm({ amount: '', paymentMode: 'Cash', description: '' });
    });
  };

  const handleDownloadReceipt = rId => {
    window.open(`/api/receipts/${rId}/pdf`, '_blank');
  };

  if (loading && !currentPatient) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!currentPatient) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-xl">
        <p className="text-muted-foreground">Patient profile not found.</p>
      </div>
    );
  }

  const birthDate = new Date(currentPatient.dob);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  return (
    <div className="space-y-6">
      {/* 1. Profile Header Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-primary text-primary-foreground border border-primary/20 flex items-center justify-center font-bold text-2xl shadow-inner">
            {currentPatient.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight">{currentPatient.name}</h2>
              <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-mono bg-primary/10 text-primary border border-primary/20">
                {currentPatient.patientId}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {age} years old • <span className="font-semibold">{currentPatient.gender}</span> • Blood Group:{' '}
              <span className="font-bold text-red-500">{currentPatient.bloodGroup || 'Unknown'}</span>
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-1.5">
              <span className="flex items-center">
                <Phone className="mr-1.5 h-3.5 w-3.5" />
                {currentPatient.contactNumber}
              </span>
              {currentPatient.email && (
                <span className="flex items-center font-mono">
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  {currentPatient.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Header Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            to={`/patients/edit/${currentPatient._id}`}
            className="inline-flex items-center justify-center px-4 py-2 border border-border bg-card font-semibold rounded-lg text-sm shadow-sm hover:bg-accent transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Registry Profile
          </Link>
        </div>
      </div>

      {/* Grid: Details Sidebar & Main Contents Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Demographics details card */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              Demographic Directory
            </h3>

            {/* Address */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center">
                <MapPin className="mr-1.5 h-3 w-3" /> Address Details
              </span>
              <p className="text-xs font-semibold pl-4.5">{currentPatient.address?.street || 'No street'}</p>
              <p className="text-xs text-muted-foreground pl-4.5">
                {currentPatient.address?.city}, {currentPatient.address?.district}
              </p>
              <p className="text-xs text-muted-foreground pl-4.5">
                {currentPatient.address?.state} - {currentPatient.address?.pinCode}
              </p>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1.5 pt-2 border-t border-border/50">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Emergency Contact</span>
              <div className="pl-1 space-y-1">
                <p className="text-xs font-bold">{currentPatient.emergencyContact?.name}</p>
                <p className="text-xs text-muted-foreground">
                  Relation: <span className="font-semibold">{currentPatient.emergencyContact?.relationship}</span>
                </p>
                <p className="text-xs text-muted-foreground">Phone: {currentPatient.emergencyContact?.contactNumber}</p>
              </div>
            </div>
          </div>

          {/* Cancer Clinical Profile */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              Oncology Profile
            </h3>

            {currentPatient.cancerDetails ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Diagnostic Type</span>
                  <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                    {currentPatient.cancerDetails.cancerType}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Staging</span>
                    <p className="text-xs font-semibold">{currentPatient.cancerDetails.stage}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Status</span>
                    <p className="text-xs font-semibold">{currentPatient.cancerDetails.status}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Oncologist In-Charge</span>
                  <p className="text-xs font-medium">{currentPatient.cancerDetails.primaryPhysician}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Diagnosis Date</span>
                  <p className="text-xs font-medium">
                    {new Date(currentPatient.cancerDetails.diagnosisDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No active diagnosis recorded.</p>
            )}
          </div>
        </div>

        {/* Right Side: Tabbed Views */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs Header */}
          <div className="flex border-b border-border bg-card rounded-xl p-1 shadow-sm">
            {[
              { id: 'clinical', label: 'Clinical Regimens', icon: HeartPulse },
              { id: 'reports', label: 'Medical Reports', icon: FileText },
              { id: 'billing', label: 'Billing Invoices', icon: CreditCard }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <TabIcon className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB CONTENT: CLINICAL / TREATMENTS */}
          {activeTab === 'clinical' && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Regimen History</h3>
                <button
                  onClick={() => setShowTreatmentModal(true)}
                  className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Schedule Treatment
                </button>
              </div>

              <div className="space-y-4">
                {currentPatient.treatments?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No treatment regimens scheduled yet.</p>
                ) : (
                  currentPatient.treatments?.map(treatment => {
                    const isCompleted = treatment.status === 'Completed';
                    const isDiscontinued = treatment.status === 'Discontinued';
                    return (
                      <div key={treatment._id} className="p-4 border border-border rounded-xl bg-background/50 hover:bg-background transition-colors flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-primary">{treatment.treatmentType}</h4>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : isDiscontinued
                                ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                                : 'bg-blue-500/10 text-blue-600 border border-blue-500/20 animate-pulse'
                            }`}>
                              {treatment.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Doctor: <span className="font-semibold text-foreground">{treatment.treatingDoctor}</span>
                          </p>
                          {treatment.dosage && (
                            <p className="text-xs text-muted-foreground">
                              Dosage / Schedule: <span className="font-mono text-foreground font-semibold">{treatment.dosage}</span>
                            </p>
                          )}
                          <div className="flex space-x-4 text-xs text-muted-foreground pt-1">
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-3.5 w-3.5" /> Start: {new Date(treatment.startDate).toLocaleDateString()}
                            </span>
                            {treatment.endDate && (
                              <span className="flex items-center">
                                <Calendar className="mr-1 h-3.5 w-3.5" /> End: {new Date(treatment.endDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {treatment.notes && (
                            <p className="text-xs italic text-muted-foreground border-l-2 border-border pl-2 mt-2">
                              "{treatment.notes}"
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openEditTreatment(treatment)}
                            className="p-1 rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTreatment(treatment._id)}
                            className="p-1 rounded text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: MEDICAL REPORTS */}
          {activeTab === 'reports' && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Diagnostics History</h3>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Upload className="mr-1 h-3.5 w-3.5" /> Upload Report
                </button>
              </div>

              <div className="space-y-4">
                {currentPatient.reports?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No diagnostic reports uploaded yet.</p>
                ) : (
                  currentPatient.reports?.filter(r => !r.parentReport).map(report => (
                    <div key={report._id} className="p-4 border border-border rounded-xl bg-background/50 hover:bg-background transition-colors flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm">{report.reportName}</h4>
                        <p className="text-xs text-muted-foreground">
                          Category: <span className="font-semibold">{report.reportType}</span> • Version:{' '}
                          <span className="font-bold text-primary">v{report.version}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Uploaded: {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Download, Version, Delete actions */}
                      <div className="flex space-x-1">
                        <button
                          onClick={() => window.open(report.fileUrl, '_blank')}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent"
                          title="Download File"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openVersionUpload(report._id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          title="Upload Newer Version"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openHistoryView(report._id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-amber-50/10 dark:hover:bg-amber-500/10 hover:text-amber-500"
                          title="Version History"
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report._id)}
                          className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                          title="Delete File"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: BILLING RECEIPTS */}
          {activeTab === 'billing' && (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Billing Receipts</h3>
                <button
                  onClick={() => setShowReceiptModal(true)}
                  className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Create Invoice
                </button>
              </div>

              <div className="space-y-4">
                {currentPatient.receipts?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No payment receipts logged yet.</p>
                ) : (
                  currentPatient.receipts?.map(receipt => (
                    <div key={receipt._id} className="p-4 border border-border rounded-xl bg-background/50 hover:bg-background transition-colors flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm font-mono">{receipt.receiptNumber}</h4>
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            {receipt.paymentMode}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{receipt.description}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Logged: {new Date(receipt.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right flex items-center space-x-4">
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-bold text-sm text-teal-600">Rs. {receipt.amount.toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => handleDownloadReceipt(receipt._id)}
                          className="p-2 border border-border rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          title="Stream PDF Invoice"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- SCHEDULE TREATMENT MODAL --- */}
      {showTreatmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 mb-4">
              {editingTreatmentId ? 'Modify Treatment Regimen' : 'Schedule Treatment Regimen'}
            </h3>
            <form onSubmit={handleTreatmentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Treatment Type</label>
                  <select
                    value={treatmentForm.treatmentType}
                    onChange={e => setTreatmentForm({ ...treatmentForm, treatmentType: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="Chemotherapy">Chemotherapy</option>
                    <option value="Radiation">Radiation</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Immunotherapy">Immunotherapy</option>
                    <option value="Targeted Therapy">Targeted Therapy</option>
                    <option value="Hormonal Therapy">Hormonal Therapy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
                  <select
                    value={treatmentForm.status}
                    onChange={e => setTreatmentForm({ ...treatmentForm, status: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Discontinued">Discontinued</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={treatmentForm.startDate}
                    onChange={e => setTreatmentForm({ ...treatmentForm, startDate: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={treatmentForm.endDate}
                    onChange={e => setTreatmentForm({ ...treatmentForm, endDate: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Cycle Number</label>
                  <input
                    type="number"
                    value={treatmentForm.cycleNumber}
                    onChange={e => setTreatmentForm({ ...treatmentForm, cycleNumber: parseInt(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Dosage / Schedule</label>
                  <input
                    type="text"
                    value={treatmentForm.dosage}
                    placeholder="e.g. 500mg IV / Weekly"
                    onChange={e => setTreatmentForm({ ...treatmentForm, dosage: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Treating Doctor *</label>
                <input
                  type="text"
                  required
                  value={treatmentForm.treatingDoctor}
                  placeholder="Dr. Rajesh Kumar"
                  onChange={e => setTreatmentForm({ ...treatmentForm, treatingDoctor: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Notes / Recommendations</label>
                <textarea
                  value={treatmentForm.notes}
                  rows="2"
                  onChange={e => setTreatmentForm({ ...treatmentForm, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Follow-Up Date</label>
                <input
                  type="date"
                  value={treatmentForm.followUpDate}
                  onChange={e => setTreatmentForm({ ...treatmentForm, followUpDate: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={closeTreatmentModal}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/95"
                >
                  Save Regimen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- UPLOAD REPORT MODAL --- */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 mb-4">
              {parentReportId ? 'Upload New Report Version' : 'Upload Medical Report'}
            </h3>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Report Description Name</label>
                <input
                  type="text"
                  value={reportForm.reportName}
                  placeholder="e.g. MRI Scans, Biopsy Summary"
                  onChange={e => setReportForm({ ...reportForm, reportName: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              
              {!parentReportId && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Report Category</label>
                  <select
                    value={reportForm.reportType}
                    onChange={e => setReportForm({ ...reportForm, reportType: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="Pathology">Pathology</option>
                    <option value="Radiology">Radiology</option>
                    <option value="Blood Work">Blood Work</option>
                    <option value="Biopsy">Biopsy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Select File *</label>
                <input
                  type="file"
                  required
                  onChange={e => setReportForm({ ...reportForm, file: e.target.files[0] })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/95"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE RECEIPT MODAL --- */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 mb-4">
              Generate Billing Receipt
            </h3>
            <form onSubmit={handleReceiptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Payment Amount (INR) *</label>
                <input
                  type="number"
                  required
                  value={receiptForm.amount}
                  placeholder="e.g. 5000"
                  onChange={e => setReceiptForm({ ...receiptForm, amount: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Payment Mode</label>
                <select
                  value={receiptForm.paymentMode}
                  onChange={e => setReceiptForm({ ...receiptForm, paymentMode: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Description / Particulars *</label>
                <input
                  type="text"
                  required
                  value={receiptForm.description}
                  placeholder="e.g. Chemo infusion setup & drugs"
                  onChange={e => setReceiptForm({ ...receiptForm, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/95"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VERSION HISTORY TIMELINE MODAL --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2 mb-4">
              Diagnostic Report Document History
            </h3>
            
            <div className="max-h-80 overflow-y-auto space-y-4 pr-1 my-4">
              {reportVersions.map((versionDoc, idx) => (
                <div key={versionDoc._id} className="relative pl-6 border-l-2 border-primary/30 py-1">
                  {/* Circle dot on timeline */}
                  <span className="absolute -left-1.5 top-2.5 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold">
                        Version {versionDoc.version}{' '}
                        {idx === 0 && (
                          <span className="ml-1 text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 py-0.5 rounded font-semibold uppercase">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] font-semibold text-muted-foreground">{versionDoc.reportName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Uploaded by: {versionDoc.uploadedBy?.name} on {new Date(versionDoc.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => window.open(versionDoc.fileUrl, '_blank')}
                      className="p-1 rounded text-primary hover:bg-primary/10"
                      title="Download Version"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setShowHistoryModal(false);
                  dispatch(clearHistory());
                }}
                className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-accent"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
