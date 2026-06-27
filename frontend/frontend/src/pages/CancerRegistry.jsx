import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPatients } from '../features/patientSlice';
import { Activity, ShieldAlert, Award, FileSpreadsheet, Eye } from 'lucide-react';

export default function CancerRegistry() {
  const dispatch = useDispatch();
  const { patients, loading } = useSelector(state => state.patients);
  const [selectedCancer, setSelectedCancer] = useState('Blood Cancer');

  const cancerTypes = [
    'Blood Cancer',
    'Lung Cancer',
    'Breast Cancer',
    'Oral Cancer',
    'Liver Cancer',
    'Brain Cancer'
  ];

  useEffect(() => {
    dispatch(
      fetchPatients({
        cancerType: selectedCancer,
        limit: 100 // Load all for this subset to show stats
      })
    );
  }, [selectedCancer, dispatch]);

  // Compute breakdown stats for selected cancer type
  const totalCases = patients.length;
  const stageI = patients.filter(p => p.cancerDetails?.stage === 'Stage I').length;
  const stageII = patients.filter(p => p.cancerDetails?.stage === 'Stage II').length;
  const stageIII = patients.filter(p => p.cancerDetails?.stage === 'Stage III').length;
  const stageIV = patients.filter(p => p.cancerDetails?.stage === 'Stage IV').length;
  const inRemission = patients.filter(p => p.cancerDetails?.status === 'Remission').length;

  const cardStats = [
    { title: 'Registered Cases', value: totalCases, icon: FileSpreadsheet, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Stage I & II', value: stageI + stageII, icon: Award, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Stage III & IV', value: stageIII + stageIV, icon: ShieldAlert, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Clinical Remissions', value: inRemission, icon: Activity, color: 'text-teal-500 bg-teal-500/10' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Oncology Disease Registry</h2>
        <p className="text-sm text-muted-foreground">
          Categorized registry logs used for disease surveillance and clinical research.
        </p>
      </div>

      {/* Navigation tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-px">
        {cancerTypes.map(type => (
          <button
            key={type}
            onClick={() => setSelectedCancer(type)}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
              selectedCancer === type
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cardStats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.title}</p>
                <p className="text-2xl font-extrabold">{loading ? '...' : stat.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Patient Sub-registry table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{selectedCancer} Cohort</h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {totalCases} cases registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground text-xs uppercase font-bold border-b border-border">
                <th className="px-6 py-4">Patient ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Age / Gender</th>
                <th className="px-6 py-4">Staging</th>
                <th className="px-6 py-4">Treatment Status</th>
                <th className="px-6 py-4">Diagnosis Date</th>
                <th className="px-6 py-4">Primary Physician</th>
                <th className="px-6 py-4 text-center">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="8" className="px-6 py-5 h-12 bg-muted/10"></td>
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">
                    No registry patients recorded for {selectedCancer}.
                  </td>
                </tr>
              ) : (
                patients.map(p => {
                  const birthDate = new Date(p.dob);
                  const age = new Date().getFullYear() - birthDate.getFullYear();
                  return (
                    <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-primary">{p.patientId}</td>
                      <td className="px-6 py-4 font-bold">{p.name}</td>
                      <td className="px-6 py-4 text-xs">
                        {age} yrs / {p.gender}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          {p.cancerDetails?.stage || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        {p.cancerDetails?.status || 'Active Treatment'}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {p.cancerDetails?.diagnosisDate
                          ? new Date(p.cancerDetails.diagnosisDate).toLocaleDateString()
                          : 'Not available'}
                      </td>
                      <td className="px-6 py-4 text-xs">{p.cancerDetails?.primaryPhysician}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Link
                            to={`/patients/${p._id}`}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
