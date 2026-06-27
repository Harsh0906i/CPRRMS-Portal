import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchPatients, removePatient } from '../features/patientSlice';
import { Search, Plus, Filter, Eye, Edit, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Patients() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patients, total, page, pages, loading, error } = useSelector(state => state.patients);

  // Filter States
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState('');
  const [cancerType, setCancerType] = useState('');
  const [stage, setStage] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [district, setDistrict] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  
  // Sort States
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Trigger dispatch on changes
  const loadPatients = (pageNumber = 1) => {
    const params = {
      page: pageNumber,
      limit: 10,
      sortBy,
      sortOrder,
      search: search || undefined,
      gender: gender || undefined,
      cancerType: cancerType || undefined,
      stage: stage || undefined,
      state: stateFilter || undefined,
      district: district || undefined,
      minAge: minAge || undefined,
      maxAge: maxAge || undefined
    };
    dispatch(fetchPatients(params));
  };

  useEffect(() => {
    loadPatients(1);
  }, [dispatch, gender, cancerType, stage, stateFilter, district, sortBy, sortOrder]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    loadPatients(1);
  };

  const handleDelete = id => {
    if (window.confirm('Are you absolutely sure you want to delete this patient? All reports, receipts and treatments will be permanently deleted!')) {
      dispatch(removePatient(id)).then(() => {
        loadPatients(page);
      });
    }
  };

  const handleSort = field => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Patient Registry Database</h2>
          <p className="text-sm text-muted-foreground">
            Search, filter, and manage patient records and oncology registrations.
          </p>
        </div>
        <Link
          to="/patients/add"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm shadow hover:bg-primary/90 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Register New Patient
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
        {/* Row 1: Search Form & Gender Filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, ID, contact, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-24 py-2 bg-background border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded hover:bg-primary/95"
            >
              Search
            </button>
          </form>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground focus:outline-none"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={cancerType}
              onChange={e => setCancerType(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground focus:outline-none"
            >
              <option value="">All Cancers</option>
              <option value="Blood Cancer">Blood Cancer</option>
              <option value="Lung Cancer">Lung Cancer</option>
              <option value="Breast Cancer">Breast Cancer</option>
              <option value="Oral Cancer">Oral Cancer</option>
              <option value="Liver Cancer">Liver Cancer</option>
              <option value="Brain Cancer">Brain Cancer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Row 2: Advanced filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-border/50">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Stage</label>
            <select
              value={stage}
              onChange={e => setStage(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="">All Stages</option>
              <option value="Stage 0">Stage 0</option>
              <option value="Stage I">Stage I</option>
              <option value="Stage II">Stage II</option>
              <option value="Stage III">Stage III</option>
              <option value="Stage IV">Stage IV</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">State</label>
            <input
              type="text"
              placeholder="e.g. Delhi"
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">District</label>
            <input
              type="text"
              placeholder="e.g. Central"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Min Age</label>
            <input
              type="number"
              placeholder="Min"
              value={minAge}
              onChange={e => setMinAge(e.target.value)}
              onBlur={() => loadPatients(1)}
              className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Max Age</label>
            <input
              type="number"
              placeholder="Max"
              value={maxAge}
              onChange={e => setMaxAge(e.target.value)}
              onBlur={() => loadPatients(1)}
              className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      {/* Patient Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground text-xs uppercase font-bold border-b border-border">
                <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('patientId')}>
                  Patient ID <ArrowUpDown className="inline h-3 w-3 ml-1" />
                </th>
                <th className="px-6 py-4 cursor-pointer select-none" onClick={() => handleSort('name')}>
                  Name <ArrowUpDown className="inline h-3 w-3 ml-1" />
                </th>
                <th className="px-6 py-4">Age / Sex</th>
                <th className="px-6 py-4">Location (District)</th>
                <th className="px-6 py-4">Cancer Diagnosis</th>
                <th className="px-6 py-4">Stage</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-6 py-6 h-12 bg-muted/10"></td>
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-muted-foreground">
                    No registry patients match the filter criteria.
                  </td>
                </tr>
              ) : (
                patients.map(patient => {
                  const birthDate = new Date(patient.dob);
                  const age = new Date().getFullYear() - birthDate.getFullYear();
                  
                  return (
                    <tr key={patient._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-primary">{patient.patientId}</td>
                      <td className="px-6 py-4 font-bold">{patient.name}</td>
                      <td className="px-6 py-4 text-xs">
                        {age} yrs / <span className="font-semibold">{patient.gender}</span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {patient.address?.district}, {patient.address?.state}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-teal-600 dark:text-teal-400">
                        {patient.cancerDetails?.cancerType || 'Not Logged'}
                      </td>
                      <td className="px-6 py-4">
                        {patient.cancerDetails ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            {patient.cancerDetails.stage}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            to={`/patients/${patient._id}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/patients/edit/${patient._id}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-emerald-50/10 dark:hover:bg-emerald-500/10 hover:text-emerald-500 transition-all"
                            title="Edit Details"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(patient._id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                            title="Delete Registry File"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && pages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing page <span className="font-bold">{page}</span> of <span className="font-bold">{pages}</span> (Total: {total} records)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => loadPatients(page - 1)}
                className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === pages}
                onClick={() => loadPatients(page + 1)}
                className="p-2 border border-border rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-50 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
