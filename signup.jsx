import React, { useEffect, useState } from 'react';

// SignupAndDashboard.jsx
// Single-file React component demonstrating:
// - a sign-up form that shows "Signed up successfully" on success
// - a notification system that sends the admin the new user's info EXCEPT the password
// - a simple dashboard listing users (without showing passwords)
//
// Notes (important security):
// - This example stores users in localStorage for demo only. In production, you MUST send signups to
//   a backend API that stores credentials securely (bcrypt/argon2 with salt) and never sends passwords
//   over notifications or email.
// - We hash the password client-side with SHA-256 here only to avoid storing raw passwords in localStorage
//   (this is not a replacement for secure server-side hashing/salting).

export default function SignupAndDashboard() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [extra, setExtra] = useState('');

  const [users, setUsers] = useState([]); // persisted users (contains hashedPassword but we won't show it)
  const [notifications, setNotifications] = useState([]); // admin notifications
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('demo_users');
    const storedNotifs = localStorage.getItem('demo_notifs');
    if (stored) setUsers(JSON.parse(stored));
    if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
  }, []);

  useEffect(() => {
    localStorage.setItem('demo_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('demo_notifs', JSON.stringify(notifications));
  }, [notifications]);

  // helper to hash password using Web Crypto API -> hex
  async function hashPassword(plain) {
    const enc = new TextEncoder();
    const data = enc.encode(plain);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setToast({ type: 'error', text: 'Please fill name, email and password.' });
      window.setTimeout(() => setToast(null), 3000);
      return;
    }

    // create user object; do not include raw password in notifications
    const hashed = await hashPassword(password);
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      extra: extra.trim(),
      createdAt: new Date().toISOString(),
      hashedPassword: hashed // stored but never shown
    };

    // store user
    setUsers(prev => [newUser, ...prev]);

    // create an admin notification that CONTAINS everything except the password
    const notif = {
      id: 'n_' + newUser.id,
      title: 'New user signed up',
      time: new Date().toISOString(),
      payload: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        extra: newUser.extra,
        createdAt: newUser.createdAt
      }
    };
    setNotifications(prev => [notif, ...prev]);

    // show success message to the user
    setToast({ type: 'success', text: 'Signed up successfully' });
    window.setTimeout(() => setToast(null), 4000);

    // clear form (but not the dashboard)
    setName('');
    setEmail('');
    setPassword('');
    setExtra('');
  }

  function clearNotifications() {
    setNotifications([]);
  }

  function removeUser(id) {
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Signup column */}
        <div className="col-span-1 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sign up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <div className="text-sm text-gray-600">Full name</div>
              <input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded p-2 border" />
            </label>
            <label className="block">
              <div className="text-sm text-gray-600">Email</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded p-2 border" />
            </label>
            <label className="block">
              <div className="text-sm text-gray-600">Password</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded p-2 border" />
            </label>
            <label className="block">
              <div className="text-sm text-gray-600">Extra info (phone, role, etc.)</div>
              <input value={extra} onChange={e => setExtra(e.target.value)} className="mt-1 w-full rounded p-2 border" />
            </label>

            <button className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium">Create account</button>

            <div className="text-sm text-gray-500">By signing up you will see a dashboard entry and the admin will receive a notification containing your details <strong>except</strong> the password.</div>
          </form>

          {/* Toast message */}
          {toast && (
            <div className={`mt-4 p-3 rounded-lg ${toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="font-medium">{toast.text}</div>
            </div>
          )}
        </div>

        {/* Notifications column */}
        <div className="col-span-1 bg-white rounded-2xl shadow p-6">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <button onClick={clearNotifications} className="text-sm text-gray-500 underline">Clear</button>
          </div>

          {notifications.length === 0 ? (
            <div className="mt-4 text-sm text-gray-500">No notifications yet.</div>
          ) : (
            <ul className="mt-4 space-y-3">
              {notifications.map(n => (
                <li key={n.id} className="p-3 border rounded">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-gray-500">{new Date(n.time).toLocaleString()}</div>
                  <div className="mt-2 text-sm">
                    <div><strong>Name:</strong> {n.payload.name}</div>
                    <div><strong>Email:</strong> {n.payload.email}</div>
                    {n.payload.extra && <div><strong>Extra:</strong> {n.payload.extra}</div>}
                    <div className="text-xs text-gray-400 mt-1">(Password is never included in notifications)</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dashboard (spans full width) */}
        <div className="col-span-3 md:col-span-3 bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Admin Dashboard</h2>
            <div className="text-sm text-gray-600">Users: {users.length}</div>
          </div>

          {users.length === 0 ? (
            <div className="text-sm text-gray-500">No users yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {users.map(u => (
                <div key={u.id} className="border rounded p-4">
                  <div className="font-medium text-lg">{u.name}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                  {u.extra && <div className="mt-2 text-sm">{u.extra}</div>}
                  <div className="mt-3 text-xs text-gray-400">Created: {new Date(u.createdAt).toLocaleString()}</div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => removeUser(u.id)} className="px-3 py-1 rounded bg-red-100 text-red-700 text-sm">Remove</button>
                    <button onClick={() => navigator.clipboard.writeText(JSON.stringify({ id: u.id, name: u.name, email: u.email, extra: u.extra }))} className="px-3 py-1 rounded bg-gray-100 text-sm">Copy info</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Small footer note */}
      <div className="max-w-6xl mx-auto mt-6 text-xs text-gray-500">
        <strong>Security note:</strong> This demo hides passwords from notifications and stores only a client-side hash. For production, implement server-side salted hashing (bcrypt/argon2), TLS, rate-limiting, email verification, and follow privacy laws (GDPR/CCPA) as needed.
      </div>
    </div>
  );
}
