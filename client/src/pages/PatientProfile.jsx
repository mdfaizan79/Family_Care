import React, { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../api.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';

export default function PatientProfile() {
  const { user, login } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { success, error: showError } = useNotification();
  const { data, isLoading, error } = useQuery('patient-records', async () => (await api.get('/patient-records')).data);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', password: '' });
  const updateMutation = useMutation(
    (payload) => api.patch('/users/me', payload),
    {
      onSuccess: (res) => {
        success('Profile updated successfully!');
        setEditMode(false);
        login(res.data, localStorage.getItem('token'));
      },
      onError: (err) => showError(err.response?.data?.message || 'Update failed'),
    }
  );

  if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Failed to load profile</div>;

  const record = data?.find(r => r.patient._id === user.id);

  // Feedback viewing
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  useEffect(() => {
    setFeedbackLoading(true);
    api.get('/feedback/mine')
      .then(res => setFeedbacks(res.data))
      .catch(() => showError('Failed to load feedback'))
      .finally(() => setFeedbackLoading(false));
  }, [showError]);

  const handleEdit = () => {
    setForm({ name: user.name, phone: user.phone || '', password: '' });
    setEditMode(true);
  };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = e => {
    e.preventDefault();
    updateMutation.mutate({
      name: form.name,
      phone: form.phone,
      ...(form.password ? { password: form.password } : {})
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile & Medical History</h1>
      <div className="bg-white rounded shadow p-4 mb-4">
        {editMode ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block mb-1">Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block mb-1">Password (leave blank to keep unchanged)</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Save</button>
              <button type="button" onClick={() => setEditMode(false)} className="bg-gray-400 text-white px-4 py-1 rounded">Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="font-semibold">Name: {user.name}</div>
            <div>Email: {user.email}</div>
            <div>Phone: {user.phone || 'N/A'}</div>
            <button onClick={handleEdit} className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Edit Profile</button>
          </>
        )}
      </div>
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-semibold mb-2">My Feedback & Ratings</h2>
        {feedbackLoading ? (
          <div>Loading feedback...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-gray-500">No feedback found</div>
        ) : (
          <ul className="list-disc list-inside text-gray-700 mb-4">
            {feedbacks.length ? feedbacks.map((f, i) => (
              <li key={i} className="mb-2">
                <span className="font-semibold">Doctor:</span> {f.doctor?.user?.name || 'N/A'} | <span className="font-semibold">Department:</span> {f.department?.name || 'N/A'}<br/>
                <span className="font-semibold">Date:</span> {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ''} | <span className="font-semibold">Rating:</span> {f.rating}/5<br/>
                <span className="font-semibold">Comment:</span> {f.comment || 'No comment'}
              </li>
            )) : <li>No feedback submitted yet.</li>}
          </ul>
        )}
      </div>
      {record ? (
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">Medical History</h2>
          <ul className="list-disc list-inside text-gray-700">
            {record.medicalHistory?.length ? record.medicalHistory.map((item, i) => <li key={i}>{item}</li>) : <li>No medical history found.</li>}
          </ul>
          <h2 className="font-semibold mt-4 mb-2">Prescriptions</h2>
          <ul className="list-disc list-inside text-gray-700">
            {record.prescriptions?.length ? record.prescriptions.map((p, i) => (
              <li key={i}>{p.date?.slice(0,10)} - {p.description} {p.fileUrl && (<a href={p.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-2">Download</a>)}</li>
            )) : <li>No prescriptions found.</li>}
          </ul>
          <h2 className="font-semibold mt-4 mb-2">Lab Reports</h2>
          <ul className="list-disc list-inside text-gray-700">
            {record.labReports?.length ? record.labReports.map((r, i) => (
              <li key={i}>{r.date?.slice(0,10)} - {r.type}: {r.result} {r.fileUrl && (<a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-2">Download</a>)}</li>
            )) : <li>No lab reports found.</li>}
          </ul>

          <h2 className="font-semibold mt-4 mb-2">Uploaded Documents</h2>
          <PatientFileUpload onUpload={() => queryClient.invalidateQueries('patient-records')} />
          <ul className="list-disc list-inside text-gray-700 mt-2">
            {record.documents?.length ? record.documents.map((doc, i) => (
              <li key={i} className="mb-1">
                <span className="font-medium">{doc.filename}</span> ({doc.description || 'No description'})
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-2">Download</a>
                <span className="text-gray-500 ml-2 text-xs">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}</span>
              </li>
            )) : <li>No documents uploaded.</li>}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded shadow p-4">No medical record found.</div>
      )}

    </div>
  );
}
