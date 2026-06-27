import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { addPatient, editPatient, fetchPatientById, clearCurrentPatient } from '../features/patientSlice';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddEditPatient() {
  const { id } = useParams();
  const isEditMode = !!id;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPatient, loading, error } = useSelector(state => state.patients);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: '',
      dob: '',
      gender: 'Male',
      bloodGroup: 'B+',
      contactNumber: '',
      email: '',
      address: {
        street: '',
        city: '',
        district: '',
        state: '',
        pinCode: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        contactNumber: ''
      },
      cancerType: 'Blood Cancer',
      stage: 'Stage I',
      diagnosisDate: '',
      primaryPhysician: '',
      clinicalStatus: 'Active Treatment'
    }
  });

  // Load patient on Edit Mode
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchPatientById(id));
    } else {
      dispatch(clearCurrentPatient());
      reset();
    }
  }, [id, isEditMode, dispatch, reset]);

  // Populate form values when patient loads
  useEffect(() => {
    if (isEditMode && currentPatient) {
      const formattedDob = currentPatient.dob ? new Date(currentPatient.dob).toISOString().split('T')[0] : '';
      const formattedDiagnosisDate = currentPatient.cancerDetails?.diagnosisDate
        ? new Date(currentPatient.cancerDetails.diagnosisDate).toISOString().split('T')[0]
        : '';

      reset({
        name: currentPatient.name || '',
        dob: formattedDob,
        gender: currentPatient.gender || 'Male',
        bloodGroup: currentPatient.bloodGroup || 'B+',
        contactNumber: currentPatient.contactNumber || '',
        email: currentPatient.email || '',
        address: {
          street: currentPatient.address?.street || '',
          city: currentPatient.address?.city || '',
          district: currentPatient.address?.district || '',
          state: currentPatient.address?.state || '',
          pinCode: currentPatient.address?.pinCode || ''
        },
        emergencyContact: {
          name: currentPatient.emergencyContact?.name || '',
          relationship: currentPatient.emergencyContact?.relationship || '',
          contactNumber: currentPatient.emergencyContact?.contactNumber || ''
        },
        cancerType: currentPatient.cancerDetails?.cancerType || 'Blood Cancer',
        stage: currentPatient.cancerDetails?.stage || 'Stage I',
        diagnosisDate: formattedDiagnosisDate,
        primaryPhysician: currentPatient.cancerDetails?.primaryPhysician || '',
        clinicalStatus: currentPatient.cancerDetails?.status || 'Active Treatment'
      });
    }
  }, [currentPatient, isEditMode, reset]);

  const onSubmit = data => {
    if (isEditMode) {
      dispatch(editPatient({ id, patientData: data })).then(res => {
        if (!res.error) navigate(`/patients/${id}`);
      });
    } else {
      dispatch(addPatient(data)).then(res => {
        if (!res.error) navigate('/patients');
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to={isEditMode ? `/patients/${id}` : '/patients'}
          className="p-2 border border-border bg-card text-muted-foreground hover:text-foreground rounded-lg shadow-sm transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {isEditMode ? 'Modify Patient Registry File' : 'Onboard New Patient'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isEditMode ? 'Update demographic and clinical details' : 'Register a new patient and record diagnostic profiles.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Demographics */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2">
            1. Personal Demographics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                {...register('name')}
                placeholder="John Doe"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Date of Birth *</label>
              <input
                type="date"
                required
                {...register('dob')}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Gender *</label>
              <select
                {...register('gender')}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Blood Group</label>
              <select
                {...register('bloodGroup')}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone Number *</label>
              <input
                type="text"
                required
                {...register('contactNumber')}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email Address</label>
              <input
                type="email"
                {...register('email')}
                placeholder="john.doe@example.com"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2">
            2. Address & Geography
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Street Address</label>
              <input
                type="text"
                {...register('address.street')}
                placeholder="Flat No, Block, Society name"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">City / Town</label>
              <input
                type="text"
                {...register('address.city')}
                placeholder="New Delhi"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">District *</label>
              <input
                type="text"
                required
                {...register('address.district')}
                placeholder="Central Delhi"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">State *</label>
              <input
                type="text"
                required
                {...register('address.state')}
                placeholder="Delhi"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">PIN Code *</label>
              <input
                type="text"
                required
                {...register('address.pinCode')}
                placeholder="110001"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contact */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2">
            3. Emergency Contacts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Contact Name *</label>
              <input
                type="text"
                required
                {...register('emergencyContact.name')}
                placeholder="Mary Doe"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Relationship *</label>
              <input
                type="text"
                required
                {...register('emergencyContact.relationship')}
                placeholder="Spouse, Parent"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone Number *</label>
              <input
                type="text"
                required
                {...register('emergencyContact.contactNumber')}
                placeholder="+91 XXXXX XXXXX"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Initial Registry (Cancer details) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2">
            4. Clinical Diagnosis & Staging
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Cancer Category *</label>
              <select
                {...register('cancerType')}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Blood Cancer">Blood Cancer</option>
                <option value="Lung Cancer">Lung Cancer</option>
                <option value="Breast Cancer">Breast Cancer</option>
                <option value="Oral Cancer">Oral Cancer</option>
                <option value="Liver Cancer">Liver Cancer</option>
                <option value="Brain Cancer">Brain Cancer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Clinical Staging *</label>
              <select
                {...register('stage')}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Stage 0">Stage 0</option>
                <option value="Stage I">Stage I</option>
                <option value="Stage II">Stage II</option>
                <option value="Stage III">Stage III</option>
                <option value="Stage IV">Stage IV</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Diagnosis Date *</label>
              <input
                type="date"
                required
                {...register('diagnosisDate')}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Primary Oncologist *</label>
              <input
                type="text"
                required
                {...register('primaryPhysician')}
                placeholder="Dr. Rajesh Kumar"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Patient Clinical Status *</label>
              <select
                {...register('clinicalStatus')}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Active Treatment">Active Treatment</option>
                <option value="Remission">Remission</option>
                <option value="Relapsed">Relapsed</option>
                <option value="Palliative">Palliative</option>
                <option value="Deceased">Deceased</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Action buttons */}
        <div className="flex justify-end space-x-3">
          <Link
            to={isEditMode ? `/patients/${id}` : '/patients'}
            className="px-4 py-2 border border-border bg-card text-sm font-semibold rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg text-sm shadow hover:bg-primary/95 transition-all"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEditMode ? 'Save Registry Changes' : 'Confirm Registration'}
          </button>
        </div>
      </form>
    </div>
  );
}
